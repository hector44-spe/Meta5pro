import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DEFAULT_MINING_POOLS, MiningPool, UserMiningRecord } from "@/lib/miningData";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const poolsSetting = await prisma.appSetting.findUnique({
      where: { key: "mining_pools" },
    });

    const pools: MiningPool[] =
      poolsSetting && Array.isArray(poolsSetting.value) && poolsSetting.value.length > 0
        ? (poolsSetting.value as unknown as MiningPool[])
        : DEFAULT_MINING_POOLS;

    const allMiningsSetting = await prisma.appSetting.findUnique({
      where: { key: "all_user_minings" },
    });

    const allMinings: UserMiningRecord[] =
      allMiningsSetting && Array.isArray(allMiningsSetting.value)
        ? (allMiningsSetting.value as unknown as UserMiningRecord[])
        : [];

    return NextResponse.json({
      success: true,
      pools,
      minings: allMinings,
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
    const { action, pool, poolId, miningId, miningStatus } = body;

    const poolsSetting = await prisma.appSetting.findUnique({
      where: { key: "mining_pools" },
    });
    let currentPools: MiningPool[] =
      poolsSetting && Array.isArray(poolsSetting.value) && poolsSetting.value.length > 0
        ? (poolsSetting.value as unknown as MiningPool[])
        : [...DEFAULT_MINING_POOLS];

    if (action === "save_pool") {
      if (!pool || !pool.name || !pool.symbol) {
        return NextResponse.json({ error: "Pool name and symbol are required" }, { status: 400 });
      }

      const poolData: MiningPool = {
        id: pool.id || "mine-" + pool.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36),
        name: pool.name,
        symbol: pool.symbol.toUpperCase(),
        badge: pool.badge || `${pool.symbol.toUpperCase()} Pool`,
        icon: pool.icon || `/assets/coins/${pool.symbol.toUpperCase()}.svg`,
        hardwareImage: pool.hardwareImage || "/assets/coins/l9.png",
        min: Number(pool.min) || 0.1,
        max: Number(pool.max) || 10,
        roi: Number(pool.roi) || 100,
        cycle: pool.cycle || "Daily",
        hashrate: pool.hashrate || "18,036,473 GH/s",
      };

      const existingIndex = currentPools.findIndex((p) => p.id === poolData.id);
      if (existingIndex !== -1) {
        currentPools[existingIndex] = poolData;
      } else {
        currentPools.push(poolData);
      }

      await prisma.appSetting.upsert({
        where: { key: "mining_pools" },
        update: { value: currentPools as any },
        create: { key: "mining_pools", value: currentPools as any },
      });

      return NextResponse.json({
        success: true,
        pools: currentPools,
        message: "Mining pool saved successfully",
      });
    }

    if (action === "delete_pool") {
      if (!poolId) {
        return NextResponse.json({ error: "Pool ID required" }, { status: 400 });
      }

      currentPools = currentPools.filter((p) => p.id !== poolId);

      await prisma.appSetting.upsert({
        where: { key: "mining_pools" },
        update: { value: currentPools as any },
        create: { key: "mining_pools", value: currentPools as any },
      });

      return NextResponse.json({
        success: true,
        pools: currentPools,
        message: "Mining pool deleted successfully",
      });
    }

    if (action === "update_mining_status") {
      if (!miningId || !miningStatus) {
        return NextResponse.json({ error: "Mining ID and status are required" }, { status: 400 });
      }

      const allMiningsSetting = await prisma.appSetting.findUnique({
        where: { key: "all_user_minings" },
      });
      const allMinings: UserMiningRecord[] =
        allMiningsSetting && Array.isArray(allMiningsSetting.value)
          ? (allMiningsSetting.value as unknown as UserMiningRecord[])
          : [];

      const targetIndex = allMinings.findIndex((m) => m.id === miningId);
      if (targetIndex !== -1) {
        allMinings[targetIndex].status = miningStatus;
        await prisma.appSetting.upsert({
          where: { key: "all_user_minings" },
          update: { value: allMinings as any },
          create: { key: "all_user_minings", value: allMinings as any },
        });

        const userId = allMinings[targetIndex].userId;
        const uKey = `user_minings_${userId}`;
        const uSetting = await prisma.appSetting.findUnique({ where: { key: uKey } });
        if (uSetting && Array.isArray(uSetting.value)) {
          const uMinings = (uSetting.value as unknown as UserMiningRecord[]).map((m) =>
            m.id === miningId ? { ...m, status: miningStatus } : m
          );
          await prisma.appSetting.upsert({
            where: { key: uKey },
            update: { value: uMinings as any },
            create: { key: uKey, value: uMinings as any },
          });
        }
      }

      return NextResponse.json({
        success: true,
        minings: allMinings,
        message: "Mining status updated successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin mining POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to update admin mining" }, { status: 500 });
  }
}
