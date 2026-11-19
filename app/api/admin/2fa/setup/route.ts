export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verify2FaTempToken, isAuthorizedAdminEmail } from "@/lib/auth";
import { generateTotpSecret, generateOtpAuthUri, generateQrCodeDataUrl } from "@/lib/totp";

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    let email: string | null = null;

    // Check either temp token in body/header OR active admin session
    const body = await req.json().catch(() => ({}));
    const tempToken = body.tempToken || req.headers.get("x-temp-token");

    if (tempToken) {
      const decoded = verify2FaTempToken(tempToken);
      if (decoded && isAuthorizedAdminEmail(decoded.email)) {
        userId = decoded.userId;
        email = decoded.email;
      }
    }

    if (!userId) {
      const session = await getSession();
      if (session && isAuthorizedAdminEmail(session.email)) {
        userId = session.userId;
        email = session.email;
      }
    }

    if (!userId || !email) {
      return NextResponse.json({ error: "Unauthorized: Admin verification required" }, { status: 401 });
    }

    // Generate new secret & QR code
    const secret = generateTotpSecret(20);
    const otpAuthUri = generateOtpAuthUri(email, secret, "Meta5VIP");
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUri);

    // Save temporary secret to user record
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorTempSecret: secret },
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
