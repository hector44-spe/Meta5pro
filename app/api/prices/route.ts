export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getPricesFast } from "@/lib/prices";

/**
 * Live USD prices for the UI. `symbols=BTC,ETH` limits the response;
 * without it all known crypto and fiat prices are returned.
 */
export async function GET(req: Request) {
  const snap = getPricesFast();
  const wanted = new URL(req.url).searchParams.get("symbols");
  let prices = snap.prices;
  let changes24h = snap.changes24h;
  if (wanted) {
    prices = {};
    changes24h = {};
    for (const s of wanted.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean).slice(0, 300)) {
      if (snap.prices[s] != null) prices[s] = snap.prices[s];
      if (snap.changes24h[s] != null) changes24h[s] = snap.changes24h[s];
    }
  }
  return NextResponse.json(
    { prices, changes24h, updatedAt: snap.updatedAt, live: snap.live },
    { headers: { "Cache-Control": "public, max-age=10, s-maxage=10" } },
  );
}
