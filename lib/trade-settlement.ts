import { prisma } from "@/lib/prisma";
import { atomic, creditMain, insertTransaction, money } from "@/lib/ledger";
import { getPrice } from "@/lib/prices";
import { notify, fmtUsd } from "@/lib/notify";
import { getTradeConfig } from "@/lib/trade-config";

export async function closePositionAndSettle({
  positionId,
  overridePnl,
  closedByAdmin = false,
}: {
  positionId: string;
  overridePnl?: number;
  closedByAdmin?: boolean;
}) {
  const pos = await prisma.position.findUnique({
    where: { id: positionId },
  });

  if (!pos) {
    throw new Error("Position not found");
  }
  if (pos.status === "CLOSED") {
    throw new Error("Position is already closed");
  }

  const entryPrice = pos.entryPrice.toNumber();
  const amount = pos.amount.toNumber();
  const requiredMargin = amount / pos.leverage;
  const currentMarkPrice = (await getPrice(pos.symbol)) ?? entryPrice;

  const config = await getTradeConfig(pos.id);

  let finalPnl: number;
  if (typeof overridePnl === "number" && !isNaN(overridePnl)) {
    finalPnl = money(overridePnl);
  } else if (config?.isCustomPnl && typeof config.customPnl === "number") {
    finalPnl = money(config.customPnl);
  } else if (pos.pnl && pos.pnl.toNumber() !== 0) {
    finalPnl = pos.pnl.toNumber();
  } else {
    const move = pos.type === "BUY"
      ? (currentMarkPrice - entryPrice) / entryPrice
      : (entryPrice - currentMarkPrice) / entryPrice;
    finalPnl = money(move * amount);
  }

  const returnCapital = money(Math.max(0, requiredMargin + finalPnl));

  const newBalance = await atomic(async (tx) => {
    const res = await tx.position.updateMany({
      where: { id: pos.id, status: "OPEN" },
      data: {
        status: "CLOSED",
        pnl: finalPnl,
        closedAt: new Date(),
      },
    });

    if (res.count !== 1) return null;

    const balance = await creditMain(tx, pos.userId, returnCapital);

    await insertTransaction(tx, {
      userId: pos.userId,
      type: "TRADE_CLOSE",
      amount: returnCapital,
      currency: pos.symbol,
      txHash: `CLOSE_${pos.id.substring(0, 8).toUpperCase()}`,
      status: "APPROVED",
    });

    return balance;
  });

  if (newBalance === null) {
    throw new Error("Position is already closed");
  }

  const closeMethod = closedByAdmin ? "Closed by Administrator" : "Position closed";
  await notify(
    pos.userId,
    "trade",
    closeMethod,
    `${pos.symbol} ${pos.type.toLowerCase()} closed. Realized P&L: ${finalPnl >= 0 ? "+" : "-"}${fmtUsd(Math.abs(finalPnl))}; ${fmtUsd(returnCapital)} returned to your balance.`,
  );

  return {
    success: true,
    pnl: finalPnl,
    returnCapital,
    newBalance,
    message: `Position closed. Realized PnL: ${finalPnl >= 0 ? "+" : ""}$${finalPnl.toFixed(2)}. Capital returned: $${returnCapital.toFixed(2)}`,
  };
}
