export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { audit } from "@/lib/ledger";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "FROZEN"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // Check target user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Do not allow suspending or freezing the super admin
    if (user.role === "ADMIN" && (status === "SUSPENDED" || status === "FROZEN")) {
      return NextResponse.json({ error: "Cannot suspend or freeze a Super Admin account" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        status,
        ...(status === "SUSPENDED" ? { tokenVersion: { increment: 1 } } : {}),
      },
    });

    if (status === "FROZEN") {
      await notify(
        userId,
        "frozen",
        "Your account is frozen, contact support for more info",
        "Your account is frozen, contact support for more info"
      );
    } else if (status === "ACTIVE") {
      await notify(
        userId,
        "security",
        "Account Notice: Account Active",
        "Your account is active. All trading and account features are fully accessible."
      );
    }

    await audit(
      prisma,
      session.userId,
      `ADMIN_USER_${status}`,
      clientIp(req),
      `Admin ${session.email} changed account status of ${user.fullName || user.username || user.email} to ${status}`,
      userId,
    );

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      status,
    });
  } catch (error) {
    console.error("Admin user status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
