export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: positionId } = await params;

    const stmt = sqlite.prepare("SELECT * FROM positions WHERE id = ? AND userId = ?");
    const pos = stmt.get(positionId, session.userId) as any;

    if (!pos) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    if (pos.status === "CLOSED") {
      return NextResponse.json({ error: "Position is already closed" }, { status: 400 });
    }

    const marketPrices: Record<string, number> = {
      BTC: 86900.0,
      ETH: 2710.0,
      SOL: 188.0,
      XRP: 1.48,
      USDT: 1.0,
      USDC: 1.0,
    };

    const currentMarkPrice = marketPrices[pos.symbol] || pos.entryPrice;
    const requiredMargin = Number(pos.amount) / Number(pos.leverage);

    // Calculate PnL
    let pnl = 0;
    if (pos.type === "BUY") {
      pnl = ((currentMarkPrice - Number(pos.entryPrice)) / Number(pos.entryPrice)) * Number(pos.amount);
    } else {
      pnl = ((Number(pos.entryPrice) - currentMarkPrice) / Number(pos.entryPrice)) * Number(pos.amount);
    }

    const returnCapital = Math.max(0, requiredMargin + pnl);
    const now = new Date().toISOString();

    // 1. Update position
    sqlite.prepare(`
      UPDATE positions
      SET status = 'CLOSED', pnl = ?, closedAt = ?
      WHERE id = ?
    `).run(pnl, now, pos.id);

    // 2. Return capital + PnL to wallet
    const wallet = await db.wallet.findUnique({ where: { userId: session.userId } });
    const currentBalance = wallet?.mainBalance || 0.0;
    const newBalance = currentBalance + returnCapital;

    await db.wallet.update({
      where: { userId: session.userId },
      data: { mainBalance: newBalance },
    });

    // 3. Record closing transaction
    await db.transaction.create({
      data: {
        userId: session.userId,
        type: "TRADE_CLOSE",
        amount: returnCapital,
        currency: pos.symbol,
        txHash: `CLOSE_${pos.id.substring(4, 12).toUpperCase()}`,
        status: "APPROVED",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Position closed. Realized PnL: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}. Capital returned: $${returnCapital.toFixed(2)}`,
      pnl,
      returnCapital,
      newBalance,
    });
  } catch (error) {
    console.error("Close position error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
