export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verify2FaTempToken, isAuthorizedAdminEmail, signToken, AUTH_COOKIE, clientIp, rateLimited, clearRateLimit } from "@/lib/auth";
import { verifyTotpCode, generateBackupCodes } from "@/lib/totp";
import { decryptSecret } from "@/lib/secret-box";
import { z } from "zod";

const activateSchema = z.object({
  code: z.string().min(6).max(8),
  tempToken: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = activateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid 6-digit verification code" }, { status: 400 });
    }

    const { code, tempToken } = parsed.data;
    let userId: string | null = null;
    let email: string | null = null;

    if (tempToken) {
      const decoded = verify2FaTempToken(tempToken);
      if (decoded && decoded.role === "ADMIN" && decoded.needsSetup === true && isAuthorizedAdminEmail(decoded.email)) {
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

    const limitKey = `2fa-activate:${clientIp(req)}:${userId}`;
    if (await rateLimited(limitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many verification attempts. Try again in 15 minutes." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, fullName: true, role: true, status: true, tokenVersion: true, twoFactorTempSecret: true },
    });

    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE" || !isAuthorizedAdminEmail(user.email) || !user.twoFactorTempSecret) {
      return NextResponse.json({ error: "No pending 2FA setup found. Please restart setup." }, { status: 400 });
    }

    // Verify test TOTP code
    const decryptedTempSecret = decryptSecret(user.twoFactorTempSecret);
    const isValid = verifyTotpCode(code, decryptedTempSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect 6-digit code. Please check your authenticator app and try again." }, { status: 400 });
    }

    // Generate 8 one-time backup recovery codes
    const { plainCodes, hashedCodes } = generateBackupCodes(8);

    // Commit 2FA activation to user record
    const updated = await prisma.$transaction(async (tx) => {
      await tx.twoFactorBackupCode.deleteMany({ where: { userId: user.id } });
      await tx.twoFactorBackupCode.createMany({
        data: hashedCodes.map((codeHash) => ({ userId: user.id, codeHash })),
      });
      return tx.user.update({
        where: { id: user.id },
        data: {
          twoFactorSecret: user.twoFactorTempSecret,
          twoFactorTempSecret: null,
          twoFactorEnabled: true,
          twoFactorBackupCodes: [],
          tokenVersion: { increment: 1 },
        },
        select: { tokenVersion: true },
      });
    });
    clearRateLimit(limitKey);

    // Issue verified admin session token
    const fullToken = signToken({
      userId: user.id,
      email: user.email,
      role: "ADMIN",
      username: user.username,
      tokenVersion: updated.tokenVersion,
      twoFactorRequired: true,
      twoFactorVerified: true,
    });

    const response = NextResponse.json({
      success: true,
      message: "Two-Factor Authentication successfully activated!",
      backupCodes: plainCodes,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: "ADMIN",
        twoFactorEnabled: true,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE,
      value: fullToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("2FA Activation error:", error);
    return NextResponse.json({ error: "Internal server error during 2FA activation" }, { status: 500 });
  }
}
