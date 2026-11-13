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

  const [deposits, withdrawals, pendingDeposits, snap] = await Promise.all([
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
    getPrices(),
  ]);

  const units = new Map<string, number>();
  for (const d of deposits) units.set(d.assetSymbol!, (units.get(d.assetSymbol!) ?? 0) + Number(d._sum.assetAmount ?? 0));
  for (const w of withdrawals) units.set(w.assetSymbol!, (units.get(w.assetSymbol!) ?? 0) - Number(w._sum.assetAmount ?? 0));
  const pending = new Map(pendingDeposits.map((p) => [p.assetSymbol!, Number(p._sum.assetAmount ?? 0)]));

  const symbols = new Set([...units.keys(), ...pending.keys()]);
  const holdings = [...symbols]
    .map((symbol) => {
      const u = Math.max(0, units.get(symbol) ?? 0);
      const price = snap.prices[symbol] ?? null;
      return {
        symbol,
        units: Number(u.toFixed(10)),
        price,
        usd: price != null ? Math.round(u * price * 100) / 100 : null,
        pendingUnits: Number((pending.get(symbol) ?? 0).toFixed(10)),
      };
    })
    .sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));

  return NextResponse.json({
    success: true,
    holdings,
    totalUsd: Math.round(holdings.reduce((s, h) => s + (h.usd ?? 0), 0) * 100) / 100,
    pricesUpdatedAt: snap.updatedAt,
    live: snap.live,
  });
}
