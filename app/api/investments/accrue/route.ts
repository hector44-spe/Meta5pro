export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, money } from "@/lib/ledger";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    // Only investments not paid in the last 23 hours, so triggering this twice in a day pays once.
    const cutoff = new Date(Date.now() - 23 * 60 * 60 * 1000);

    const due = await prisma.investment.findMany({
      where: { status: "RUNNING", daysRemaining: { gt: 0 }, lastPayoutAt: { lte: cutoff } },
      include: { plan: { select: { dailyRoiPercentage: true, capitalRefund: true } } },
    });

    let processed = 0;
    let total = 0;

    // One short transaction per investment; the lastPayoutAt condition makes each
    // payout happen at most once even if two runs overlap.
    for (const inv of due) {
      const amount = inv.amount.toNumber();
      const dailyYield = money(amount * (inv.plan.dailyRoiPercentage.toNumber() / 100));
      const newDaysRemaining = inv.daysRemaining - 1;
      const isCompleted = newDaysRemaining <= 0;

      const paid = await atomic(async (tx) => {
        const claim = await tx.investment.updateMany({
          where: { id: inv.id, status: "RUNNING", lastPayoutAt: { lte: cutoff } },
          data: {
            accruedProfit: { increment: dailyYield },
            daysRemaining: newDaysRemaining,
            status: isCompleted ? "COMPLETED" : "RUNNING",
            lastPayoutAt: new Date(),
          },
        });
        if (claim.count !== 1) return false;

        await tx.wallet.update({
          where: { userId: inv.userId },
          data: {
            interestBalance: { increment: dailyYield },
            ...(isCompleted && inv.plan.capitalRefund ? { mainBalance: { increment: amount } } : {}),
          },
        });
        return true;
      });

      if (paid) {
        processed++;
        total += dailyYield;
      }
    }

    total = money(total);
    return NextResponse.json({
      success: true,
      message: `Processed ${processed} investments due for payout. Total distributed: $${total.toFixed(2)}`,
      processedCount: processed,
      totalYieldDistributed: total,
    });
  } catch (error) {
    console.error("Accrue daily yields error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
