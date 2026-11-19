"use client";

import { useEffect, useState } from "react";

export interface Holding {
  symbol: string;
  units: number;
  price: number | null;
  usd: number | null;
  pendingUnits: number;
  costBasisUsd: number;
  changeUsd: number;
  changePercent: number;
  marketChange24h: number;
  externalBookUsd: number;
  realizedTradePnl: number;
}

export interface HoldingsSummary {
  totalUsd: number;
  totalCostBasisUsd: number;
  totalChangeUsd: number;
  totalChangePercent: number;
  externalBookUsd: number;
  equityAdjustmentUsd: number;
}

const EMPTY_SUMMARY: HoldingsSummary = {
  totalUsd: 0,
  totalCostBasisUsd: 0,
  totalChangeUsd: 0,
  totalChangePercent: 0,
  externalBookUsd: 0,
  equityAdjustmentUsd: 0,
};

interface HoldingsState {
  holdings: Holding[];
  summary: HoldingsSummary;
  loading: boolean;
}

let shared: HoldingsState = { holdings: [], summary: EMPTY_SUMMARY, loading: true };
const listeners = new Set<(state: HoldingsState) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let inflight: Promise<void> | null = null;

async function refreshHoldings() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/wallet/holdings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        shared = {
          holdings: data.holdings || [],
          summary: data.summary || EMPTY_SUMMARY,
          loading: false,
        };
      }
    } catch {
      shared = { ...shared, loading: false };
    } finally {
      listeners.forEach((listener) => listener(shared));
      inflight = null;
    }
  })();
  return inflight;
}

/** The signed-in user's per-coin holdings (approved deposits minus withdrawals). */
export function useHoldings() {
  const [state, setState] = useState<HoldingsState>(shared);

  useEffect(() => {
    listeners.add(setState);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshHoldings();
      }
    };
    if (!timer) {
      refreshHoldings();
      timer = setInterval(refreshHoldings, 5_000);
    } else {
      setState(shared);
    }
    window.addEventListener("focus", refreshHoldings);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("balance-changed", refreshHoldings);
    window.addEventListener("deposit-submitted", refreshHoldings);
    return () => {
      listeners.delete(setState);
      window.removeEventListener("focus", refreshHoldings);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("balance-changed", refreshHoldings);
      window.removeEventListener("deposit-submitted", refreshHoldings);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return { ...state, refresh: refreshHoldings };
}
