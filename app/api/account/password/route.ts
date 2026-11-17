export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword, signToken, AUTH_COOKIE, rateLimited } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current one",
  });

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (await rateLimited(`pwchange:${session.userId}`, 5)) {
      return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
    }

    const parsed = passwordSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { passwordHash: true } });
    if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
        tokenVersion: { increment: 1 },
      },
      select: { id: true, email: true, role: true, username: true, tokenVersion: true },
    });

    await notify(session.userId, "security", "Password changed", "Your password was changed. If this wasn't you, reset your password immediately and contact support.");

    // Issue new cookie with updated tokenVersion so current device stays authenticated,
    // while all other sessions/tokens are immediately revoked!
    const newToken = signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      username: updatedUser.username,
      tokenVersion: updatedUser.tokenVersion,
    });

    const response = NextResponse.json({ success: true, message: "Password changed" });
    response.cookies.set({
      name: AUTH_COOKIE,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
