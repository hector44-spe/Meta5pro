export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import { z } from "zod";
import { rateLimited, clientIp } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mail";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const genericOk = NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link has been dispatched.",
    });

    if (rateLimited(`forgot:${clientIp(req)}:${email.toLowerCase()}`, 3, 60 * 60 * 1000)) {
      return genericOk;
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // For security, always show success even if email not found
    if (!user) return genericOk;

    // Generate cryptographic token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Invalidate any earlier unused tokens for this user
    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } }),
      prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } }),
    ]);

    const resetUrl = `${process.env.APP_URL || ""}/reset-password?token=${token}`;

    // Emailed via Zoho (logged to the console in development if SMTP isn't set).
    // Never return the link in the response: anyone could reset any account.
    await sendPasswordResetEmail(user.email, resetUrl);

    return genericOk;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
