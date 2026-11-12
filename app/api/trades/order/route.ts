export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const orderSchema = z.object({
  side: z.enum(["BUY", "SELL", "CONVERT"]),
  symbol: z.string().default("BTC"),
  amount: z.number().positive("Trade amount must be positive"),
  leverage: z.number().int().min(1).max(100).default(5),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid order parameters" },
        { status: 400 },
      );
    }

    const { side, symbol, amount, leverage } = parsed.data;

    const wallet = await db.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Required margin for position
    const requiredMargin = amount / leverage;

    if (wallet.mainBalance < requiredMargin) {
      return NextResponse.json(
        {
          error: `Insufficient margin. Required: $${requiredMargin.toFixed(
            2,
          )} USD, Available: $${wallet.mainBalance.toFixed(2)} USD`,
        },
        { status: 400 },
      );
    }

    // Reference execution prices
    const marketPrices: Record<string, number> = {
      BTC: 86450.0,
      ETH: 2680.0,
      SOL: 185.0,
      XRP: 1.45,
      USDT: 1.0,
      USDC: 1.0,
    };

    const fillPrice = marketPrices[symbol] || 86450.0;
    const filledQuantity = (amount / fillPrice).toFixed(6);

    // 1. Deduct margin from wallet
    const newBalance = wallet.mainBalance - requiredMargin;
    await db.wallet.update({
      where: { userId: session.userId },
      data: { mainBalance: newBalance },
    });

    // 2. Insert into positions table
    const positionId = "pos_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    const now = new Date().toISOString();
    sqlite.prepare(`
      INSERT INTO positions (id, userId, symbol, type, amount, entryPrice, leverage, status, pnl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', 0.0, ?)
    `).run(positionId, session.userId, symbol, side, amount, fillPrice, leverage, now);

    // 3. Record trade transaction
    const tx = await db.transaction.create({
      data: {
        userId: session.userId,
        type: `TRADE_${side}`,
        amount,
        currency: symbol,
        txHash: `ORD_${positionId.substring(4, 12).toUpperCase()}`,
        status: "APPROVED",
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: positionId,
        side,
        symbol,
        notionalAmount: amount,
        leverage,
        requiredMargin,
        fillPrice,
        filledQuantity,
        timestamp: now,
        transactionId: tx.id,
      },
      newBalance,
      message: `${side} order for $${amount} ${symbol} executed at $${fillPrice}. Margin locked: $${requiredMargin.toFixed(2)}`,
    });
  } catch (error) {
    console.error("Order execution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
