export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import crypto from "node:crypto";
import { z } from "zod";

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
    const user = await db.user.findUnique({ where: { email } });

    // For security, always show success even if email not found
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset link has been dispatched.",
      });
    }

    // Generate cryptographic token
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    const now = new Date().toISOString();
    const tokenId = "prt_" + Math.random().toString(36).substring(2, 9);

    sqlite.prepare(`
      INSERT INTO password_reset_tokens (id, userId, token, expiresAt, used, createdAt)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(tokenId, user.id, token, expiresAt, now);

    const resetUrl = `/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: "Password reset link generated successfully.",
      resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
