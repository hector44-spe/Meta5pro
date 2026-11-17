import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DEFAULT_STAKING_POOLS, StakingPool, UserStakeRecord } from "@/lib/stakingData";
import { atomic, debitMain, InsufficientFundsError } from "@/lib/ledger";
import crypto from "node:crypto";

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    // Load pools from appSetting
    const poolsSetting = await prisma.appSetting.findUnique({
      where: { key: "staking_pools" },
    });

    let pools: StakingPool[] = DEFAULT_STAKING_POOLS;
    if (poolsSetting && Array.isArray(poolsSetting.value) && poolsSetting.value.length > 0) {
      pools = poolsSetting.value as unknown as StakingPool[];
    }

    // Load user stakes
    let userStakes: UserStakeRecord[] = [];
    if (session?.userId) {
      const stakesSetting = await prisma.appSetting.findUnique({
        where: { key: `user_stakes_${session.userId}` },
      });
      if (stakesSetting && Array.isArray(stakesSetting.value)) {
        userStakes = stakesSetting.value as unknown as UserStakeRecord[];
      }
    }

    const totalStaked = userStakes.reduce((acc, s) => acc + s.amount, 0);
    const activeStakes = userStakes.filter((s) => s.status === "ACTIVE");
    const closedStakes = userStakes.filter((s) => s.status === "COMPLETED" || s.status === "CANCELLED");

    return NextResponse.json({
      success: true,
      pools,
      userStakes,
      stats: {
        totalStaked,
        totalCount: userStakes.length,
        activeStaked: activeStakes.reduce((acc, s) => acc + s.amount, 0),
        activeCount: activeStakes.length,
        closedStaked: closedStakes.reduce((acc, s) => acc + s.amount, 0),
        closedCount: closedStakes.length,
      },
      isAdmin,
    });
  } catch (error) {
    console.error("Fetch staking error:", error);
    return NextResponse.json({
      success: true,
      pools: DEFAULT_STAKING_POOLS,
      userStakes: [],
      stats: {
        totalStaked: 0,
        totalCount: 0,
        activeStaked: 0,
        activeCount: 0,
        closedStaked: 0,
        closedCount: 0,
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
      return NextResponse.json({ error: "Invalid stake amount" }, { status: 400 });
    }

    // Fetch pools
    const poolsSetting = await prisma.appSetting.findUnique({
      where: { key: "staking_pools" },
    });
    const pools: StakingPool[] =
      poolsSetting && Array.isArray(poolsSetting.value) && poolsSetting.value.length > 0
        ? (poolsSetting.value as unknown as StakingPool[])
        : DEFAULT_STAKING_POOLS;

    const pool = pools.find((p) => p.id === poolId);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    if (amount < pool.min || amount > pool.max) {
      return NextResponse.json(
        { error: `Amount must be between ${pool.min} and ${pool.max} ${pool.symbol}` },
        { status: 400 }
      );
    }

    const stakeCost = Number(amount);
    const duration = Math.max(1, Math.min(3650, Number(durationDays) || 1));
    const expectedReturn = amount + (amount * (pool.roi / 100) * duration) / 365;

    const newStake: UserStakeRecord = {
      id: `stake-${crypto.randomUUID()}`,
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
      await debitMain(tx, session.userId, stakeCost, {
        referenceType: "STAKING_SUBSCRIBE",
        referenceId: newStake.id,
        counterAccount: `STAKING_POOL:${pool.id}`,
      });
      const userStakesKey = `user_stakes_${session.userId}`;
      const allStakesKey = "all_user_stakes";
      const [curSetting, allSetting] = await Promise.all([
        tx.appSetting.findUnique({ where: { key: userStakesKey } }),
        tx.appSetting.findUnique({ where: { key: allStakesKey } }),
      ]);
      const curStakes = (curSetting && Array.isArray(curSetting.value) ? curSetting.value : []) as unknown as UserStakeRecord[];
      const allStakes = (allSetting && Array.isArray(allSetting.value) ? allSetting.value : []) as unknown as UserStakeRecord[];
      await tx.appSetting.upsert({
        where: { key: userStakesKey },
        update: { value: [newStake, ...curStakes] as any },
        create: { key: userStakesKey, value: [newStake, ...curStakes] as any },
      });
      await tx.appSetting.upsert({
        where: { key: allStakesKey },
        update: { value: [newStake, ...allStakes] as any },
        create: { key: allStakesKey, value: [newStake, ...allStakes] as any },
      });
    });

    return NextResponse.json({
      success: true,
      stake: newStake,
      message: `Successfully staked ${amount} ${pool.symbol}!`,
    });
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      return NextResponse.json({ error: `Insufficient balance. Available: $${error.available.toFixed(2)}` }, { status: 400 });
    }
    console.error("Stake error:", error);
    return NextResponse.json({ error: "Failed to create stake" }, { status: 500 });
  }
}
