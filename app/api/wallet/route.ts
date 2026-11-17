export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const [transactions, totalTrades, closedProfit] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.position.count({ where: { userId: session.userId } }),
      prisma.position.aggregate({
        where: { userId: session.userId, status: "CLOSED" },
        _sum: { pnl: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      wallet,
      transactions,
      stats: {
        totalDeposits: wallet.totalDeposited.toNumber(),
        totalWithdrawals: wallet.totalWithdrawn.toNumber(),
        totalProfits: Number(closedProfit._sum.pnl ?? 0) + wallet.interestBalance.toNumber(),
        totalTrades,
      },
    });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
