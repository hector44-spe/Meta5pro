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

// A fixed bcrypt hash keeps unknown-account and wrong-password paths comparable.
const DUMMY_PASSWORD_HASH = "$2b$12$ykv6QjM8AXN0gMvvh76JAO0.7ssJsxHq8O8HzzB1eSRZyp4edJq6G";

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

    const ip = clientIp(req);
    const normalizedEmail = email.toLowerCase();
    const limitKey = `login:${ip}:${normalizedEmail}`;
    const limited = await Promise.all([
      rateLimited(limitKey, 5),
      rateLimited(`login-ip:${ip}`, 30),
      rateLimited(`login-account:${normalizedEmail}`, 10),
    ]);
    if (limited.some(Boolean)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 15 minutes and try again." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { wallet: true },
    });

    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!user || !valid || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    clearRateLimit(limitKey);

    // Authorized administrator accounts: challenge 2FA only if enabled
    if (user.role === "ADMIN") {
      const isAuthorized = isAuthorizedAdminEmail(user.email);
      if (!isAuthorized) {
        // Demote in database in background if unauthorized
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "INVESTOR", tokenVersion: { increment: 1 } },
        });
      } else if (user.twoFactorEnabled && user.twoFactorSecret) {
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
