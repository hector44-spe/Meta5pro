export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    // Check token
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { token, used: false },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or already used password reset link" },
        { status: 400 }
      );
    }

    // Check expiration
    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Claim the token first (only one request can win), then update the password.
    const claimed = await prisma.passwordResetToken.updateMany({
      where: { id: tokenRecord.id, used: false },
      data: { used: true },
    });
    if (claimed.count !== 1) {
      return NextResponse.json(
        { error: "Invalid or already used password reset link" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
