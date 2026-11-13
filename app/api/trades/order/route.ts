export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
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

    const parsed = orderSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid order parameters" },
        { status: 400 },
      );
    }

    const { side, symbol, amount, leverage } = parsed.data;

    // Required margin for position
    const requiredMargin = money(amount / leverage);

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

    try {
      const { position, tx, newBalance } = await atomic(async (t) => {
        // 1. Deduct margin (throws if balance is insufficient)
        const newBalance = await debitMain(t, session.userId, requiredMargin);

        // 2. Open the position
        const position = await t.position.create({
          data: { userId: session.userId, symbol, type: side, amount, entryPrice: fillPrice, leverage },
        });

        // 3. Record trade transaction
        const tx = await insertTransaction(t, {
          userId: session.userId,
          type: `TRADE_${side}`,
          amount,
          currency: symbol,
          txHash: `ORD_${position.id.substring(0, 8).toUpperCase()}`,
          status: "APPROVED",
        });
        return { position, tx, newBalance };
      });

      return NextResponse.json({
        success: true,
        order: {
          id: position.id,
          side,
          symbol,
          notionalAmount: amount,
          leverage,
          requiredMargin,
          fillPrice,
          filledQuantity,
          timestamp: position.createdAt.toISOString(),
          transactionId: tx.id,
        },
        newBalance,
        message: `${side} order for $${amount} ${symbol} executed at $${fillPrice}. Margin locked: $${requiredMargin.toFixed(2)}`,
      });
    } catch (e) {
      if (e instanceof InsufficientFundsError) {
        return NextResponse.json(
          {
            error: `Insufficient margin. Required: $${requiredMargin.toFixed(2)} USD, Available: $${e.available.toFixed(2)} USD`,
          },
          { status: 400 },
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("Order execution error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
