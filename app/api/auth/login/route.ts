import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signToken,
  sign2FaTempToken,
  AUTH_COOKIE,
  isAuthorizedAdminEmail,
  rateLimited,
  clearRateLimit,
  clientIp,
} from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const limitKey = `login:${clientIp(req)}:${email.toLowerCase()}`;
    if (await rateLimited(limitKey, 5)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 15 minutes and try again." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Account has been suspended. Please contact compliance." },
        { status: 403 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    clearRateLimit(limitKey);

    // If account is an Admin, enforce Whitelist & check if 2FA is enabled
    if (user.role === "ADMIN") {
      const isAuthorized = isAuthorizedAdminEmail(user.email);
      if (!isAuthorized) {
        // Demote in database in background if unauthorized
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "INVESTOR", tokenVersion: { increment: 1 } },
        });
      } else if (user.twoFactorEnabled && user.twoFactorSecret) {
        // If admin has enabled 2FA, challenge for 6-digit TOTP code
        const tempToken = sign2FaTempToken({
          userId: user.id,
          email: user.email,
          role: "ADMIN",
          needsSetup: false,
        });
        return NextResponse.json({
          success: true,
          requires2FA: true,
          tempToken,
          message: "Two-Factor Authentication required.",
        });
      }
    }

    // Standard User or Admin (with 2FA opt-in) Session
    const isAdmin = user.role === "ADMIN" && isAuthorizedAdminEmail(user.email);
    const effectiveRole = isAdmin ? "ADMIN" : (user.role === "ADMIN" ? "INVESTOR" : user.role);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: effectiveRole,
      username: user.username,
      tokenVersion: user.tokenVersion,
      twoFactorRequired: !!user.twoFactorEnabled,
      twoFactorVerified: false,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: effectiveRole,
        wallet: user.wallet,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login" },
      { status: 500 },
    );
  }
}
