export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Join transactions with user email/fullName
    const rows = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, fullName: true } } },
    });
    // Flatten to the shape the admin page expects
    const transactions = rows.map(({ user, approvedAt: _approvedAt, ...t }) => ({
      ...t,
      userEmail: user?.email ?? null,
      userFullName: user?.fullName ?? null,
    }));

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Admin transactions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
