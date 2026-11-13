"use client";

import { useCallback, useEffect, useState } from "react";

export interface Holding {
  symbol: string;
  units: number;
  price: number | null;
  usd: number | null;
  pendingUnits: number;
}

/** The signed-in user's per-coin holdings (approved deposits minus withdrawals). */
export function useHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet/holdings", { cache: "no-store" });
      if (res.ok) setHoldings((await res.json()).holdings || []);
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Pick up approvals made while the page is open
    const t = setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return { holdings, loading, refresh };
}
