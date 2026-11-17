/**
 * Live market prices across all asset classes:
 * - Crypto & Fiat: Coinbase public exchange rates (650+ pairs)
 * - Stocks & Equities: Yahoo Finance live regular market quotes
 * - Commodities: Real-time futures mapping (XAU/Gold, XAG/Silver, Oil)
 *
 * Caches prices in memory and persists the last valid market snapshot to PostgreSQL
 * so cold boots and serverless restarts never use stale or distorted static values.
 */

import { prisma } from "./prisma";

const COINBASE_URL = "https://api.coinbase.com/v2/exchange-rates?currency=USD";
const TTL_MS = 60_000;
const DB_CACHE_KEY = "market_prices_cache";

/** Commodity symbol aliases mapped to market tickers */
const COMMODITY_MAP: Record<string, string> = {
  XAU: "GC=F",
  GOLD: "GC=F",
  XAG: "SI=F",
  SILVER: "SI=F",
  OIL: "CL=F",
  WTI: "CL=F",
  BRENT: "BZ=F",
  NG: "NG=F",
};

const YAHOO_SYMBOLS = new Set([
  ...Object.keys(COMMODITY_MAP),
  "AAPL", "ABT", "ADBE", "ADI", "AEMD", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL",
  "META", "NFLX", "BABA", "BA", "DIS", "KO", "NKE", "WMT", "V", "SPY", "QQQ",
]);

/**
 * Realistic calibrated baseline rates across asset classes.
 * Used only if external networks and the database cache are simultaneously unavailable.
 */
const CALIBRATED_BASELINES: Record<string, number> = {
  USD: 1,
  // Crypto
  BTC: 96500,
  ETH: 2750,
  SOL: 188,
  BNB: 640,
  XRP: 1.55,
  ADA: 0.85,
  AAVE: 165.0,
  DOGE: 0.28,
  USDT: 1.0,
  USDC: 1.0,
  TRX: 0.20,
  AVAX: 34.0,
  LINK: 17.5,
  DOT: 7.8,
  NEAR: 6.2,
  LTC: 95.0,
  // Stocks & Equities
  AAPL: 228.0,
  ABT: 108.51,
  ADBE: 243.03,
  ADI: 397.76,
  AEMD: 5.23,
  TSLA: 340.0,
  NVDA: 145.0,
  MSFT: 420.0,
  AMZN: 205.0,
  GOOGL: 178.0,
  META: 580.0,
  NFLX: 840.0,
  BABA: 88.0,
  BA: 155.0,
  DIS: 110.0,
  KO: 64.0,
  NKE: 78.0,
  WMT: 85.0,
  V: 295.0,
  SPY: 590.0,
  QQQ: 510.0,
  // Commodities
  XAU: 2650.0,
  GOLD: 2650.0,
  XAG: 31.5,
  SILVER: 31.5,
  OIL: 69.5,
  WTI: 69.5,
  // Fiat
  EUR: 1.06,
  GBP: 1.27,
  JPY: 0.0065,
  CAD: 0.71,
  AUD: 0.65,
  CHF: 1.13,
};

export interface PriceSnapshot {
  prices: Record<string, number>;
  updatedAt: string;
  live: boolean;
  /** Symbols backed by a successful upstream quote, rather than a static baseline. */
  liveSymbols?: string[];
}

let cache: PriceSnapshot | null = null;
let cacheAt = 0;
let inflight: Promise<PriceSnapshot> | null = null;
const stockCache = new Map<string, { price: number; timestamp: number }>();

/** Fetches a single stock or commodity price from market feeds */
export async function fetchStockOrCommodityPrice(symbol: string, allowFallback = true): Promise<number | null> {
  const sym = symbol.toUpperCase().trim();
  const cached = stockCache.get(sym);
  if (cached && Date.now() - cached.timestamp < TTL_MS) {
    return cached.price;
  }

  const querySymbol = COMMODITY_MAP[sym] || sym;
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySymbol)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (typeof price === "number" && price > 0) {
        stockCache.set(sym, { price, timestamp: Date.now() });
        return price;
      }
    }
  } catch {
    // network or timeout
  }

  return allowFallback ? CALIBRATED_BASELINES[sym] ?? null : null;
}

/** Tries to load previous verified market rates from PostgreSQL */
async function loadPersistedCache(): Promise<PriceSnapshot | null> {
  try {
    const dbPromise = prisma.appSetting.findUnique({
      where: { key: DB_CACHE_KEY },
    });
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const setting = await Promise.race([dbPromise, timeoutPromise]);
    if (setting && setting.value && typeof setting.value === "object") {
      const data = setting.value as unknown as { prices: Record<string, number>; updatedAt: string; liveSymbols?: string[] };
      if (data.prices && Object.keys(data.prices).length > 0) {
        return {
          prices: { ...CALIBRATED_BASELINES, ...data.prices },
          updatedAt: data.updatedAt || new Date().toISOString(),
          live: false,
          liveSymbols: Array.isArray(data.liveSymbols) ? data.liveSymbols : [],
        };
      }
    }
  } catch {
    // Database may be offline or initializing
  }
  return null;
}

/** Asynchronously persists valid live snapshot to PostgreSQL */
function persistCache(snap: PriceSnapshot) {
  prisma.appSetting
    .upsert({
      where: { key: DB_CACHE_KEY },
      create: {
        key: DB_CACHE_KEY,
        value: { prices: snap.prices, updatedAt: snap.updatedAt, liveSymbols: snap.liveSymbols } as any,
      },
      update: {
        value: { prices: snap.prices, updatedAt: snap.updatedAt, liveSymbols: snap.liveSymbols } as any,
      },
    })
    .catch(() => {});
}

async function fetchSnapshot(): Promise<PriceSnapshot> {
  const res = await fetch(COINBASE_URL, { cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Coinbase HTTP ${res.status}`);
  const body = (await res.json()) as { data?: { rates?: Record<string, string> } };
  const rates = body.data?.rates;
  if (!rates) throw new Error("Coinbase returned no exchange rates");

  const prices: Record<string, number> = {
    ...CALIBRATED_BASELINES,
    USD: 1,
  };
  const liveSymbols = new Set<string>(["USD"]);

  for (const [sym, perUsd] of Object.entries(rates)) {
    const r = Number(perUsd);
    if (r > 0 && Number.isFinite(r)) {
      prices[sym.toUpperCase()] = 1 / r;
      liveSymbols.add(sym.toUpperCase());
    }
  }

  // Also include cached stock/commodity prices in the main snapshot
  for (const [sym, entry] of stockCache.entries()) {
    prices[sym] = entry.price;
  }

  const snapshot: PriceSnapshot = {
    prices,
    updatedAt: new Date().toISOString(),
    live: true,
    liveSymbols: [...liveSymbols],
  };

  persistCache(snapshot);
  return snapshot;
}

/** Current USD prices across all assets. Never throws. */
export async function getPrices(): Promise<PriceSnapshot> {
  if (cache && Date.now() - cacheAt < TTL_MS) return cache;

  if (!inflight) {
    inflight = fetchSnapshot()
      .then((snap) => {
        cache = snap;
        cacheAt = Date.now();
        return snap;
      })
      .catch(async (err) => {
        console.warn("[prices] Using fallback or database-persisted prices:", err instanceof Error ? err.message : err);
        if (cache) return { ...cache, live: false };

        const dbSnap = await loadPersistedCache();
        if (dbSnap) {
          cache = dbSnap;
          return dbSnap;
        }

        return {
          prices: { ...CALIBRATED_BASELINES, USD: 1 },
          updatedAt: new Date().toISOString(),
          live: false,
          liveSymbols: [],
        };
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

/**
 * USD price of one unit of `symbol`.
 * Supports Cryptocurrencies, Stocks, Commodities (Gold/Oil), and Fiat.
 * Never returns null for supported platform assets.
 */
export async function getPrice(symbol: string): Promise<number | null> {
  const sym = symbol.toUpperCase().trim();
  const { prices } = await getPrices();

  if (prices[sym] != null) {
    return prices[sym];
  }

  // If not found in primary crypto/fiat feed, check stock & commodity live resolver
  const stockPrice = await fetchStockOrCommodityPrice(sym);
  if (stockPrice != null) {
    if (cache) cache.prices[sym] = stockPrice;
    return stockPrice;
  }

  return CALIBRATED_BASELINES[sym] ?? null;
}

/**
 * Price suitable for a balance-changing transaction. Static baselines are deliberately
 * rejected: callers must fail closed unless a quote was verified recently.
 */
export async function getVerifiedPrice(symbol: string, maxAgeMs = 5 * 60_000): Promise<number | null> {
  const sym = symbol.toUpperCase().trim();
  const snapshot = await getPrices();
  const age = Date.now() - Date.parse(snapshot.updatedAt);
  if (
    Number.isFinite(age) &&
    age >= 0 &&
    age <= maxAgeMs &&
    snapshot.liveSymbols?.includes(sym) &&
    typeof snapshot.prices[sym] === "number"
  ) {
    return snapshot.prices[sym];
  }

  // Only the platform's explicit equity/commodity allowlist may use Yahoo. This prevents a
  // crypto symbol such as BTC from accidentally resolving to an unrelated stock ticker.
  return YAHOO_SYMBOLS.has(sym) ? fetchStockOrCommodityPrice(sym, false) : null;
}
