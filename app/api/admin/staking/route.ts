export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { atomic, audit, creditMain, insertTransaction, money } from "@/lib/ledger";
import { notify, fmtUsd } from "@/lib/notify";
import { z } from "zod";

const poolSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  symbol: z.string().trim().toUpperCase().min(2, "Symbol is required"),
  icon: z.string().optional().nullable(),
  min: z.coerce.number().positive("Min must be positive"),
  max: z.coerce.number().positive("Max must be positive"),
  cycle: z.string().default("Daily"),
  roi: z.coerce.number().min(0, "ROI cannot be negative"),
}).refine((data) => data.min <= data.max, {
  message: "Minimum deposit cannot exceed maximum deposit",
  path: ["min"],
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const [pools, rawStakes] = await Promise.all([
      prisma.stakingPool.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.userStake.findMany({
        include: {
          user: { select: { email: true, username: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const stakes = rawStakes.map((s) => ({
      id: s.id,
      userId: s.userId,
      userEmail: s.user?.email || s.userId,
      userFullName: s.user?.fullName,
      poolId: s.poolId,
      poolName: s.poolName,
      symbol: s.symbol,
      amount: Number(s.amount),
      usdValue: Number(s.usdValue),
      durationDays: s.durationDays,
      roi: Number(s.roi),
      expectedReturnUsd: Number(s.expectedReturnUsd),
      accruedProfitUsd: Number(s.accruedProfitUsd),
      daysRemaining: s.daysRemaining,
      status: s.status,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      pools: pools.map((p) => ({
        id: p.id,
        name: p.name,
        symbol: p.symbol,
        icon: p.icon,
        min: Number(p.min),
        max: Number(p.max),
        cycle: p.cycle,
        roi: Number(p.roi),
        status: p.status,
      })),
      stakes,
    });
  } catch (error: any) {
    console.error("Admin staking GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to load admin staking data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, pool, poolId, stakeId, stakeStatus, refundUser } = body;
    const ip = clientIp(req);

    if (action === "save_pool") {
      const parsed = poolSchema.safeParse(pool);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
      }

      const data = parsed.data;
      const saved = await atomic(async (tx) => {
        const res = await tx.stakingPool.upsert({
          where: { id: data.id || "new-pool" },
          update: {
            name: data.name,
            symbol: data.symbol,
            icon: data.icon || `/assets/coins/${data.symbol}.svg`,
            min: data.min,
            max: data.max,
            cycle: data.cycle,
            roi: data.roi,
          },
          create: {
            name: data.name,
            symbol: data.symbol,
            icon: data.icon || `/assets/coins/${data.symbol}.svg`,
            min: data.min,
            max: data.max,
            cycle: data.cycle,
            roi: data.roi,
          },
        });

        await audit(
          tx,
          session.userId,
          "ADMIN_STAKING_POOL_SAVED",
          ip,
          `Admin ${session.email} saved staking pool ${data.name} (${data.symbol})`
        );

        return res;
      });

      return NextResponse.json({
        success: true,
        pool: saved,
        message: "Staking pool saved successfully",
      });
    }

    if (action === "delete_pool") {
      if (!poolId) {
        return NextResponse.json({ error: "Pool ID required" }, { status: 400 });
      }

      await atomic(async (tx) => {
        await tx.stakingPool.update({
          where: { id: poolId },
          data: { status: "INACTIVE" },
        });
        await audit(tx, session.userId, "ADMIN_STAKING_POOL_DELETED", ip, `Admin ${session.email} archived staking pool ${poolId}`);
      });

      return NextResponse.json({
        success: true,
        message: "Staking pool archived successfully",
      });
    }

    if (action === "update_stake_status") {
      if (!stakeId || !["COMPLETED", "CANCELLED"].includes(stakeStatus)) {
        return NextResponse.json({ error: "Stake ID and status are required" }, { status: 400 });
      }

      const targetStake = await prisma.userStake.findUnique({
        where: { id: stakeId },
        include: { user: true },
      });
      if (!targetStake) {
        return NextResponse.json({ error: "Stake not found" }, { status: 404 });
      }

      const prevStatus = targetStake.status;
      const initialPrincipalUsd = Number(targetStake.usdValue);
      const changed = await atomic(async (tx) => {
        const claimed = await tx.userStake.updateMany({
          where: { id: stakeId, status: "ACTIVE", settledAt: null },
          data: { status: stakeStatus, daysRemaining: stakeStatus === "COMPLETED" ? 0 : targetStake.daysRemaining, settledAt: new Date() },
        });
        if (claimed.count !== 1) return false;
        // Handle settlement if completing or refunding
        if (stakeStatus === "COMPLETED" && prevStatus === "ACTIVE") {
          const payoutAmount = money(initialPrincipalUsd);
          if (targetStake.fundingSource === "ASSET" && targetStake.symbol !== "USD") {
            await tx.assetBalance.upsert({ where: { userId_symbol: { userId: targetStake.userId, symbol: targetStake.symbol } }, create: { userId: targetStake.userId, symbol: targetStake.symbol, amount: targetStake.amount }, update: { amount: { increment: targetStake.amount } } });
          } else {
            await creditMain(tx, targetStake.userId, payoutAmount, { referenceType: "STAKING_PRINCIPAL_RETURN", referenceId: targetStake.id, counterAccount: `STAKING_POOL:${targetStake.poolId || "POOL"}` });
          }
          await insertTransaction(tx, {
            userId: targetStake.userId,
            type: "TRADE_CLOSE",
            amount: payoutAmount,
            currency: "USD",
            assetSymbol: targetStake.symbol,
            txHash: `STK_PAY_${targetStake.id.slice(0, 8).toUpperCase()}`,
            status: "APPROVED",
          });
          await notify(
            targetStake.userId,
            "balance",
            "Staking Payout Completed",
            `Your staking contract in ${targetStake.poolName} has concluded. Your principal has been returned; accrued yield remains in your interest balance.`,
            tx,
          );
        } else if (stakeStatus === "CANCELLED" && prevStatus === "ACTIVE" && refundUser) {
          if (targetStake.fundingSource === "ASSET" && targetStake.symbol !== "USD") {
            await tx.assetBalance.upsert({ where: { userId_symbol: { userId: targetStake.userId, symbol: targetStake.symbol } }, create: { userId: targetStake.userId, symbol: targetStake.symbol, amount: targetStake.amount }, update: { amount: { increment: targetStake.amount } } });
          } else {
            await creditMain(tx, targetStake.userId, initialPrincipalUsd, { referenceType: "STAKING_REFUND", referenceId: targetStake.id, counterAccount: `STAKING_POOL:${targetStake.poolId || "POOL"}` });
          }
          await insertTransaction(tx, {
            userId: targetStake.userId,
            type: "TRADE_CLOSE",
            amount: initialPrincipalUsd,
            currency: "USD",
            assetSymbol: targetStake.symbol,
            txHash: `STK_REF_${targetStake.id.slice(0, 8).toUpperCase()}`,
            status: "APPROVED",
          });
          await notify(
            targetStake.userId,
            "balance",
            "Staking Cancelled & Refunded",
            `Your stake in ${targetStake.poolName} was cancelled by support and its principal was returned.`,
            tx,
          );
        }

        await audit(
          tx,
          session.userId,
          "ADMIN_STAKE_STATUS_UPDATE",
          ip,
          `Admin ${session.email} updated stake ${stakeId} (${targetStake.user.email}) status from ${prevStatus} to ${stakeStatus}${refundUser ? " with refund" : ""}`
        );
        return true;
      });

      if (!changed) return NextResponse.json({ error: "Stake is already settled" }, { status: 409 });

      return NextResponse.json({
        success: true,
        message: `Stake status updated to ${stakeStatus} successfully`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin staking POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to update admin staking" }, { status: 500 });
  }
}
