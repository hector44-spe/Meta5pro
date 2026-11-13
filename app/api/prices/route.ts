export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getPrices } from "@/lib/prices";

/**
 * Live USD prices for the UI. `symbols=BTC,ETH` limits the response;
 * without it all known crypto and fiat prices are returned.
 */
export async function GET(req: Request) {
  const snap = await getPrices();
  const wanted = new URL(req.url).searchParams.get("symbols");
  let prices = snap.prices;
  if (wanted) {
    prices = {};
    for (const s of wanted.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean).slice(0, 300)) {
      if (snap.prices[s] != null) prices[s] = snap.prices[s];
    }
  }
  return NextResponse.json(
    { prices, updatedAt: snap.updatedAt, live: snap.live },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=30" } },
  );
}
