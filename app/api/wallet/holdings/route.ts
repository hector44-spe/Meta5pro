export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPrices } from "@/lib/prices";

/**
 * Per-asset holdings for the signed-in user:
 *   approved deposits − (pending + approved) withdrawals, per coin,
 * valued at the live price. Pending withdrawals count as already out
 * because those funds are on hold.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [deposits, withdrawals, pendingDeposits, conversions, portfolioAssets, snap] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["assetSymbol"],
      where: { userId: session.userId, type: "DEPOSIT", status: "APPROVED", assetSymbol: { not: null } },
      _sum: { assetAmount: true, amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["assetSymbol"],
      where: { userId: session.userId, type: "WITHDRAWAL", status: { in: ["PENDING", "APPROVED"] }, assetSymbol: { not: null } },
      _sum: { assetAmount: true, amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["assetSymbol"],
      where: { userId: session.userId, type: "DEPOSIT", status: "PENDING", assetSymbol: { not: null } },
      _sum: { assetAmount: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.userId,
        type: "TRADE_CONVERT",
        status: "APPROVED",
        assetSymbol: { not: null },
      },
      select: { currency: true, amount: true, assetSymbol: true, assetAmount: true },
    }),
    prisma.assetBalance.findMany({ where: { userId: session.userId, amount: { gt: 0 } } }),
    getPrices(),
  ]);

  const externalUnits = new Map<string, number>();
  const externalBook = new Map<string, number>();
  const externalCost = new Map<string, number>();
  const convertedUnits = new Map<string, number>();
  const convertedCost = new Map<string, number>();
  const portfolioUnits = new Map<string, number>();

  // 1. Deposits (Strictly APPROVED deposits only)
  for (const d of deposits) {
    if (d.assetSymbol) {
      const sym = d.assetSymbol.toUpperCase();
      const depositUnits = Number(d._sum.assetAmount ?? 0);
      externalUnits.set(sym, (externalUnits.get(sym) ?? 0) + depositUnits);
      externalBook.set(sym, (externalBook.get(sym) ?? 0) + Number(d._sum.amount ?? 0));
    }
  }

  // 2. Withdrawals
  for (const w of withdrawals) {
    if (w.assetSymbol) {
      const sym = w.assetSymbol.toUpperCase();
      externalUnits.set(sym, (externalUnits.get(sym) ?? 0) - Number(w._sum.assetAmount ?? 0));
      externalBook.set(sym, (externalBook.get(sym) ?? 0) - Number(w._sum.amount ?? 0));
    }
  }

  // Keep the acquisition basis of the remaining externally deposited units.
  for (const d of deposits) {
    if (!d.assetSymbol) continue;
    const sym = d.assetSymbol.toUpperCase();
    const depositedUnits = Number(d._sum.assetAmount ?? 0);
    const remainingUnits = Math.max(0, externalUnits.get(sym) ?? 0);
    const remainingRatio = depositedUnits > 0 ? Math.min(1, remainingUnits / depositedUnits) : 0;
    externalCost.set(sym, Number(d._sum.amount ?? 0) * remainingRatio);
  }

  // 3. Canonical balances created by conversions.
  for (const asset of portfolioAssets) {
    portfolioUnits.set(asset.symbol.toUpperCase(), asset.amount.toNumber());
  }

  // USD-to-asset conversions have an exact acquisition cost. For older or
  // asset-to-asset conversions without enough history, the uncovered units are
  // initialized at their current value rather than reporting a fictitious gain.
  for (const conversion of conversions) {
    if (!conversion.assetSymbol || conversion.currency.toUpperCase() !== "USD") continue;
    const sym = conversion.assetSymbol.toUpperCase();
    convertedUnits.set(sym, (convertedUnits.get(sym) ?? 0) + Number(conversion.assetAmount ?? 0));
    convertedCost.set(sym, (convertedCost.get(sym) ?? 0) + conversion.amount.toNumber());
  }

  const pending = new Map(pendingDeposits.map((p) => [p.assetSymbol!.toUpperCase(), Number(p._sum.assetAmount ?? 0)]));
  const symbols = new Set([...externalUnits.keys(), ...portfolioUnits.keys(), ...pending.keys()]);
  const holdings = [...symbols]
    .map((symbol) => {
      const depositedUnits = Math.max(0, externalUnits.get(symbol) ?? 0);
      const convertedBalance = Math.max(0, portfolioUnits.get(symbol) ?? 0);
      const u = depositedUnits + convertedBalance;
      const price = snap.prices[symbol] ?? null;
      const usd = price != null ? u * price : null;
      const acquiredByConversion = convertedUnits.get(symbol) ?? 0;
      const knownConvertedCost = convertedCost.get(symbol) ?? 0;
      const coveredConvertedUnits = Math.min(convertedBalance, acquiredByConversion);
      const convertedBasis = acquiredByConversion > 0
        ? knownConvertedCost * (coveredConvertedUnits / acquiredByConversion)
        : 0;
      const uncoveredConvertedUnits = Math.max(0, convertedBalance - coveredConvertedUnits);
      const costBasisUsd = (externalCost.get(symbol) ?? 0) + convertedBasis + (price != null ? uncoveredConvertedUnits * price : 0);
      const changeUsd = usd != null ? usd - costBasisUsd : 0;
      const changePercent = costBasisUsd > 0 ? (changeUsd / costBasisUsd) * 100 : 0;
      return {
        symbol,
        units: Number(u.toFixed(8)),
        price,
        usd: usd != null ? Math.round(usd * 100) / 100 : null,
        costBasisUsd: Math.round(costBasisUsd * 100) / 100,
        changeUsd: Math.round(changeUsd * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        marketChange24h: Math.round((snap.changes24h[symbol] ?? 0) * 100) / 100,
        externalBookUsd: Math.round((externalBook.get(symbol) ?? 0) * 100) / 100,
        pendingUnits: Number((pending.get(symbol) ?? 0).toFixed(8)),
      };
    })
    .filter((h) => h.units > 0 || h.pendingUnits > 0)
    .sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));

  const totalUsd = holdings.reduce((sum, holding) => sum + (holding.usd ?? 0), 0);
  const totalCostBasisUsd = holdings.reduce((sum, holding) => sum + holding.costBasisUsd, 0);
  const totalChangeUsd = totalUsd - totalCostBasisUsd;
  const externalBookUsd = [...externalBook.values()].reduce((sum, amount) => sum + amount, 0);

  return NextResponse.json({
    success: true,
    holdings,
    summary: {
      totalUsd: Math.round(totalUsd * 100) / 100,
      totalCostBasisUsd: Math.round(totalCostBasisUsd * 100) / 100,
      totalChangeUsd: Math.round(totalChangeUsd * 100) / 100,
      totalChangePercent: totalCostBasisUsd > 0 ? Math.round((totalChangeUsd / totalCostBasisUsd) * 10_000) / 100 : 0,
      externalBookUsd: Math.round(externalBookUsd * 100) / 100,
      equityAdjustmentUsd: Math.round((totalUsd - externalBookUsd) * 100) / 100,
    },
    pricesUpdatedAt: snap.updatedAt,
    live: snap.live,
  });
}
