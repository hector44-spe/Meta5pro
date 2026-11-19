export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { getVerifiedPrice } from "@/lib/prices";
import { notify, fmtUsd, fmtUnits } from "@/lib/notify";
import { z } from "zod";

const stakeSchema = z.object({
  poolId: z.string().min(1, "Pool ID is required"),
  amount: z.coerce.number().positive("Stake amount must be greater than 0"),
  durationDays: z.coerce.number().int().min(1).max(3650).default(1),
  fundingSource: z.enum(["CASH", "ASSET"]).default("CASH"),
});

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    const pools = await prisma.stakingPool.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });

    let userStakes: any[] = [];
    let userBalances: { cash: number; assets: Record<string, number> } = {
      cash: 0,
      assets: {},
    };

    if (session?.userId) {
      const [stakes, wallet, assetBalances] = await Promise.all([
        prisma.userStake.findMany({
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

      userStakes = stakes.map((s) => ({
        id: s.id,
        userId: s.userId,
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

      const assetsMap: Record<string, number> = {};
      for (const a of assetBalances) {
        assetsMap[a.symbol.toUpperCase()] = Number(a.amount);
      }

      userBalances = {
        cash: Number(wallet?.mainBalance || 0),
        assets: assetsMap,
      };
    }

    const totalStakedUsd = userStakes.reduce((acc, s) => acc + s.usdValue, 0);
    const activeStakes = userStakes.filter((s) => s.status === "ACTIVE");
    const activeStakedUsd = activeStakes.reduce((acc, s) => acc + s.usdValue, 0);
    const closedStakes = userStakes.filter((s) => s.status !== "ACTIVE");
    const closedStakedUsd = closedStakes.reduce((acc, s) => acc + s.usdValue, 0);

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
      userStakes,
      userBalances,
      stats: {
        totalStaked: totalStakedUsd,
        totalCount: userStakes.length,
        activeStaked: activeStakedUsd,
        activeCount: activeStakes.length,
        closedStaked: closedStakedUsd,
        closedCount: closedStakes.length,
      },
      isAdmin,
    });
  } catch (error) {
    console.error("Fetch staking error:", error);
    return NextResponse.json({ error: "Failed to load staking data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = stakeSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid staking parameters" },
        { status: 400 }
      );
    }

    const { poolId, amount, durationDays, fundingSource } = parsed.data;

    const pool = await prisma.stakingPool.findUnique({ where: { id: poolId } });
    if (!pool || pool.status !== "ACTIVE") {
      return NextResponse.json({ error: "Staking pool not found or inactive" }, { status: 404 });
    }

    const minAmount = Number(pool.min);
    const maxAmount = Number(pool.max);
    if (amount < minAmount || amount > maxAmount) {
      return NextResponse.json(
        { error: `Amount must be between ${minAmount} and ${maxAmount} ${pool.symbol}` },
        { status: 400 }
      );
    }

    // Determine verified price of the asset in USD
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

    const stake = await atomic(async (tx) => {
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
        // Fund using Cash USD Wallet (default)
        await debitMain(tx, session.userId, usdCost, {
          referenceType: "STAKING_SUBSCRIBE",
          counterAccount: `STAKING_POOL:${pool.id}`,
        });
      }

      const newStake = await tx.userStake.create({
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
        txHash: `STK_${newStake.id.slice(0, 8).toUpperCase()}`,
        status: "APPROVED",
      });

      return newStake;
    });

    await notify(
      session.userId,
      "balance",
      `Staked ${fmtUnits(amount, symbol)}`,
      `Your stake of ${fmtUnits(amount, symbol)} (${fmtUsd(usdCost)}) in ${pool.name} has been activated. Expected return: ${fmtUsd(expectedReturnUsd)}.`
    );

    return NextResponse.json({
      success: true,
      stake,
      message: `Successfully staked ${amount} ${symbol} (${fmtUsd(usdCost)})!`,
    });
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      return NextResponse.json(
        { error: `Insufficient balance to complete stake. Required: $${error.available.toFixed(2)}` },
        { status: 400 }
      );
    }
    console.error("Stake error:", error);
    return NextResponse.json({ error: "Failed to create stake" }, { status: 500 });
  }
}
