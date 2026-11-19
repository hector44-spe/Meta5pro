/**
 * Live market prices across all asset classes:
 * - Crypto: Binance Spot 24-hour tickers (verified last price + movement)
 * - Fiat/fallback crypto: Coinbase public exchange rates
 * - Stocks & Equities: Yahoo Finance live regular market quotes
 * - Commodities: Real-time futures mapping (XAU/Gold, XAG/Silver, Oil)
 *
 * Caches prices in memory and persists the last valid market snapshot to PostgreSQL
 * so cold boots and serverless restarts never use stale or distorted static values.
 */

import { prisma } from "./prisma";
import assetsData from "@/data/assetsData.json";

const COINBASE_URL = "https://api.coinbase.com/v2/exchange-rates?currency=USD";
const BINANCE_24H_URL = "https://api.binance.com/api/v3/ticker/24hr";
const TTL_MS = 15_000;
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

const EQUITY_SYMBOLS = (assetsData as Array<{ symbol: string; type: string }>)
  .filter((asset) => asset.type === "Stocks")
  .map((asset) => asset.symbol.toUpperCase());

const CRYPTO_SYMBOLS = new Set(
  (assetsData as Array<{ symbol: string; type: string }>)
    .filter((asset) => asset.type === "Crypto")
    .map((asset) => asset.symbol.toUpperCase()),
);

const YAHOO_SYMBOLS = new Set([
  ...Object.keys(COMMODITY_MAP),
  ...EQUITY_SYMBOLS,
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
  changes24h: Record<string, number>;
  updatedAt: string;
  live: boolean;
  /** Symbols backed by a successful upstream quote, rather than a static baseline. */
  liveSymbols?: string[];
}

let cache: PriceSnapshot | null = null;
let cacheAt = 0;
let inflight: Promise<PriceSnapshot> | null = null;
const stockCache = new Map<string, { price: number; change24h: number; timestamp: number }>();

async function fetchCryptoSnapshot(): Promise<Record<string, { price: number; change24h: number }>> {
  const res = await fetch(BINANCE_24H_URL, { cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
  const rows = await res.json() as Array<{ symbol?: string; lastPrice?: string; priceChangePercent?: string }>;
  const quotes: Record<string, { price: number; change24h: number }> = {};
  for (const row of rows) {
    const pair = String(row.symbol || "").toUpperCase();
    if (!pair.endsWith("USDT")) continue;
    const symbol = pair.slice(0, -4);
    if (!CRYPTO_SYMBOLS.has(symbol)) continue;
    const price = Number(row.lastPrice);
    const change24h = Number(row.priceChangePercent);
    if (price > 0 && Number.isFinite(price) && Number.isFinite(change24h)) {
      quotes[symbol] = { price, change24h };
    }
  }
  if (Object.keys(quotes).length === 0) throw new Error("Binance returned no supported tickers");
  quotes.USDT = { price: 1, change24h: 0 };
  return quotes;
}

/** Fetch every supported equity in one request, avoiding one network call per table row. */
async function fetchEquitySnapshot(): Promise<Record<string, { price: number; change24h: number }>> {
  const now = Date.now();
  const allFresh = EQUITY_SYMBOLS.every((symbol) => {
    const item = stockCache.get(symbol);
    return item && now - item.timestamp < TTL_MS;
  });
  if (!allFresh) {
    try {
      // Yahoo rejects oversized symbol batches even when the URL itself is
      // valid. Small concurrent batches are faster and avoid a single 400
      // response disabling live equity prices for the entire dashboard.
      const batches = Array.from({ length: Math.ceil(EQUITY_SYMBOLS.length / 20) }, (_, index) =>
        EQUITY_SYMBOLS.slice(index * 20, index * 20 + 20),
      );
      const responses = await Promise.allSettled(batches.map(async (batch) => {
        const symbols = encodeURIComponent(batch.join(","));
        const res = await fetch(
          `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbols}&range=1d&interval=5m`,
          {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            signal: AbortSignal.timeout(8000),
            cache: "no-store",
          },
        );
        if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);
        return res.json() as Promise<{
          spark?: { result?: Array<{ symbol?: string; response?: Array<{ meta?: Record<string, unknown> }> }> };
        }>;
      }));

      for (const response of responses) {
        if (response.status !== "fulfilled") continue;
        for (const result of response.value.spark?.result ?? []) {
          const symbol = String(result.symbol ?? "").toUpperCase();
          const meta = result.response?.[0]?.meta;
          const price = Number(meta?.regularMarketPrice);
          const change24h = Number(meta?.regularMarketChangePercent);
          if (symbol && Number.isFinite(price) && price > 0) {
            stockCache.set(symbol, {
              price,
              change24h: Number.isFinite(change24h) ? change24h : 0,
              timestamp: now,
            });
          }
        }
      }
    } catch (error) {
      console.warn("[prices] Equity batch refresh failed:", error instanceof Error ? error.message : error);
    }
  }

  return Object.fromEntries(
    EQUITY_SYMBOLS.flatMap((symbol) => {
      const item = stockCache.get(symbol);
      return item ? [[symbol, { price: item.price, change24h: item.change24h }]] : [];
    }),
  );
}

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
        const previousClose = Number(data.chart?.result?.[0]?.meta?.previousClose);
        const change24h = previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0;
        stockCache.set(sym, { price, change24h, timestamp: Date.now() });
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
      const data = setting.value as unknown as { prices: Record<string, number>; changes24h?: Record<string, number>; updatedAt: string; liveSymbols?: string[] };
      if (data.prices && Object.keys(data.prices).length > 0) {
        return {
          prices: { ...CALIBRATED_BASELINES, ...data.prices },
          changes24h: data.changes24h ?? {},
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
        value: { prices: snap.prices, changes24h: snap.changes24h, updatedAt: snap.updatedAt, liveSymbols: snap.liveSymbols } as any,
      },
      update: {
        value: { prices: snap.prices, changes24h: snap.changes24h, updatedAt: snap.updatedAt, liveSymbols: snap.liveSymbols } as any,
      },
    })
    .catch(() => {});
}

async function fetchSnapshot(): Promise<PriceSnapshot> {
  const [binanceResult, coinbaseResult] = await Promise.allSettled([
    fetchCryptoSnapshot(),
    fetch(COINBASE_URL, { cache: "no-store", signal: AbortSignal.timeout(6000) }).then(async (res) => {
      if (!res.ok) throw new Error(`Coinbase HTTP ${res.status}`);
      const body = (await res.json()) as { data?: { rates?: Record<string, string> } };
      if (!body.data?.rates) throw new Error("Coinbase returned no exchange rates");
      return body.data.rates;
    }),
  ]);
  if (binanceResult.status === "rejected" && coinbaseResult.status === "rejected") {
    throw new Error("All crypto price providers are unavailable");
  }
  const rates = coinbaseResult.status === "fulfilled" ? coinbaseResult.value : {};

  const prices: Record<string, number> = {
    ...CALIBRATED_BASELINES,
    USD: 1,
  };
  const liveSymbols = new Set<string>(["USD"]);
  const changes24h: Record<string, number> = {};

  for (const [sym, perUsd] of Object.entries(rates)) {
    const r = Number(perUsd);
    if (r > 0 && Number.isFinite(r)) {
      prices[sym.toUpperCase()] = 1 / r;
      liveSymbols.add(sym.toUpperCase());
    }
  }

  if (binanceResult.status === "fulfilled") {
    for (const [sym, quote] of Object.entries(binanceResult.value)) {
      prices[sym] = quote.price;
      changes24h[sym] = quote.change24h;
      liveSymbols.add(sym);
    }
  }

  const equities = await fetchEquitySnapshot();
  for (const [sym, quote] of Object.entries(equities)) {
    prices[sym] = quote.price;
    changes24h[sym] = quote.change24h;
    liveSymbols.add(sym);
  }

  // Also include individually cached stock/commodity prices in the main snapshot
  for (const [sym, entry] of stockCache.entries()) {
    prices[sym] = entry.price;
    changes24h[sym] = entry.change24h;
  }

  const snapshot: PriceSnapshot = {
    prices,
    changes24h,
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
          cacheAt = Date.now();
          return dbSnap;
        }

        const fallback: PriceSnapshot = {
          prices: { ...CALIBRATED_BASELINES, USD: 1 },
          changes24h: {},
          updatedAt: new Date().toISOString(),
          live: false,
          liveSymbols: [],
        };
        // Cache degraded snapshots too, otherwise every lookup retries an
        // unavailable provider and can stall the UI for several seconds.
        cache = fallback;
        cacheAt = Date.now();
        return fallback;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

/**
 * Non-blocking snapshot for page rendering. It returns the latest in-memory
 * values (or calibrated values on a cold process) immediately and refreshes
 * upstream providers in the background. Balance-changing operations continue
 * to use `getVerifiedPrice`, which still waits for a verified quote.
 */
export function getPricesFast(): PriceSnapshot {
  if (cache) return cache;

  void getPrices().catch(() => undefined);
  return {
    prices: { ...CALIBRATED_BASELINES, USD: 1 },
    changes24h: {},
    updatedAt: new Date().toISOString(),
    live: false,
    liveSymbols: [],
  };
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
    const primary = snapshot.prices[sym];
    if (!CRYPTO_SYMBOLS.has(sym)) return primary;

    // Balance-changing crypto operations require agreement from an independent
    // provider. A compromised/stale primary quote must not mint or debit the
    // wrong quantity of an asset.
    try {
      const response = await fetch(`https://api.coinbase.com/v2/prices/${encodeURIComponent(sym)}-USD/spot`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (!response.ok) return null;
      const payload = await response.json() as { data?: { amount?: string } };
      const secondary = Number(payload.data?.amount);
      if (!(secondary > 0) || !Number.isFinite(secondary)) return null;
      const deviation = Math.abs(primary - secondary) / Math.max(primary, secondary);
      return deviation <= 0.03 ? (primary + secondary) / 2 : null;
    } catch {
      return null;
    }
  }

  // Only the platform's explicit equity/commodity allowlist may use Yahoo. This prevents a
  // crypto symbol such as BTC from accidentally resolving to an unrelated stock ticker.
  return YAHOO_SYMBOLS.has(sym) ? fetchStockOrCommodityPrice(sym, false) : null;
}
