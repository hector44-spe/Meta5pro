export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { getVerifiedPrice } from "@/lib/prices";
import { notify, fmtUsd } from "@/lib/notify";
import { setTradeConfig } from "@/lib/trade-config";
import { z } from "zod";

function parseDurationMs(durationStr: string): number {
  const lower = durationStr.toLowerCase().trim();
  if (lower.includes("1 min")) return 60 * 1000;
  if (lower.includes("2 min")) return 2 * 60 * 1000;
  if (lower.includes("5 min")) return 5 * 60 * 1000;
  if (lower.includes("15 min")) return 15 * 60 * 1000;
  if (lower.includes("30 min")) return 30 * 60 * 1000;
  if (lower.includes("1 hour") || lower.includes("1 hr")) return 60 * 60 * 1000;
  if (lower.includes("4 hour") || lower.includes("4 hr")) return 4 * 60 * 60 * 1000;
  if (lower.includes("24 hour") || lower.includes("1 day")) return 24 * 60 * 60 * 1000;
  return 2 * 60 * 1000;
}

const orderSchema = z.object({
  side: z.enum(["BUY", "SELL", "CONVERT"]),
  symbol: z.string().default("BTC"),
  amount: z.number().positive("Trade amount must be positive"),
  leverage: z.number().int().min(1).max(100).default(5),
  duration: z.string().optional().default("2 minutes"),
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

    const { side, symbol, amount, leverage, duration } = parsed.data;
    const durationMs = parseDurationMs(duration);
    const closeAt = new Date(Date.now() + durationMs).toISOString();

    // Required margin for position
    const requiredMargin = money(amount / leverage);

    // Fill at the live market price
    const fillPrice = await getVerifiedPrice(symbol);
    if (!fillPrice) {
      return NextResponse.json({ error: `No live price for ${symbol}. Try again shortly.` }, { status: 503 });
    }
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
        const rawSym = symbol.toUpperCase().replace(/\/USDT$|\/USD$|USDT$|USD$/, "").trim();
        const tx = await insertTransaction(t, {
          userId: session.userId,
          type: `TRADE_${side}`,
          amount,
          currency: symbol,
          assetSymbol: rawSym,
          assetAmount: Number(filledQuantity),
          txHash: `ORD_${position.id.substring(0, 8).toUpperCase()}`,
          status: "APPROVED",
        });
        return { position, tx, newBalance };
      });

      // Save duration & closing schedule
      await setTradeConfig(position.id, {
        duration,
        closeAt,
      });

      await notify(
        session.userId,
        "trade",
        `${side === "BUY" ? "Buy" : side === "SELL" ? "Sell" : "Convert"} order filled`,
        `${fmtUsd(amount)} of ${symbol} at ${fmtUsd(fillPrice)} with ${leverage}x leverage. Margin held: ${fmtUsd(requiredMargin)}. Duration: ${duration}.`,
      );

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
          duration,
          closeAt,
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
