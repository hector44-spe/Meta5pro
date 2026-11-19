export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify2FaTempToken, signToken, AUTH_COOKIE, isAuthorizedAdminEmail, rateLimited, clearRateLimit, clientIp } from "@/lib/auth";
import { verifyTotpCode } from "@/lib/totp";
import { decryptSecret, encryptSecret, isEncryptedSecret } from "@/lib/secret-box";
import bcrypt from "bcryptjs";
import { z } from "zod";

const verifySchema = z.object({
  tempToken: z.string().min(10, "Temporary session token is required"),
  code: z.string().min(6).max(12, "Code must be 6 digits or 8-character backup code"),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = verifySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { tempToken, code } = parsed.data;
    const ip = clientIp(req);

    const decoded = verify2FaTempToken(tempToken);
    if (!decoded || !decoded.userId || !isAuthorizedAdminEmail(decoded.email)) {
      return NextResponse.json(
        { error: "Session expired or invalid. Please log in again." },
        { status: 401 }
      );
    }

    const limitKey = `2fa:${ip}:${decoded.userId}`;
    if (await rateLimited(limitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please wait 15 minutes before retrying." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        status: true,
        tokenVersion: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user || user.status !== "ACTIVE" || !isAuthorizedAdminEmail(user.email)) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA is not configured for this account." }, { status: 400 });
    }

    // Try TOTP code first
    const decryptedSecret = decryptSecret(user.twoFactorSecret);
    const isTotpValid = verifyTotpCode(code, decryptedSecret);
    let usedBackup = false;
    let remainingCodeCount = 0;

    if (!isTotpValid) {
      // Move legacy array codes into individually consumable rows once. A unique
      // codeHash plus conditional usedAt update makes simultaneous use impossible.
      if (user.twoFactorBackupCodes.length > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.twoFactorBackupCode.createMany({
            data: user.twoFactorBackupCodes.map((codeHash) => ({ userId: user.id, codeHash })),
            skipDuplicates: true,
          });
          await tx.user.update({ where: { id: user.id }, data: { twoFactorBackupCodes: [] } });
        });
      }
      const availableCodes = await prisma.twoFactorBackupCode.findMany({
        where: { userId: user.id, usedAt: null },
        select: { id: true, codeHash: true },
      });
      let matchedId: string | null = null;
      for (const candidate of availableCodes) {
        if (await bcrypt.compare(code.trim().toUpperCase(), candidate.codeHash)) {
          matchedId = candidate.id;
          break;
        }
      }
      const consumed = matchedId
        ? await prisma.twoFactorBackupCode.updateMany({
            where: { id: matchedId, userId: user.id, usedAt: null },
            data: { usedAt: new Date() },
          })
        : { count: 0 };
      if (consumed.count !== 1) {
        return NextResponse.json(
          { error: "Incorrect authentication code. Please check your app or recovery code." },
          { status: 400 }
        );
      }
      usedBackup = true;
    }

    remainingCodeCount = await prisma.twoFactorBackupCode.count({ where: { userId: user.id, usedAt: null } });
    if (isTotpValid && !isEncryptedSecret(user.twoFactorSecret)) {
      await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: encryptSecret(decryptedSecret) } });
    }

    clearRateLimit(limitKey);

    // Issue verified admin session
    const fullToken = signToken({
      userId: user.id,
      email: user.email,
      role: "ADMIN",
      username: user.username,
      tokenVersion: user.tokenVersion,
      twoFactorRequired: true,
      twoFactorVerified: true,
    });

    const response = NextResponse.json({
      success: true,
      usedBackupCode: usedBackup,
      remainingBackupCodes: remainingCodeCount,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: "ADMIN",
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
    console.error("2FA Login Verification error:", error);
    return NextResponse.json({ error: "Internal server error during 2FA verification" }, { status: 500 });
  }
}
