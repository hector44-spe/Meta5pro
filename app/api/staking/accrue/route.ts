export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, creditInterest, creditMain, insertTransaction, money } from "@/lib/ledger";
import { notify, fmtUsd } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isCronAuthorized = authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuthorized) {
      const session = await getSession();
      if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden: Super Admin access or valid CRON_SECRET required" }, { status: 403 });
      }
    }

    const cutoff = new Date(Date.now() - 23 * 60 * 60 * 1000);

    const dueStakes = await prisma.userStake.findMany({
      where: {
        status: "ACTIVE",
        daysRemaining: { gt: 0 },
        lastPayoutAt: { lte: cutoff },
      },
    });

    let processed = 0;
    let totalYieldDistributed = 0;

    for (const stake of dueStakes) {
      const initialUsd = Number(stake.usdValue);
      const roiNum = Number(stake.roi);
      const dailyYield = money((initialUsd * (roiNum / 100)) / 365);
      const newDaysRemaining = stake.daysRemaining - 1;
      const isCompleted = newDaysRemaining <= 0;

      const success = await atomic(async (tx) => {
        const claim = await tx.userStake.updateMany({
          where: { id: stake.id, status: "ACTIVE", lastPayoutAt: { lte: cutoff } },
          data: {
            accruedProfitUsd: { increment: dailyYield },
            daysRemaining: newDaysRemaining,
            status: isCompleted ? "COMPLETED" : "ACTIVE",
            settledAt: isCompleted ? new Date() : null,
            lastPayoutAt: new Date(),
          },
        });
        if (claim.count !== 1) return false;

        // Credit daily yield to interest balance
        await creditInterest(tx, stake.userId, dailyYield, {
          referenceType: "STAKING_YIELD",
          referenceId: stake.id,
          counterAccount: `STAKING_POOL:${stake.poolId || "POOL"}`,
        });

        // When contract concludes, refund the initial principal back to main cash wallet!
        if (isCompleted) {
          if (stake.fundingSource === "ASSET" && stake.symbol !== "USD") {
            await tx.assetBalance.upsert({
              where: { userId_symbol: { userId: stake.userId, symbol: stake.symbol } },
              create: { userId: stake.userId, symbol: stake.symbol, amount: stake.amount },
              update: { amount: { increment: stake.amount } },
            });
          } else {
            await creditMain(tx, stake.userId, initialUsd, {
              referenceType: "STAKING_PRINCIPAL_RETURN",
              referenceId: stake.id,
              counterAccount: `STAKING_POOL:${stake.poolId || "POOL"}`,
            });
          }
          await insertTransaction(tx, {
            userId: stake.userId,
            type: "TRADE_CLOSE",
            amount: initialUsd,
            currency: "USD",
            assetSymbol: stake.symbol,
            txHash: `STK_RET_${stake.id.slice(0, 8).toUpperCase()}`,
            status: "APPROVED",
          });
          await notify(
            stake.userId,
            "balance",
            "Staking Matured & Completed",
            `Your staking in ${stake.poolName} has concluded. Your principal has been returned and accrued yields remain in your interest balance.`,
            tx,
          );
        }

        return true;
      });

      if (success) {
        processed++;
        totalYieldDistributed += dailyYield;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed} stakes. Total daily yield distributed: ${fmtUsd(totalYieldDistributed)}`,
      processedCount: processed,
      totalYieldDistributed,
    });
  } catch (error) {
    console.error("Accrue staking yield error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
