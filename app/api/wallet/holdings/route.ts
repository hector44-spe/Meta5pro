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

  const [deposits, withdrawals, pendingDeposits, converts, openPositions, snap] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["assetSymbol"],
      where: { userId: session.userId, type: "DEPOSIT", status: "APPROVED", assetSymbol: { not: null } },
      _sum: { assetAmount: true },
    }),
    prisma.transaction.groupBy({
      by: ["assetSymbol"],
      where: { userId: session.userId, type: "WITHDRAWAL", status: { in: ["PENDING", "APPROVED"] }, assetSymbol: { not: null } },
      _sum: { assetAmount: true },
    }),
    prisma.transaction.groupBy({
      by: ["assetSymbol"],
      where: { userId: session.userId, type: "DEPOSIT", status: "PENDING", assetSymbol: { not: null } },
      _sum: { assetAmount: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.userId, type: "TRADE_CONVERT", status: "APPROVED" },
    }),
    prisma.position.findMany({
      where: { userId: session.userId, status: "OPEN" },
    }),
    getPrices(),
  ]);

  const units = new Map<string, number>();

  // 1. Deposits
  for (const d of deposits) {
    if (d.assetSymbol) {
      const sym = d.assetSymbol.toUpperCase();
      units.set(sym, (units.get(sym) ?? 0) + Number(d._sum.assetAmount ?? 0));
    }
  }

  // 2. Withdrawals
  for (const w of withdrawals) {
    if (w.assetSymbol) {
      const sym = w.assetSymbol.toUpperCase();
      units.set(sym, (units.get(sym) ?? 0) - Number(w._sum.assetAmount ?? 0));
    }
  }

  // 3. Conversions
  for (const c of converts) {
    if (c.assetSymbol && c.assetSymbol !== "USD") {
      const sym = c.assetSymbol.toUpperCase();
      units.set(sym, (units.get(sym) ?? 0) + Number(c.assetAmount ?? 0));
    }
    if (c.currency && c.currency !== "USD") {
      const sym = c.currency.toUpperCase();
      units.set(sym, (units.get(sym) ?? 0) - Number(c.amount ?? 0));
    }
  }

  // 4. Client purchased assets from open positions (trades)
  for (const pos of openPositions) {
    const rawSym = pos.symbol.toUpperCase().replace(/\/USDT$|\/USD$|USDT$|USD$/, "").trim();
    const entry = Number(pos.entryPrice) || 1;
    const posUnits = Number(pos.amount) / entry;
    if (pos.type === "BUY") {
      units.set(rawSym, (units.get(rawSym) ?? 0) + posUnits);
    }
  }

  const pending = new Map(pendingDeposits.map((p) => [p.assetSymbol!.toUpperCase(), Number(p._sum.assetAmount ?? 0)]));
  const symbols = new Set([...units.keys(), ...pending.keys()]);
  const holdings = [...symbols]
    .map((symbol) => {
      const u = Math.max(0, units.get(symbol) ?? 0);
      const price = snap.prices[symbol] ?? null;
      return {
        symbol,
        units: Number(u.toFixed(8)),
        price,
        usd: price != null ? Math.round(u * price * 100) / 100 : null,
        pendingUnits: Number((pending.get(symbol) ?? 0).toFixed(8)),
      };
    })
    .filter((h) => h.units > 0 || h.pendingUnits > 0)
    .sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));

  return NextResponse.json({
    success: true,
    holdings,
    totalUsd: Math.round(holdings.reduce((s, h) => s + (h.usd ?? 0), 0) * 100) / 100,
    pricesUpdatedAt: snap.updatedAt,
    live: snap.live,
  });
}
