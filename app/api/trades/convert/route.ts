export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPrices } from "@/lib/prices";

// GET user's conversion / swap transactions
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const swaps = await prisma.transaction.findMany({
      where: {
        userId: session.userId,
        type: "TRADE_CONVERT",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      swaps: swaps.map((s) => ({
        id: s.id,
        createdAt: s.createdAt.toISOString(),
        trade: `${s.currency} → ${s.assetSymbol || "USD"}`,
        from: `${Number(s.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${s.currency}`,
        to: `${Number(s.assetAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${s.assetSymbol || "USD"}`,
        status: s.status === "APPROVED" ? "Completed" : s.status,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch swaps:", error);
    return NextResponse.json({ error: "Failed to fetch swaps" }, { status: 500 });
  }
}

// POST execute conversion
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const fromSymbol = String(body.fromSymbol || "USD").toUpperCase();
    const toSymbol = String(body.toSymbol || "BTC").toUpperCase();
    const fromAmount = parseFloat(body.fromAmount);
    const toAmount = parseFloat(body.toAmount);

    if (isNaN(fromAmount) || fromAmount <= 0) {
      return NextResponse.json({ error: "Please enter a valid amount to convert." }, { status: 400 });
    }

    if (fromSymbol === toSymbol) {
      return NextResponse.json({ error: "Cannot convert to the same asset." }, { status: 400 });
    }

    // Verify wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const currentBalance = Number(wallet.mainBalance);

    // If converting From USD to Crypto:
    if (fromSymbol === "USD") {
      if (currentBalance < fromAmount) {
        return NextResponse.json(
          { error: `Insufficient USD balance. You have $${currentBalance.toFixed(2)}, but tried to convert $${fromAmount.toFixed(2)}.` },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // Deduct USD from main balance
        await tx.wallet.update({
          where: { userId: session.userId },
          data: {
            mainBalance: {
              decrement: fromAmount,
            },
          },
        });

        // Record approved conversion transaction
        await tx.transaction.create({
          data: {
            userId: session.userId,
            type: "TRADE_CONVERT",
            amount: fromAmount,
            currency: "USD",
            assetSymbol: toSymbol,
            assetAmount: toAmount,
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });

        // Add in-app notification
        await tx.notification.create({
          data: {
            userId: session.userId,
            title: "Asset Conversion Completed",
            body: `You successfully converted $${fromAmount.toFixed(2)} USD to ${toAmount.toFixed(6)} ${toSymbol}.`,
            kind: "trade",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully converted $${fromAmount.toFixed(2)} USD to ${toAmount.toFixed(6)} ${toSymbol}.`,
      });
    }

    // If converting From Crypto to USD:
    if (toSymbol === "USD") {
      await prisma.$transaction(async (tx) => {
        // Credit USD to main balance
        await tx.wallet.update({
          where: { userId: session.userId },
          data: {
            mainBalance: {
              increment: toAmount,
            },
          },
        });

        // Record conversion
        await tx.transaction.create({
          data: {
            userId: session.userId,
            type: "TRADE_CONVERT",
            amount: fromAmount,
            currency: fromSymbol,
            assetSymbol: "USD",
            assetAmount: toAmount,
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });

        await tx.notification.create({
          data: {
            userId: session.userId,
            title: "Asset Conversion Completed",
            body: `You successfully converted ${fromAmount.toFixed(6)} ${fromSymbol} to $${toAmount.toFixed(2)} USD.`,
            kind: "trade",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully converted ${fromAmount.toFixed(6)} ${fromSymbol} to $${toAmount.toFixed(2)} USD.`,
      });
    }

    // Crypto to Crypto conversion (e.g. BTC to ETH)
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId: session.userId,
          type: "TRADE_CONVERT",
          amount: fromAmount,
          currency: fromSymbol,
          assetSymbol: toSymbol,
          assetAmount: toAmount,
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: session.userId,
          title: "Asset Conversion Completed",
          body: `You successfully converted ${fromAmount} ${fromSymbol} to ${toAmount} ${toSymbol}.`,
          kind: "trade",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully converted ${fromAmount} ${fromSymbol} to ${toAmount} ${toSymbol}.`,
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json({ error: "Failed to complete asset conversion." }, { status: 500 });
  }
}
