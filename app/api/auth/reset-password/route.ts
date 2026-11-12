export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
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
    const stmt = sqlite.prepare(`
      SELECT * FROM password_reset_tokens
      WHERE token = ? AND used = 0
    `);
    const tokenRecord = stmt.get(token) as any;

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or already used password reset link" },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    const now = new Date().toISOString();

    // 1. Update user password
    sqlite.prepare(`
      UPDATE users
      SET passwordHash = ?, updatedAt = ?
      WHERE id = ?
    `).run(passwordHash, now, tokenRecord.userId);

    // 2. Mark token used
    sqlite.prepare(`
      UPDATE password_reset_tokens
      SET used = 1
      WHERE id = ?
    `).run(tokenRecord.id);

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
