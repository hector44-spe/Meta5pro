"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { useHoldings } from "@/lib/useHoldings";
import { usePrices } from "@/lib/usePrices";
import assetCatalog from "@/data/assetsData.json";
import "@/styles/investing-page.css";

type Tab = "stocks" | "real-estate";

interface CatalogItem {
  name: string;
  symbol: string;
  type: string;
  price: string;
  icon: string;
}

function EmptyInvestmentsIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M14 14l8 8M22 14l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="32" y="10" width="22" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <line x1="32" y1="18" x2="54" y2="18" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="34" width="22" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="42" x2="32" y2="42" stroke="currentColor" strokeWidth="2" />
      <path d="M52 34v8a8 8 0 0 1-8 8h-6m0 0 4-4m-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InvestingPage() {
  const { hideBalance, setHideBalance, formatMoney } = useDashboard();
  const { holdings } = useHoldings();
  const { prices } = usePrices();
  const [tab, setTab] = useState<Tab>("stocks");

  // Stock positions = holdings whose symbol is a stock in the catalogue
  const stockPositions = useMemo(() => {
    const catalog = assetCatalog as CatalogItem[];
    return holdings
      .map((h) => {
        const info = catalog.find((c) => c.symbol.toUpperCase() === h.symbol && c.type === "Stocks");
        if (!info || h.units <= 0) return null;
        const catalogPrice = Number(String(info.price).replace(/[^0-9.]/g, "")) || 0;
        const price = prices[h.symbol] ?? h.price ?? catalogPrice;
        return { ...info, units: h.units, price, value: h.units * price };
      })
      .filter(Boolean) as (CatalogItem & { units: number; price: number; value: number })[];
  }, [holdings, prices]);

  const stocksValue = stockPositions.reduce((s, p) => s + p.value, 0);
  const realEstateValue = 0; // real-estate investments are listed here once that product is live
  const portfolioValue = tab === "stocks" ? stocksValue : realEstateValue;

  return (
    <div className="inv-page">
      <div className="inv-card">
        <h1 className="inv-title">Investing</h1>

        <div className="inv-tabs" role="tablist" aria-label="Investment type">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "stocks"}
            className={`inv-tab ${tab === "stocks" ? "active" : ""}`}
            onClick={() => setTab("stocks")}
          >
            Stocks
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "real-estate"}
            className={`inv-tab ${tab === "real-estate" ? "active" : ""}`}
            onClick={() => setTab("real-estate")}
          >
            Real estate
          </button>
        </div>

        <div className="inv-portfolio">
          <div className="inv-portfolio-label">
            <span>Portfolio value</span>
            <button
              type="button"
              className="inv-eye"
              onClick={() => setHideBalance((v) => !v)}
              aria-label={hideBalance ? "Show balance" : "Hide balance"}
            >
              {hideBalance ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
          <div className="inv-portfolio-value">{hideBalance ? "******" : formatMoney(portfolioValue)}</div>
        </div>

        {tab === "stocks" ? (
          <>
            <div className="inv-section-head">
              <h2>Positions</h2>
              <Link href="/assets?type=Stocks" className="inv-primary-btn">
                Buy stocks
              </Link>
            </div>

            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Current price</th>
                    <th>24h change</th>
                    <th className="right">In your portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {stockPositions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="inv-empty-row">
                        You currently have no stocks in your portfolio
                      </td>
                    </tr>
                  ) : (
                    stockPositions.map((p) => (
                      <tr key={p.symbol}>
                        <td>
                          <div className="inv-stock">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.icon} alt="" width={28} height={28} loading="lazy" />
                            <div>
                              <div className="inv-stock-name">{p.name}</div>
                              <div className="inv-stock-symbol">{p.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatMoney(p.price)}</td>
                        <td className="inv-muted">—</td>
                        <td className="right">
                          <div>{hideBalance ? "******" : formatMoney(p.value)}</div>
                          <div className="inv-muted">{Number(p.units.toFixed(6))} {p.symbol}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="inv-section-head">
              <h2>Your investments</h2>
              <Link href="/real-estate" className="inv-primary-btn">
                Invest in real estate
              </Link>
            </div>

            <div className="inv-empty">
              <EmptyInvestmentsIcon />
              <p>
                No investments yet. You can{" "}
                <Link href="/real-estate" className="inv-link">
                  click here
                </Link>{" "}
                to start investing.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
