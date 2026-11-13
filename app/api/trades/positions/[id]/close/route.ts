export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, creditMain, insertTransaction, money } from "@/lib/ledger";
import { getPrice } from "@/lib/prices";
import { notify, fmtUsd } from "@/lib/notify";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: positionId } = await params;

    const pos = await prisma.position.findFirst({ where: { id: positionId, userId: session.userId } });
    if (!pos) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }
    if (pos.status === "CLOSED") {
      return NextResponse.json({ error: "Position is already closed" }, { status: 400 });
    }

    const entryPrice = pos.entryPrice.toNumber();
    const amount = pos.amount.toNumber();
    // Close at the live market price
    const currentMarkPrice = (await getPrice(pos.symbol)) ?? entryPrice;
    const requiredMargin = amount / pos.leverage;

    // Calculate PnL
    const move = pos.type === "BUY"
      ? (currentMarkPrice - entryPrice) / entryPrice
      : (entryPrice - currentMarkPrice) / entryPrice;
    const pnl = money(move * amount);
    const returnCapital = money(Math.max(0, requiredMargin + pnl));

    const newBalance = await atomic(async (tx) => {
      // 1. Close the position. Only one concurrent request can flip OPEN -> CLOSED,
      //    so a double-click can't pay out twice.
      const res = await tx.position.updateMany({
        where: { id: pos.id, status: "OPEN" },
        data: { status: "CLOSED", pnl, closedAt: new Date() },
      });
      if (res.count !== 1) return null;

      // 2. Return capital + PnL to wallet
      const balance = await creditMain(tx, session.userId, returnCapital);

      // 3. Record closing transaction
      await insertTransaction(tx, {
        userId: session.userId,
        type: "TRADE_CLOSE",
        amount: returnCapital,
        currency: pos.symbol,
        txHash: `CLOSE_${pos.id.substring(0, 8).toUpperCase()}`,
        status: "APPROVED",
      });
      return balance;
    });

    if (newBalance === null) {
      return NextResponse.json({ error: "Position is already closed" }, { status: 400 });
    }

    await notify(
      session.userId,
      "trade",
      "Position closed",
      `${pos.symbol} ${pos.type.toLowerCase()} closed at ${fmtUsd(currentMarkPrice)}. Realized P&L ${pnl >= 0 ? "+" : "-"}${fmtUsd(Math.abs(pnl))}; ${fmtUsd(returnCapital)} returned to your balance.`,
    );

    return NextResponse.json({
      success: true,
      message: `Position closed. Realized PnL: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}. Capital returned: $${returnCapital.toFixed(2)}`,
      pnl,
      returnCapital,
      newBalance,
    });
  } catch (error) {
    console.error("Close position error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
