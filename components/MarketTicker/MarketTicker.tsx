"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import styles from "./MarketTicker.module.css";

interface TickerAsset {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const TICKER_DATA: TickerAsset[] = [
  {
    symbol: "BTC/USDT",
    price: "$91,420.50",
    change: "+3.42%",
    isPositive: true,
  },
  {
    symbol: "ETH/USDT",
    price: "$3,420.10",
    change: "+2.18%",
    isPositive: true,
  },
  { symbol: "SOL/USDT", price: "$194.85", change: "+5.60%", isPositive: true },
  { symbol: "NVDA", price: "$148.90", change: "+4.12%", isPositive: true },
  { symbol: "AAPL", price: "$224.23", change: "+0.84%", isPositive: true },
  { symbol: "EUR/USD", price: "1.0825", change: "-0.15%", isPositive: false },
  {
    symbol: "XAU/USD (Gold)",
    price: "$2,685.40",
    change: "+1.20%",
    isPositive: true,
  },
  { symbol: "SPY", price: "$585.30", change: "+0.65%", isPositive: true },
  { symbol: "TSLA", price: "$325.80", change: "-1.40%", isPositive: false },
  { symbol: "AMZN", price: "$208.50", change: "+1.10%", isPositive: true },
];

export default function MarketTicker() {
  // Duplicate array to achieve seamless infinite looping marquee
  const items = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className={styles.tickerContainer} aria-label="Live Market Rates">
      <div className={styles.track}>
        {items.map((item, index) => (
          <div key={`${item.symbol}-${index}`} className={styles.tickerItem}>
            <span className={styles.symbol}>{item.symbol}</span>
            <span className={styles.price}>{item.price}</span>
            <span
              className={
                item.isPositive ? styles.changePositive : styles.changeNegative
              }
            >
              {item.isPositive ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {item.change}
            </span>
            <span className={styles.separator} />
          </div>
        ))}
      </div>
    </div>
  );
}
