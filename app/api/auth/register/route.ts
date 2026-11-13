import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE, rateLimited, clientIp } from "@/lib/auth";
import { z } from "zod";
import { notify } from "@/lib/notify";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    if (rateLimited(`register:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many sign-ups from this address. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const username = email.split("@")[0] + "_" + crypto.randomInt(1000, 10000);

    // Create user and initial wallet
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        fullName: `${firstName} ${lastName}`.trim(),
        phoneNumber: phone || null,
        passwordHash,
        role: "INVESTOR",
        status: "ACTIVE",
        wallet: {
          create: {
            mainBalance: 0.0,
            interestBalance: 0.0,
            totalDeposited: 0.0,
            totalWithdrawn: 0.0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    await notify(user.id, "account", "Welcome to Meta Gold 5", "Your account is ready. Make a deposit to get started.");

    // Sign session token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        wallet: user.wallet,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 },
    );
  }
}
