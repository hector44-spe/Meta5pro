export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verify2FaTempToken, isAuthorizedAdminEmail } from "@/lib/auth";
import { generateTotpSecret, generateOtpAuthUri, generateQrCodeDataUrl } from "@/lib/totp";
import { encryptSecret } from "@/lib/secret-box";

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    let email: string | null = null;

    // Check either temp token in body/header OR active admin session
    const body = await req.json().catch(() => ({}));
    const tempToken = body.tempToken || req.headers.get("x-temp-token");

    if (tempToken) {
      const decoded = verify2FaTempToken(tempToken);
      if (decoded && decoded.role === "ADMIN" && isAuthorizedAdminEmail(decoded.email)) {
        userId = decoded.userId;
        email = decoded.email;
      }
    }

    if (!userId) {
      const session = await getSession();
      if (session?.role === "ADMIN" && isAuthorizedAdminEmail(session.email)) {
        userId = session.userId;
        email = session.email;
      }
    }

    if (!userId || !email) {
      return NextResponse.json({ error: "Unauthorized: Admin verification required" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true, status: true },
    });
    if (!admin || admin.role !== "ADMIN" || admin.status !== "ACTIVE" || admin.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized: Active administrator required" }, { status: 401 });
    }

    // Generate new secret & QR code
    const secret = generateTotpSecret(20);
    const otpAuthUri = generateOtpAuthUri(email, secret, "Meta5VIP");
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUri);

    // Save temporary secret to user record
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorTempSecret: encryptSecret(secret) },
    });

    return NextResponse.json({
      success: true,
      secret,
      qrCode: qrCodeDataUrl,
      otpAuthUri,
      email,
    });
  } catch (error) {
    console.error("2FA Setup error:", error);
    return NextResponse.json({ error: "Internal server error during 2FA setup" }, { status: 500 });
  }
}
