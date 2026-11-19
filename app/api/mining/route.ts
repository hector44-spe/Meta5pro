export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { getVerifiedPrice } from "@/lib/prices";
import { notify, fmtUsd, fmtUnits } from "@/lib/notify";
import { z } from "zod";

const mineSchema = z.object({
  poolId: z.string().min(1, "Pool ID is required"),
  amount: z.coerce.number().positive("Mining amount must be greater than 0"),
  durationDays: z.coerce.number().int().min(1).max(3650).default(30),
  fundingSource: z.enum(["CASH", "ASSET"]).default("CASH"),
});

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    const [pools, miningSettings] = await Promise.all([
      prisma.miningPool.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      }),
      prisma.appSetting.findUnique({ where: { key: "mining_settings" } }).catch(() => null),
    ]);

    const useMinerPictures = miningSettings?.value && typeof (miningSettings.value as any).useMinerPictures === "boolean"
      ? (miningSettings.value as any).useMinerPictures
      : true;

    let userMinings: any[] = [];
    let userBalances: { cash: number; assets: Record<string, number> } = {
      cash: 0,
      assets: {},
    };

    if (session?.userId) {
      const [contracts, wallet, assetBalances] = await Promise.all([
        prisma.userMining.findMany({
          where: { userId: session.userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.wallet.findUnique({
          where: { userId: session.userId },
          select: { mainBalance: true },
        }),
        prisma.assetBalance.findMany({
          where: { userId: session.userId },
        }),
      ]);

      userMinings = contracts.map((m) => ({
        id: m.id,
        userId: m.userId,
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

      const assetsMap: Record<string, number> = {};
      for (const a of assetBalances) {
        assetsMap[a.symbol.toUpperCase()] = Number(a.amount);
      }

      userBalances = {
        cash: Number(wallet?.mainBalance || 0),
        assets: assetsMap,
      };
    }

    const totalMinedUsd = userMinings.reduce((acc, m) => acc + m.usdValue, 0);
    const activeMinings = userMinings.filter((m) => m.status === "ACTIVE");
    const activeMinedUsd = activeMinings.reduce((acc, m) => acc + m.usdValue, 0);
    const closedMinings = userMinings.filter((m) => m.status !== "ACTIVE");
    const closedMinedUsd = closedMinings.reduce((acc, m) => acc + m.usdValue, 0);

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
      userMinings,
      userBalances,
      useMinerPictures,
      stats: {
        totalMined: totalMinedUsd,
        totalCount: userMinings.length,
        activeMined: activeMinedUsd,
        activeCount: activeMinings.length,
        closedMined: closedMinedUsd,
        closedCount: closedMinings.length,
        totalHashrate: "18,036,473 GH/s",
      },
      isAdmin,
    });
  } catch (error) {
    console.error("Fetch mining error:", error);
    return NextResponse.json({ error: "Failed to load mining data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = mineSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid mining parameters" },
        { status: 400 }
      );
    }

    const { poolId, amount, durationDays, fundingSource } = parsed.data;

    const pool = await prisma.miningPool.findUnique({ where: { id: poolId } });
    if (!pool || pool.status !== "ACTIVE") {
      return NextResponse.json({ error: "Mining pool not found or inactive" }, { status: 404 });
    }

    const minAmount = Number(pool.min);
    const maxAmount = Number(pool.max);
    if (amount < minAmount || amount > maxAmount) {
      return NextResponse.json(
        { error: `Amount must be between ${minAmount} and ${maxAmount} ${pool.symbol}` },
        { status: 400 }
      );
    }

    const symbol = pool.symbol.toUpperCase();
    const livePrice = symbol === "USDT" || symbol === "USD" ? 1 : await getVerifiedPrice(symbol);
    if (!livePrice || livePrice <= 0) {
      return NextResponse.json(
        { error: `A verified live price for ${symbol} is temporarily unavailable. Try again shortly.` },
        { status: 503 }
      );
    }

    const usdCost = money(amount * livePrice);
    const roiNum = Number(pool.roi);
    const expectedYieldUsd = (usdCost * (roiNum / 100) * durationDays) / 365;
    const expectedReturnUsd = money(usdCost + expectedYieldUsd);
    const endDate = new Date(Date.now() + durationDays * 86400000);

    const contract = await atomic(async (tx) => {
      if (fundingSource === "ASSET" && symbol !== "USD") {
        const userAsset = await tx.assetBalance.findUnique({
          where: { userId_symbol: { userId: session.userId, symbol } },
        });
        const currentUnits = Number(userAsset?.amount || 0);
        if (currentUnits < amount) {
          throw new InsufficientFundsError(currentUnits);
        }
        await tx.assetBalance.update({
          where: { userId_symbol: { userId: session.userId, symbol } },
          data: { amount: { decrement: amount } },
        });
      } else {
        await debitMain(tx, session.userId, usdCost, {
          referenceType: "MINING_SUBSCRIBE",
          counterAccount: `MINING_POOL:${pool.id}`,
        });
      }

      const newContract = await tx.userMining.create({
        data: {
          userId: session.userId,
          poolId: pool.id,
          poolName: pool.name,
          symbol,
          amount,
          usdValue: usdCost,
          durationDays,
          roi: roiNum,
          expectedReturnUsd,
          accruedProfitUsd: 0,
          daysRemaining: durationDays,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
        },
      });

      await insertTransaction(tx, {
        userId: session.userId,
        type: "INVESTMENT_SUBSCRIBE",
        amount: usdCost,
        currency: "USD",
        assetSymbol: symbol,
        assetAmount: amount,
        txHash: `MIN_${newContract.id.slice(0, 8).toUpperCase()}`,
        status: "APPROVED",
      });

      return newContract;
    });

    await notify(
      session.userId,
      "balance",
      `Mining Contract Started: ${pool.name}`,
      `Your cloud mining contract for ${fmtUnits(amount, symbol)} (${fmtUsd(usdCost)}) on ${pool.name} is now active. Expected return: ${fmtUsd(expectedReturnUsd)}.`
    );

    return NextResponse.json({
      success: true,
      mining: contract,
      message: `Successfully started mining with ${amount} ${symbol} (${fmtUsd(usdCost)})!`,
    });
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      return NextResponse.json(
        { error: `Insufficient balance to start mining. Required: $${error.available.toFixed(2)}` },
        { status: 400 }
      );
    }
    console.error("Mining error:", error);
    return NextResponse.json({ error: "Failed to start mining" }, { status: 500 });
  }
}
