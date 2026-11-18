import { prisma } from "@/lib/prisma";
import { atomic, creditMain, insertTransaction, money } from "@/lib/ledger";
import { getVerifiedPrice } from "@/lib/prices";
import { fmtUsd } from "@/lib/notify";
import { getTradeConfig } from "@/lib/trade-config";

export async function closePositionAndSettle({
  positionId,
  overridePnl,
  fundingAssetOverride,
  closedByAdmin = false,
}: {
  positionId: string;
  overridePnl?: number;
  fundingAssetOverride?: string;
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
  const currentMarkPrice = await getVerifiedPrice(pos.symbol);
  if (!currentMarkPrice) {
    throw new Error(`A recent verified price for ${pos.symbol} is unavailable`);
  }

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
  const fundingAsset = (fundingAssetOverride || pos.fundingAsset || pos.symbol).toUpperCase();

  const newBalance = await atomic(async (tx) => {
    const res = await tx.position.updateMany({
      where: { id: pos.id, status: "OPEN" },
      data: {
        status: "CLOSED",
        pnl: finalPnl,
        closedAt: new Date(),
        fundingAsset,
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

    await tx.closedTradeResult.create({
      data: {
        positionId: pos.id,
        userId: pos.userId,
        fundingAsset,
        marketSymbol: pos.symbol,
        pnl: finalPnl,
      },
    });

    const outcome = finalPnl >= 0 ? "profit" : "loss";
    const signedPnl = `${finalPnl >= 0 ? "+" : "-"}${fmtUsd(Math.abs(finalPnl))}`;
    await tx.notification.create({
      data: {
        userId: pos.userId,
        kind: finalPnl >= 0 ? "trade_profit" : "trade_loss",
        title: `${signedPnl} ${outcome} made`,
        body: `${signedPnl} ${outcome} made using ${fundingAsset} on ${pos.symbol}. ${fmtUsd(returnCapital)} returned to your trading balance.`,
      },
    });

    return balance;
  });

  if (newBalance === null) {
    throw new Error("Position is already closed");
  }

  return {
    success: true,
    pnl: finalPnl,
    returnCapital,
    newBalance,
    fundingAsset,
    message: `Position closed. Realized PnL: ${finalPnl >= 0 ? "+" : ""}$${finalPnl.toFixed(2)}. Capital returned: $${returnCapital.toFixed(2)}`,
  };
}
