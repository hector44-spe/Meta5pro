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

    const dueContracts = await prisma.userMining.findMany({
      where: {
        status: "ACTIVE",
        daysRemaining: { gt: 0 },
        lastPayoutAt: { lte: cutoff },
      },
    });

    let processed = 0;
    let totalYieldDistributed = 0;

    for (const contract of dueContracts) {
      const initialUsd = Number(contract.usdValue);
      const roiNum = Number(contract.roi);
      const dailyYield = money((initialUsd * (roiNum / 100)) / 365);
      const newDaysRemaining = contract.daysRemaining - 1;
      const isCompleted = newDaysRemaining <= 0;

      const success = await atomic(async (tx) => {
        const claim = await tx.userMining.updateMany({
          where: { id: contract.id, status: "ACTIVE", lastPayoutAt: { lte: cutoff } },
          data: {
            accruedProfitUsd: { increment: dailyYield },
            daysRemaining: newDaysRemaining,
            status: isCompleted ? "COMPLETED" : "ACTIVE",
            settledAt: isCompleted ? new Date() : null,
            lastPayoutAt: new Date(),
          },
        });
        if (claim.count !== 1) return false;

        await creditInterest(tx, contract.userId, dailyYield, {
          referenceType: "MINING_YIELD",
          referenceId: contract.id,
          counterAccount: `MINING_POOL:${contract.poolId || "POOL"}`,
        });

        if (isCompleted) {
          if (contract.fundingSource === "ASSET" && contract.symbol !== "USD") {
            await tx.assetBalance.upsert({
              where: { userId_symbol: { userId: contract.userId, symbol: contract.symbol } },
              create: { userId: contract.userId, symbol: contract.symbol, amount: contract.amount },
              update: { amount: { increment: contract.amount } },
            });
          } else {
            await creditMain(tx, contract.userId, initialUsd, {
              referenceType: "MINING_PRINCIPAL_RETURN",
              referenceId: contract.id,
              counterAccount: `MINING_POOL:${contract.poolId || "POOL"}`,
            });
          }
          await insertTransaction(tx, {
            userId: contract.userId,
            type: "TRADE_CLOSE",
            amount: initialUsd,
            currency: "USD",
            assetSymbol: contract.symbol,
            txHash: `MIN_RET_${contract.id.slice(0, 8).toUpperCase()}`,
            status: "APPROVED",
          });
          await notify(
            contract.userId,
            "balance",
            "Cloud Mining Contract Completed",
            `Your mining contract on ${contract.poolName} has concluded. Your principal has been returned and mining rewards remain in your interest balance.`,
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
      message: `Processed ${processed} mining contracts. Total daily rewards distributed: ${fmtUsd(totalYieldDistributed)}`,
      processedCount: processed,
      totalYieldDistributed,
    });
  } catch (error) {
    console.error("Accrue mining yield error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
