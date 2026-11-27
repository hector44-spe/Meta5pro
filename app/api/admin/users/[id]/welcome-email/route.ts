export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession, isAuthorizedAdminEmail } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN" || !isAuthorizedAdminEmail(session.email)) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, fullName: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const firstName = user.fullName ? user.fullName.split(/\s+/)[0] : user.username;
    const sent = await sendWelcomeEmail(user.email, firstName);

    if (!sent) {
      return NextResponse.json({
        success: false,
        error: "Email delivery failed or timed out. Check your SMTP / API settings.",
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: `Welcome email sent successfully to ${user.email}.`,
    });
  } catch (error: any) {
    console.error("Admin welcome email send error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
