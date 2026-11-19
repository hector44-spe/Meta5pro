export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorizedAdminEmail, signToken, AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN" || !isAuthorizedAdminEmail(session.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorTempSecret: null,
        twoFactorBackupCodes: [],
      },
      select: {
        id: true,
        email: true,
        role: true,
        username: true,
        tokenVersion: true,
      },
    });

    await prisma.twoFactorBackupCode.deleteMany({
      where: { userId: session.userId },
    });

    // Re-issue cookie without 2FA requirement
    const token = signToken({
      userId: updated.id,
      email: updated.email,
      role: "ADMIN",
      username: updated.username,
      tokenVersion: updated.tokenVersion,
      twoFactorRequired: false,
      twoFactorVerified: false,
    });

    const response = NextResponse.json({
      success: true,
      message: "Two-Factor Authentication has been disabled.",
    });

    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return NextResponse.json({ error: "Failed to disable 2FA" }, { status: 500 });
  }
}
