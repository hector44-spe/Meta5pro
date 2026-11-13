"use client";

import { useEffect, useState } from "react";

export interface LivePrices {
  prices: Record<string, number>;
  updatedAt: string | null;
  live: boolean;
  loading: boolean;
}

// One shared poller for the whole page, however many components use it.
let shared: LivePrices = { prices: {}, updatedAt: null, live: false, loading: true };
const listeners = new Set<(p: LivePrices) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

async function refresh() {
  try {
    const res = await fetch("/api/prices", { cache: "no-store" });
    if (!res.ok) throw new Error();
    const data = await res.json();
    shared = { prices: data.prices || {}, updatedAt: data.updatedAt, live: !!data.live, loading: false };
  } catch {
    shared = { ...shared, loading: false };
  }
  listeners.forEach((l) => l(shared));
}

/** Live USD prices (refreshes every 60 s while the page is open). */
export function usePrices(): LivePrices {
  const [state, setState] = useState<LivePrices>(shared);
  useEffect(() => {
    listeners.add(setState);
    if (!timer) {
      refresh();
      timer = setInterval(refresh, 60_000);
    } else {
      setState(shared);
    }
    return () => {
      listeners.delete(setState);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);
  return state;
}

/** USD value of `units` of `symbol`, or null when no live price is known yet. */
export function usdValue(prices: Record<string, number>, symbol: string, units: number): number | null {
  const p = prices[symbol.toUpperCase()];
  return p != null ? Math.round(units * p * 100) / 100 : null;
}
