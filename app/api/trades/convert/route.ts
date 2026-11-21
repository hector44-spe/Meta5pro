export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getVerifiedPrice } from "@/lib/prices";
import { atomic, creditMain, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { z } from "zod";

const conversionSchema = z.object({
  fromSymbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/),
  toSymbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/),
  fromAmount: z.coerce.number().positive().max(1e12),
}).strict();

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const swaps = await prisma.transaction.findMany({
      where: { userId: session.userId, type: "TRADE_CONVERT" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({
      success: true,
      swaps: swaps.map((swap) => ({
        id: swap.id,
        createdAt: swap.createdAt.toISOString(),
        trade: `${swap.currency} → ${swap.assetSymbol || "USD"}`,
        from: `${Number(swap.amount).toLocaleString(undefined, { maximumFractionDigits: 8 })} ${swap.currency}`,
        to: `${Number(swap.assetAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })} ${swap.assetSymbol || "USD"}`,
        status: swap.status === "APPROVED" ? "Completed" : swap.status,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch swaps:", error);
    return NextResponse.json({ error: "Failed to fetch swaps" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.status === "FROZEN") {
    return NextResponse.json(
      { error: "Your account is frozen. Asset conversions are disabled." },
      { status: 403 },
    );
  }

  try {
    const parsed = conversionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid conversion" }, { status: 400 });
    }
    const { fromSymbol, toSymbol, fromAmount } = parsed.data;
    if (fromSymbol === toSymbol) {
      return NextResponse.json({ error: "Cannot convert an asset to itself" }, { status: 400 });
    }

    const [fromPrice, toPrice] = await Promise.all([
      fromSymbol === "USD" ? Promise.resolve(1) : getVerifiedPrice(fromSymbol),
      toSymbol === "USD" ? Promise.resolve(1) : getVerifiedPrice(toSymbol),
    ]);
    if (!fromPrice || !toPrice) {
      return NextResponse.json({ error: "A recent verified market quote is unavailable" }, { status: 503 });
    }
    const usdValue = money(fromAmount * fromPrice);
    const toAmount = Number((usdValue / toPrice).toFixed(10));

    await atomic(async (tx) => {
      if (fromSymbol === "USD") {
        await debitMain(tx, session.userId, usdValue, {
          referenceType: "TRADE_CONVERT",
          counterAccount: `ASSET:${toSymbol}`,
        });
      } else {
        const claimed = await tx.assetBalance.updateMany({
          where: { userId: session.userId, symbol: fromSymbol, amount: { gte: fromAmount } },
          data: { amount: { decrement: fromAmount } },
        });
        if (claimed.count !== 1) throw new InsufficientFundsError(0);
      }

      if (toSymbol === "USD") {
        await creditMain(tx, session.userId, usdValue, {
          referenceType: "TRADE_CONVERT",
          counterAccount: `ASSET:${fromSymbol}`,
        });
      } else {
        await tx.assetBalance.upsert({
          where: { userId_symbol: { userId: session.userId, symbol: toSymbol } },
          create: { userId: session.userId, symbol: toSymbol, amount: toAmount },
          update: { amount: { increment: toAmount } },
        });
      }

      await insertTransaction(tx, {
        userId: session.userId,
        type: "TRADE_CONVERT",
        amount: fromAmount,
        currency: fromSymbol,
        assetSymbol: toSymbol,
        assetAmount: toAmount,
        status: "APPROVED",
      });
      await tx.notification.create({
        data: {
          userId: session.userId,
          title: "Asset Conversion Completed",
          body: `Converted ${fromAmount} ${fromSymbol} to ${toAmount} ${toSymbol} using verified market prices.`,
          kind: "trade",
        },
      });
    });

    return NextResponse.json({
      success: true,
      fromSymbol,
      fromAmount,
      toSymbol,
      toAmount,
      usdValue,
      message: `Successfully converted ${fromAmount} ${fromSymbol} to ${toAmount} ${toSymbol}.`,
    });
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      return NextResponse.json({ error: "Insufficient source-asset balance" }, { status: 400 });
    }
    console.error("Conversion error:", error);
    return NextResponse.json({ error: "Failed to complete asset conversion." }, { status: 500 });
  }
}
