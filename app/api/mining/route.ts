import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DEFAULT_MINING_POOLS, MiningPool, UserMiningRecord } from "@/lib/miningData";
import { atomic, debitMain, InsufficientFundsError } from "@/lib/ledger";
import crypto from "node:crypto";

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    const poolsSetting = await prisma.appSetting.findUnique({
      where: { key: "mining_pools" },
    });

    let pools: MiningPool[] = DEFAULT_MINING_POOLS;
    if (poolsSetting && Array.isArray(poolsSetting.value) && poolsSetting.value.length > 0) {
      pools = poolsSetting.value as unknown as MiningPool[];
    }

    let userMinings: UserMiningRecord[] = [];
    if (session?.userId) {
      const miningsSetting = await prisma.appSetting.findUnique({
        where: { key: `user_minings_${session.userId}` },
      });
      if (miningsSetting && Array.isArray(miningsSetting.value)) {
        userMinings = miningsSetting.value as unknown as UserMiningRecord[];
      }
    }

    const totalMined = userMinings.reduce((acc, m) => acc + m.amount, 0);
    const activeMinings = userMinings.filter((m) => m.status === "ACTIVE");
    const closedMinings = userMinings.filter((m) => m.status === "COMPLETED" || m.status === "CANCELLED");

    return NextResponse.json({
      success: true,
      pools,
      userMinings,
      stats: {
        totalMined,
        totalCount: userMinings.length,
        activeMined: activeMinings.reduce((acc, m) => acc + m.amount, 0),
        activeCount: activeMinings.length,
        closedMined: closedMinings.reduce((acc, m) => acc + m.amount, 0),
        closedCount: closedMinings.length,
        totalHashrate: "18,036,473 GH/s",
      },
      isAdmin,
    });
  } catch (error) {
    console.error("Fetch mining error:", error);
    return NextResponse.json({
      success: true,
      pools: DEFAULT_MINING_POOLS,
      userMinings: [],
      stats: {
        totalMined: 0,
        totalCount: 0,
        activeMined: 0,
        activeCount: 0,
        closedMined: 0,
        closedCount: 0,
        totalHashrate: "18,036,473 GH/s",
      },
      isAdmin: false,
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { poolId, amount, durationDays } = body;

    if (!poolId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid mining amount" }, { status: 400 });
    }

    const poolsSetting = await prisma.appSetting.findUnique({
      where: { key: "mining_pools" },
    });
    const pools: MiningPool[] =
      poolsSetting && Array.isArray(poolsSetting.value) && poolsSetting.value.length > 0
        ? (poolsSetting.value as unknown as MiningPool[])
        : DEFAULT_MINING_POOLS;

    const pool = pools.find((p) => p.id === poolId);
    if (!pool) {
      return NextResponse.json({ error: "Mining pool not found" }, { status: 404 });
    }

    if (amount < pool.min || amount > pool.max) {
      return NextResponse.json(
        { error: `Amount must be between ${pool.min} and ${pool.max} ${pool.symbol}` },
        { status: 400 }
      );
    }

    const miningCost = Number(amount);
    const duration = Math.max(1, Math.min(3650, Number(durationDays) || 1));
    const expectedReturn = amount + (amount * (pool.roi / 100) * duration) / 365;

    const newMining: UserMiningRecord = {
      id: `mine-${crypto.randomUUID()}`,
      userId: session.userId,
      userEmail: session.email || "",
      poolId: pool.id,
      poolName: pool.name,
      symbol: pool.symbol,
      amount,
      durationDays: duration,
      roi: pool.roi,
      expectedReturn,
      status: "ACTIVE",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + duration * 86400000).toISOString(),
    };

    await atomic(async (tx) => {
      await debitMain(tx, session.userId, miningCost, {
        referenceType: "MINING_SUBSCRIBE",
        referenceId: newMining.id,
        counterAccount: `MINING_POOL:${pool.id}`,
      });
      const userMiningsKey = `user_minings_${session.userId}`;
      const allMiningsKey = "all_user_minings";
      const [curSetting, allSetting] = await Promise.all([
        tx.appSetting.findUnique({ where: { key: userMiningsKey } }),
        tx.appSetting.findUnique({ where: { key: allMiningsKey } }),
      ]);
      const curMinings = (curSetting && Array.isArray(curSetting.value) ? curSetting.value : []) as unknown as UserMiningRecord[];
      const allMinings = (allSetting && Array.isArray(allSetting.value) ? allSetting.value : []) as unknown as UserMiningRecord[];
      await tx.appSetting.upsert({
        where: { key: userMiningsKey },
        update: { value: [newMining, ...curMinings] as any },
        create: { key: userMiningsKey, value: [newMining, ...curMinings] as any },
      });
      await tx.appSetting.upsert({
        where: { key: allMiningsKey },
        update: { value: [newMining, ...allMinings] as any },
        create: { key: allMiningsKey, value: [newMining, ...allMinings] as any },
      });
    });

    return NextResponse.json({
      success: true,
      mining: newMining,
      message: `Successfully joined ${pool.name} with ${amount} ${pool.symbol}!`,
    });
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      return NextResponse.json({ error: `Insufficient balance. Available: $${error.available.toFixed(2)}` }, { status: 400 });
    }
    console.error("Mining error:", error);
    return NextResponse.json({ error: "Failed to start mining" }, { status: 500 });
  }
}
