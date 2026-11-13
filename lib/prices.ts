/**
 * Live market prices (server side).
 *
 * Source: Coinbase public exchange rates (no API key, works in every region).
 * One request returns ~650 crypto and fiat rates against USD. Results are cached
 * for 60 seconds; if Coinbase is unreachable the last good prices are used, and
 * before the first successful fetch a small built-in fallback table is used.
 * Stock prices are not available from this source.
 */

const SOURCE_URL = "https://api.coinbase.com/v2/exchange-rates?currency=USD";
const TTL_MS = 60_000;

// Only used until the first successful fetch (e.g. no network on boot).
const FALLBACK: Record<string, number> = {
  BTC: 70000,
  ETH: 2000,
  SOL: 80,
  XRP: 1,
  USDT: 1,
  USDC: 1,
};

export interface PriceSnapshot {
  /** USD price per 1 unit, keyed by upper-case symbol (crypto and fiat). */
  prices: Record<string, number>;
  updatedAt: string;
  live: boolean;
}

let cache: PriceSnapshot | null = null;
let cacheAt = 0;
let inflight: Promise<PriceSnapshot> | null = null;

async function fetchSnapshot(): Promise<PriceSnapshot> {
  const res = await fetch(SOURCE_URL, { cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`price source HTTP ${res.status}`);
  const body = (await res.json()) as { data?: { rates?: Record<string, string> } };
  const rates = body.data?.rates;
  if (!rates) throw new Error("price source returned no rates");
  const prices: Record<string, number> = { USD: 1 };
  for (const [sym, perUsd] of Object.entries(rates)) {
    const r = Number(perUsd);
    if (r > 0 && Number.isFinite(r)) prices[sym.toUpperCase()] = 1 / r;
  }
  return { prices, updatedAt: new Date().toISOString(), live: true };
}

/** Current USD prices. Never throws. */
export async function getPrices(): Promise<PriceSnapshot> {
  if (cache && Date.now() - cacheAt < TTL_MS) return cache;
  if (!inflight) {
    inflight = fetchSnapshot()
      .then((snap) => {
        cache = snap;
        cacheAt = Date.now();
        return snap;
      })
      .catch((err) => {
        console.warn("[prices] using cached/fallback prices:", err instanceof Error ? err.message : err);
        if (cache) return { ...cache, live: false };
        return { prices: { USD: 1, ...FALLBACK }, updatedAt: new Date().toISOString(), live: false };
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** USD price of one unit of `symbol`, or null if unknown. */
export async function getPrice(symbol: string): Promise<number | null> {
  const { prices } = await getPrices();
  return prices[symbol.toUpperCase()] ?? null;
}
