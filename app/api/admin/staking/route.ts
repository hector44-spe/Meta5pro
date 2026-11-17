import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DEFAULT_STAKING_POOLS, StakingPool, UserStakeRecord } from "@/lib/stakingData";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const poolsSetting = await prisma.appSetting.findUnique({
      where: { key: "staking_pools" },
    });

    const pools: StakingPool[] =
      poolsSetting && Array.isArray(poolsSetting.value) && poolsSetting.value.length > 0
        ? (poolsSetting.value as unknown as StakingPool[])
        : DEFAULT_STAKING_POOLS;

    const allStakesSetting = await prisma.appSetting.findUnique({
      where: { key: "all_user_stakes" },
    });

    const allStakes: UserStakeRecord[] =
      allStakesSetting && Array.isArray(allStakesSetting.value)
        ? (allStakesSetting.value as unknown as UserStakeRecord[])
        : [];

    return NextResponse.json({
      success: true,
      pools,
      stakes: allStakes,
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
    const { action, pool, poolId, stakeId, stakeStatus } = body;

    const poolsSetting = await prisma.appSetting.findUnique({
      where: { key: "staking_pools" },
    });
    let currentPools: StakingPool[] =
      poolsSetting && Array.isArray(poolsSetting.value) && poolsSetting.value.length > 0
        ? (poolsSetting.value as unknown as StakingPool[])
        : [...DEFAULT_STAKING_POOLS];

    if (action === "save_pool") {
      if (!pool || !pool.name || !pool.symbol) {
        return NextResponse.json({ error: "Pool name and symbol are required" }, { status: 400 });
      }

      const poolData: StakingPool = {
        id: pool.id || "pool-" + pool.symbol.toLowerCase() + "-" + Date.now().toString(36),
        name: pool.name,
        symbol: pool.symbol.toUpperCase(),
        icon: pool.icon || `/assets/coins/${pool.symbol.toUpperCase()}.svg`,
        min: Number(pool.min) || 1,
        max: Number(pool.max) || 1000,
        cycle: pool.cycle || "Daily",
        roi: Number(pool.roi) || 84,
      };

      const existingIndex = currentPools.findIndex((p) => p.id === poolData.id);
      if (existingIndex !== -1) {
        currentPools[existingIndex] = poolData;
      } else {
        currentPools.push(poolData);
      }

      await prisma.appSetting.upsert({
        where: { key: "staking_pools" },
        update: { value: currentPools as any },
        create: { key: "staking_pools", value: currentPools as any },
      });

      return NextResponse.json({
        success: true,
        pools: currentPools,
        message: "Staking pool saved successfully",
      });
    }

    if (action === "delete_pool") {
      if (!poolId) {
        return NextResponse.json({ error: "Pool ID required" }, { status: 400 });
      }

      currentPools = currentPools.filter((p) => p.id !== poolId);

      await prisma.appSetting.upsert({
        where: { key: "staking_pools" },
        update: { value: currentPools as any },
        create: { key: "staking_pools", value: currentPools as any },
      });

      return NextResponse.json({
        success: true,
        pools: currentPools,
        message: "Staking pool deleted successfully",
      });
    }

    if (action === "update_stake_status") {
      if (!stakeId || !stakeStatus) {
        return NextResponse.json({ error: "Stake ID and status are required" }, { status: 400 });
      }

      const allStakesSetting = await prisma.appSetting.findUnique({
        where: { key: "all_user_stakes" },
      });
      const allStakes: UserStakeRecord[] =
        allStakesSetting && Array.isArray(allStakesSetting.value)
          ? (allStakesSetting.value as unknown as UserStakeRecord[])
          : [];

      const targetIndex = allStakes.findIndex((s) => s.id === stakeId);
      if (targetIndex !== -1) {
        allStakes[targetIndex].status = stakeStatus;
        await prisma.appSetting.upsert({
          where: { key: "all_user_stakes" },
          update: { value: allStakes as any },
          create: { key: "all_user_stakes", value: allStakes as any },
        });

        // Also update in user-specific key
        const userId = allStakes[targetIndex].userId;
        const uKey = `user_stakes_${userId}`;
        const uSetting = await prisma.appSetting.findUnique({ where: { key: uKey } });
        if (uSetting && Array.isArray(uSetting.value)) {
          const uStakes = (uSetting.value as unknown as UserStakeRecord[]).map((s) =>
            s.id === stakeId ? { ...s, status: stakeStatus } : s
          );
          await prisma.appSetting.upsert({
            where: { key: uKey },
            update: { value: uStakes as any },
            create: { key: uKey, value: uStakes as any },
          });
        }
      }

      return NextResponse.json({
        success: true,
        stakes: allStakes,
        message: "Stake status updated successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin staking POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to update admin staking" }, { status: 500 });
  }
}
