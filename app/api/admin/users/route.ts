export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, username: true, fullName: true, phoneNumber: true,
        role: true, status: true, createdAt: true, wallet: true,
      },
    });
    // Flatten wallet balances onto each user, as the admin page expects
    const users = rows.map(({ wallet, ...u }) => ({
      ...u,
      mainBalance: wallet?.mainBalance.toNumber() ?? 0,
      interestBalance: wallet?.interestBalance.toNumber() ?? 0,
      totalDeposited: wallet?.totalDeposited.toNumber() ?? 0,
      totalWithdrawn: wallet?.totalWithdrawn.toNumber() ?? 0,
    }));

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Fetch admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
