export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorizedAdminEmail } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN" || !isAuthorizedAdminEmail(session.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      twoFactorEnabled: !!user.twoFactorEnabled,
      email: user.email,
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json({ error: "Failed to get 2FA status" }, { status: 500 });
  }
}
