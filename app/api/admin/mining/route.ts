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
  badge: z.string().min(1, "Badge is required"),
  icon: z.string().optional().nullable(),
  hardwareImage: z.string().optional().nullable(),
  min: z.coerce.number().positive("Min must be positive"),
  max: z.coerce.number().positive("Max must be positive"),
  roi: z.coerce.number().min(0, "ROI cannot be negative"),
  cycle: z.string().default("Daily"),
  hashrate: z.string().min(1, "Hashrate is required"),
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

    const [pools, rawContracts] = await Promise.all([
      prisma.miningPool.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.userMining.findMany({
        include: {
          user: { select: { email: true, username: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const minings = rawContracts.map((m) => ({
      id: m.id,
      userId: m.userId,
      userEmail: m.user?.email || m.userId,
      userFullName: m.user?.fullName,
      poolId: m.poolId,
      poolName: m.poolName,
      symbol: m.symbol,
      amount: Number(m.amount),
      usdValue: Number(m.usdValue),
      durationDays: m.durationDays,
      roi: Number(m.roi),
      expectedReturnUsd: Number(m.expectedReturnUsd),
      accruedProfitUsd: Number(m.accruedProfitUsd),
      daysRemaining: m.daysRemaining,
      status: m.status,
      startDate: m.startDate.toISOString(),
      endDate: m.endDate.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      pools: pools.map((p) => ({
        id: p.id,
        name: p.name,
        symbol: p.symbol,
        badge: p.badge,
        icon: p.icon,
        hardwareImage: p.hardwareImage,
        min: Number(p.min),
        max: Number(p.max),
        roi: Number(p.roi),
        cycle: p.cycle,
        hashrate: p.hashrate,
        status: p.status,
      })),
      minings,
    });
  } catch (error: any) {
    console.error("Admin mining GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to load admin mining data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, pool, poolId, miningId, miningStatus, refundUser } = body;
    const ip = clientIp(req);

    if (action === "save_pool") {
      const parsed = poolSchema.safeParse(pool);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
      }

      const data = parsed.data;
      const saved = await atomic(async (tx) => {
        const res = await tx.miningPool.upsert({
          where: { id: data.id || "new-pool" },
          update: {
            name: data.name,
            symbol: data.symbol,
            badge: data.badge,
            icon: data.icon || `/assets/coins/${data.symbol}.svg`,
            hardwareImage: data.hardwareImage || "/assets/coins/l9.png",
            min: data.min,
            max: data.max,
            roi: data.roi,
            cycle: data.cycle,
            hashrate: data.hashrate,
          },
          create: {
            name: data.name,
            symbol: data.symbol,
            badge: data.badge,
            icon: data.icon || `/assets/coins/${data.symbol}.svg`,
            hardwareImage: data.hardwareImage || "/assets/coins/l9.png",
            min: data.min,
            max: data.max,
            roi: data.roi,
            cycle: data.cycle,
            hashrate: data.hashrate,
          },
        });

        await audit(
          tx,
          session.userId,
          "ADMIN_MINING_POOL_SAVED",
          ip,
          `Admin ${session.email} saved cloud mining pool ${data.name} (${data.symbol})`
        );

        return res;
      });

      return NextResponse.json({
        success: true,
        pool: saved,
        message: "Mining pool saved successfully",
      });
    }

    if (action === "delete_pool") {
      if (!poolId) {
        return NextResponse.json({ error: "Pool ID required" }, { status: 400 });
      }

      await atomic(async (tx) => {
        await tx.miningPool.update({
          where: { id: poolId },
          data: { status: "INACTIVE" },
        });
        await audit(tx, session.userId, "ADMIN_MINING_POOL_DELETED", ip, `Admin ${session.email} archived mining pool ${poolId}`);
      });

      return NextResponse.json({
        success: true,
        message: "Mining pool archived successfully",
      });
    }

    if (action === "update_mining_status") {
      if (!miningId || !["COMPLETED", "CANCELLED"].includes(miningStatus)) {
        return NextResponse.json({ error: "Mining contract ID and status are required" }, { status: 400 });
      }

      const targetContract = await prisma.userMining.findUnique({
        where: { id: miningId },
        include: { user: true },
      });
      if (!targetContract) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      }

      const prevStatus = targetContract.status;
      const initialPrincipalUsd = Number(targetContract.usdValue);
      const changed = await atomic(async (tx) => {
        const claimed = await tx.userMining.updateMany({
          where: { id: miningId, status: "ACTIVE", settledAt: null },
          data: { status: miningStatus, daysRemaining: miningStatus === "COMPLETED" ? 0 : targetContract.daysRemaining, settledAt: new Date() },
        });
        if (claimed.count !== 1) return false;
        if (miningStatus === "COMPLETED" && prevStatus === "ACTIVE") {
          const payoutAmount = money(initialPrincipalUsd);
          if (targetContract.fundingSource === "ASSET" && targetContract.symbol !== "USD") {
            await tx.assetBalance.upsert({ where: { userId_symbol: { userId: targetContract.userId, symbol: targetContract.symbol } }, create: { userId: targetContract.userId, symbol: targetContract.symbol, amount: targetContract.amount }, update: { amount: { increment: targetContract.amount } } });
          } else {
            await creditMain(tx, targetContract.userId, payoutAmount, { referenceType: "MINING_PRINCIPAL_RETURN", referenceId: targetContract.id, counterAccount: `MINING_POOL:${targetContract.poolId || "POOL"}` });
          }
          await insertTransaction(tx, {
            userId: targetContract.userId,
            type: "TRADE_CLOSE",
            amount: payoutAmount,
            currency: "USD",
            assetSymbol: targetContract.symbol,
            txHash: `MIN_PAY_${targetContract.id.slice(0, 8).toUpperCase()}`,
            status: "APPROVED",
          });
          await notify(
            targetContract.userId,
            "balance",
            "Mining Contract Completed",
            `Your mining contract on ${targetContract.poolName} has completed. Its principal was returned and accrued rewards remain in your interest balance.`,
            tx,
          );
        } else if (miningStatus === "CANCELLED" && prevStatus === "ACTIVE" && refundUser) {
          if (targetContract.fundingSource === "ASSET" && targetContract.symbol !== "USD") {
            await tx.assetBalance.upsert({ where: { userId_symbol: { userId: targetContract.userId, symbol: targetContract.symbol } }, create: { userId: targetContract.userId, symbol: targetContract.symbol, amount: targetContract.amount }, update: { amount: { increment: targetContract.amount } } });
          } else {
            await creditMain(tx, targetContract.userId, initialPrincipalUsd, { referenceType: "MINING_REFUND", referenceId: targetContract.id, counterAccount: `MINING_POOL:${targetContract.poolId || "POOL"}` });
          }
          await insertTransaction(tx, {
            userId: targetContract.userId,
            type: "TRADE_CLOSE",
            amount: initialPrincipalUsd,
            currency: "USD",
            assetSymbol: targetContract.symbol,
            txHash: `MIN_REF_${targetContract.id.slice(0, 8).toUpperCase()}`,
            status: "APPROVED",
          });
          await notify(
            targetContract.userId,
            "balance",
            "Mining Contract Cancelled & Refunded",
            `Your cloud mining contract on ${targetContract.poolName} was cancelled and its principal was returned.`,
            tx,
          );
        }

        await audit(
          tx,
          session.userId,
          "ADMIN_MINING_STATUS_UPDATE",
          ip,
          `Admin ${session.email} updated mining contract ${miningId} (${targetContract.user.email}) status from ${prevStatus} to ${miningStatus}${refundUser ? " with refund" : ""}`
        );
        return true;
      });

      if (!changed) return NextResponse.json({ error: "Mining contract is already settled" }, { status: 409 });

      return NextResponse.json({
        success: true,
        message: `Mining contract status updated to ${miningStatus} successfully`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin mining POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to update admin mining" }, { status: 500 });
  }
}
