"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  Clock,
  Check,
  TrendingUp,
  ArrowUpDown,
  Snowflake,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { usePrices } from "@/lib/usePrices";
import { useHoldings } from "@/lib/useHoldings";
import assetCatalog from "@/data/assetsData.json";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";
import CustomNotificationBar, { CustomNotificationState } from "@/components/UI/CustomNotificationBar";
import AssetBrandIcon from "@/components/UI/AssetBrandIcon";
import "@/styles/dashboard.css";

interface Position {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: number;
  entryPrice: number;
  leverage: number;
  margin: number;
  pnl: number | null;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  durationSeconds?: number;
  settlesAt?: string;
  source?: "DIRECT" | "COPY_TRADING";
  copyExpertId?: string | null;
  copyExpertName?: string | null;
}

const ASSETS_BY_TYPE: Record<
  string,
  Array<{ symbol: string; name: string; price: number; icon?: string }>
> = {
  Crypto: [
    { symbol: "BTC", name: "Bitcoin", price: 96500.0, icon: "/dashboard_files/BTC.svg" },
    { symbol: "ETH", name: "Ethereum", price: 2750.0, icon: "/dashboard_files/ETH.svg" },
    { symbol: "SOL", name: "Solana", price: 188.0, icon: "/dashboard_files/SOL.svg" },
    { symbol: "XRP", name: "Ripple", price: 1.55, icon: "/dashboard_files/XRP.svg" },
    { symbol: "DOGE", name: "Dogecoin", price: 0.28 },
    { symbol: "BNB", name: "Binance Coin", price: 640.0 },
    { symbol: "ADA", name: "Cardano", price: 0.85, icon: "/dashboard_files/ADA.svg" },
    { symbol: "AAVE", name: "Aave", price: 165.0, icon: "/dashboard_files/AAVE.svg" },
  ],
  Stocks: [
    { symbol: "AAPL", name: "Apple Inc.", price: 228.0, icon: "/dashboard_files/AAPL.svg" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 145.0 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 340.0 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 420.0 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 178.0 },
    { symbol: "ABT", name: "Abbott Laboratories", price: 108.51, icon: "/dashboard_files/ABT.svg" },
    { symbol: "ADBE", name: "Adobe Inc.", price: 243.03, icon: "/dashboard_files/ADBE.svg" },
    { symbol: "ADI", name: "Analog Devices", price: 397.76, icon: "/dashboard_files/ADI.svg" },
    { symbol: "AEMD", name: "Aethlon Medical", price: 5.23, icon: "/dashboard_files/AEMD.svg" },
  ],
  Forex: [
    { symbol: "EURUSD", name: "EUR / USD", price: 1.054 },
    { symbol: "GBPUSD", name: "GBP / USD", price: 1.261 },
    { symbol: "USDJPY", name: "USD / JPY", price: 154.2 },
    { symbol: "AUDUSD", name: "AUD / USD", price: 0.651 },
  ],
  Commodities: [
    { symbol: "GOLD", name: "Gold (XAU/USD)", price: 2650.0 },
    { symbol: "SILVER", name: "Silver (XAG/USD)", price: 31.5 },
    { symbol: "OIL", name: "Crude Oil (WTI)", price: 69.5 },
  ],
};

const DURATION_OPTIONS = [
  "1 minute",
  "2 minutes",
  "5 minutes",
  "15 minutes",
  "30 minutes",
  "1 hour",
  "4 hours",
  "24 hours",
];

const CONVERT_ASSETS = ["USD", "BTC", "ETH", "SOL", "USDT", "XRP", "BNB", "ADA"];

function TradingContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "BTC";
  const initialType = searchParams.get("type") || "Crypto";

  const { accountType, realBalance, demoBalance, openModal, refreshBalance, isFrozen } = useDashboard();
  const { prices } = usePrices();
  const { holdings, summary: holdingsSummary, refresh: refreshHoldings } = useHoldings();

  useEffect(() => {
    refreshBalance();
    refreshHoldings();
  }, [refreshBalance, refreshHoldings]);

  // Primary state
  const [orderTab, setOrderTab] = useState<"buy" | "sell" | "convert">("buy");
  const [tradeType, setTradeType] = useState<string>(initialType);
  const [isTradeTypeDropdownOpen, setIsTradeTypeDropdownOpen] = useState(false);
  const [currency, setCurrency] = useState<string>(initialSymbol.toUpperCase());
  const [fundingAsset, setFundingAsset] = useState("USD");
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [amount, setAmount] = useState("0.03");
  const [leverage, setLeverage] = useState(5);
  const [useTpSl, setUseTpSl] = useState(false);
  const [stopLoss, setStopLoss] = useState("63693.784");
  const [takeProfit, setTakeProfit] = useState("66926.971");
  const [duration, setDuration] = useState("2 minutes");
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  const [chartHidden, setChartHidden] = useState(false);

  const fundingOptions = useMemo(
    () => ["USD", ...holdings.filter((holding) => holding.units > 0).map((holding) => holding.symbol)]
      .filter((symbol, index, all) => all.indexOf(symbol) === index),
    [holdings],
  );

  // Convert state matching Image 2
  const [convertFromSymbol, setConvertFromSymbol] = useState("USD");
  const [convertToSymbol, setConvertToSymbol] = useState("BTC");
  const [convertFromAmount, setConvertFromAmount] = useState("0.01");
  const [isConvertFromDropdownOpen, setIsConvertFromDropdownOpen] = useState(false);
  const [isConvertToDropdownOpen, setIsConvertToDropdownOpen] = useState(false);
  const [convertSubmitting, setConvertSubmitting] = useState(false);

  // Swaps state matching Image 3
  const [swaps, setSwaps] = useState<
    Array<{ id: string; createdAt: string; trade: string; from: string; to: string; status: string }>
  >([]);
  const [swapsLoading, setSwapsLoading] = useState(false);

  // Auto trades state matching Image 4
  const [autoOpenExpanded, setAutoOpenExpanded] = useState(true);
  const [autoClosedExpanded, setAutoClosedExpanded] = useState(false);

  // Custom UI Modals & Notifications (No native alert or confirm)
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);
  const [notification, setNotification] = useState<CustomNotificationState | null>(null);

  // Positions and settlement state
  const [positions, setPositions] = useState<Position[]>([]);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [myTradesTab, setMyTradesTab] = useState<"all" | "swaps" | "auto">("all");
  const [openTradesOpen, setOpenTradesOpen] = useState(true);
  const [closedTradesOpen, setClosedTradesOpen] = useState(false);

  // Order execution feedback
  const [orderExecuting, setOrderExecuting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  // Update selection if search params change
  useEffect(() => {
    const qSym = searchParams.get("symbol");
    const qType = searchParams.get("type");
    if (qSym) setCurrency(qSym.toUpperCase());
    if (qType) {
      const match = Object.keys(ASSETS_BY_TYPE).find(
        (t) => t.toLowerCase() === qType.toLowerCase()
      );
      if (match) setTradeType(match);
    }
  }, [searchParams]);

  // Current price computation
  const activeAssetPrice = useMemo(() => {
    const sym = (currency || "BTC").toUpperCase();
    if (prices[sym] && prices[sym] > 0) return prices[sym];
    // Check local catalog
    for (const cat of Object.values(ASSETS_BY_TYPE)) {
      const found = cat.find((a) => a.symbol.toUpperCase() === sym);
      if (found) return found.price;
    }
    const rawMatch = (assetCatalog as Array<{ symbol: string; price: string }>).find(
      (a) => a.symbol.toUpperCase() === sym
    );
    if (rawMatch) {
      const parsed = parseFloat(rawMatch.price.replace(/[^0-9.]/g, ""));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 100.0;
  }, [prices, currency]);

  // Fetch positions
  const fetchPositions = async () => {
    try {
      const res = await fetch("/api/trades/positions");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.positions)) {
          setPositions(data.positions);
        }
      }
    } catch (e) {
      console.error("Failed to fetch positions:", e);
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchSwaps();
  }, []);

  // Fetch swaps history (matching Image 3)
  const fetchSwaps = async () => {
    try {
      setSwapsLoading(true);
      const res = await fetch("/api/trades/convert");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.swaps)) {
          setSwaps(data.swaps);
        }
      }
    } catch (e) {
      console.error("Failed to fetch swaps:", e);
    } finally {
      setSwapsLoading(false);
    }
  };

  // Poll positions every 4s if there are open positions
  useEffect(() => {
    const hasOpen = positions.some((p) => p.status === "OPEN");
    if (!hasOpen) return;
    const interval = setInterval(() => {
      fetchPositions();
      refreshBalance();
    }, 4000);
    return () => clearInterval(interval);
  }, [positions, refreshBalance]);

  // Timer for countdown ticks
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert calculations (matching Image 2)
  const convertRate = useMemo(() => {
    const fromPrice = convertFromSymbol === "USD" ? 1 : (prices[convertFromSymbol] || 1);
    const toPrice = convertToSymbol === "USD" ? 1 : (prices[convertToSymbol] || 1);
    return toPrice > 0 ? fromPrice / toPrice : 0;
  }, [convertFromSymbol, convertToSymbol, prices]);

  const convertToCalculated = useMemo(() => {
    const num = parseFloat(convertFromAmount);
    if (isNaN(num) || num <= 0) return "0.00";
    const val = num * convertRate;
    return convertToSymbol === "USD" ? val.toFixed(2) : val.toFixed(6);
  }, [convertFromAmount, convertRate, convertToSymbol]);

  const convertFromUsdEquiv = useMemo(() => {
    const num = parseFloat(convertFromAmount);
    if (isNaN(num) || num <= 0) return "0.00";
    const fromPrice = convertFromSymbol === "USD" ? 1 : (prices[convertFromSymbol] || 1);
    return (num * fromPrice).toFixed(2);
  }, [convertFromAmount, convertFromSymbol, prices]);

  const handleSwapSymbols = () => {
    const prevFrom = convertFromSymbol;
    const prevTo = convertToSymbol;
    const prevCalc = convertToCalculated;
    setConvertFromSymbol(prevTo);
    setConvertToSymbol(prevFrom);
    if (parseFloat(prevCalc) > 0) {
      setConvertFromAmount(prevCalc);
    }
  };

  const handleExecuteConvert = async () => {
    const num = parseFloat(convertFromAmount);
    if (isNaN(num) || num <= 0) {
      setNotification({
        type: "error",
        message: "Please enter a valid amount to convert.",
      });
      return;
    }

    if (convertFromSymbol === "USD") {
      const curBal = accountType === "real" ? realBalance : demoBalance;
      if (num > curBal) {
        setNotification({
          type: "error",
          message: `Insufficient USD balance. You have $${curBal.toFixed(2)} available.`,
        });
        return;
      }
    }

    setConvertSubmitting(true);
    try {
      const res = await fetch("/api/trades/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromSymbol: convertFromSymbol,
          toSymbol: convertToSymbol,
          fromAmount: num,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotification({
          type: "error",
          message: data.error || "Failed to complete asset conversion.",
        });
      } else {
        setNotification({
          type: "success",
          message: data.message || `Successfully converted ${num} ${convertFromSymbol} to ${convertToCalculated} ${convertToSymbol}.`,
        });
        refreshBalance();
        fetchSwaps();
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: "An unexpected error occurred while converting.",
      });
    } finally {
      setConvertSubmitting(false);
    }
  };

  // TradingView symbol resolution
  const tvSymbol = useMemo(() => {
    const c = (currency || "BTC").toUpperCase();
    const stocks: Record<string, string> = {
      AAPL: "NASDAQ:AAPL",
      GOOGL: "NASDAQ:GOOGL",
      TSLA: "NASDAQ:TSLA",
      MSFT: "NASDAQ:MSFT",
      NVDA: "NASDAQ:NVDA",
      ABT: "NYSE:ABT",
      ADBE: "NASDAQ:ADBE",
      ADI: "NASDAQ:ADI",
      AEMD: "NASDAQ:AEMD",
    };
    const forex: Record<string, string> = {
      EURUSD: "FX:EURUSD",
      GBPUSD: "FX:GBPUSD",
      USDJPY: "FX:USDJPY",
      AUDUSD: "FX:AUDUSD",
    };
    const commodities: Record<string, string> = {
      GOLD: "OANDA:XAUUSD",
      XAU: "OANDA:XAUUSD",
      SILVER: "OANDA:XAGUSD",
      OIL: "TVC:USOIL",
    };
    return stocks[c] ?? forex[c] ?? commodities[c] ?? `CRYPTO:${c}USD`;
  }, [currency]);

  const tvChartUrl = useMemo(() => {
    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(10, 12, 16, 1)",
      gridColor: "rgba(255, 255, 255, 0.04)",
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      hide_volume: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    };
    return `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
  }, [tvSymbol]);

  // Trade action handler (Sell or Buy)
  const handleTradeAction = async () => {
    setOrderFeedback(null);
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) {
      setNotification({
        type: "error",
        message: "Please enter a valid trade amount.",
      });
      return;
    }

    const requiredMargin = parsedAmount / (leverage || 5);
    if (accountType === "real" && realBalance < requiredMargin) {
      if ((holdingsSummary?.totalUsd ?? 0) >= requiredMargin) {
        setOrderTab("convert");
        setNotification({
          type: "error",
          message: `Insufficient USD Cash margin ($${realBalance.toFixed(2)} USD). You have $${(holdingsSummary?.totalUsd ?? 0).toFixed(2)} in crypto holdings. Switched to Convert tab to exchange crypto to cash for trading.`,
        });
        return;
      }
      openModal("deposit");
      setNotification({
        type: "error",
        message: `Insufficient real balance for this order. Required margin: $${requiredMargin.toFixed(2)} USD, available cash: $${realBalance.toFixed(2)} USD. Please deposit.`,
      });
      return;
    }

    setOrderExecuting(true);
    try {
      const res = await fetch("/api/trades/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType,
          side: orderTab === "sell" ? "SELL" : "BUY",
          symbol: currency || "BTC",
          fundingAsset,
          amount: parsedAmount,
          leverage: leverage || 5,
          duration,
          useTpSl,
          stopLoss: useTpSl ? stopLoss : null,
          takeProfit: useTpSl ? takeProfit : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotification({
          type: "error",
          message: data.error || "Failed to execute order.",
        });
      } else {
        setNotification({
          type: "success",
          message: `${orderTab === "sell" ? "Sell" : "Buy"} order executed successfully! Position #${(data.position?.id || "OK").slice(0, 8)}`,
        });
        refreshBalance();
        fetchPositions();
        setOpenTradesOpen(true);
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: "An unexpected error occurred while placing your order.",
      });
    } finally {
      setOrderExecuting(false);
    }
  };

  const handleSetWithAi = () => {
    const p = activeAssetPrice;
    const delta = p * 0.012;
    if (orderTab === "buy") {
      setStopLoss((p - delta).toFixed(2));
      setTakeProfit((p + delta * 2).toFixed(2));
    } else {
      setStopLoss((p + delta).toFixed(2));
      setTakeProfit((p - delta * 2).toFixed(2));
    }
    setUseTpSl(true);
  };

  const handleClosePosition = (pos: Position) => {
    setConfirmState({
      title: `Close Position on ${pos.symbol}?`,
      message: `Are you sure you want to close this ${pos.side} position? Any unrealized profit or loss will be credited/debited immediately.`,
      confirmText: "Close Position",
      cancelText: "Keep Position",
      danger: true,
      onConfirm: async () => {
        setClosingPositionId(pos.id);
        try {
          const res = await fetch(`/api/trades/positions/${pos.id}/close`, {
            method: "POST",
          });
          const data = await res.json();
          if (!res.ok) {
            setNotification({
              type: "error",
              message: data.error || "Failed to close position.",
            });
          } else {
            setNotification({
              type: Number(data.pnl || 0) >= 0 ? "success" : "error",
              message: `${Number(data.pnl || 0) >= 0 ? "+" : "-"}$${Math.abs(Number(data.pnl || 0)).toFixed(2)} ${Number(data.pnl || 0) >= 0 ? "profit made" : "loss made"}`,
              durationMs: 15_000,
            });
            await fetchPositions();
            refreshBalance();
            refreshHoldings();
            window.dispatchEvent(new Event("notifications-updated"));
          }
        } catch (err) {
          console.error("Close position error:", err);
          setNotification({
            type: "error",
            message: "Failed to close position.",
          });
        } finally {
          setClosingPositionId(null);
          setConfirmState(null);
        }
      },
    });
  };

  const currentBalance = accountType === "real" ? realBalance : demoBalance;

  return (
    <div
      className="dashboard-trade-page"
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "16px 16px 32px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* ===================== MID SECTION (TradingView Chart + Order Form - Image 1) ===================== */}
      <div
        id="trade-section"
        style={{
          display: "grid",
          gridTemplateColumns: chartHidden ? "1fr" : "1fr 380px",
          gap: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
        className="dashboard-midsection-grid"
      >
        {/* TradingView Chart Container */}
        {!chartHidden ? (
          <div
            style={{
              backgroundColor: "var(--color-card-background, rgba(255, 255, 255, 0.02))",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              minHeight: "460px",
              height: "500px",
              boxSizing: "border-box",
            }}
          >
            {/* Header row of chart */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={16} color="#4763f0" />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                  {currency} / USD Chart
                </span>
              </div>
              <button
                onClick={() => setChartHidden(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#4763f0",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <span>Hide chart</span>
                <SlidersHorizontal size={13} />
              </button>
            </div>

            {/* Chart embed container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "calc(100% - 36px)",
                minHeight: "360px",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "rgba(10, 12, 16, 1)",
              }}
            >
              <div className="tv-chart-loading" aria-hidden="true">Loading live chart…</div>
              <iframe
                key={tvChartUrl}
                src={tvChartUrl}
                title={`${tvSymbol} live chart`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, display: "block" }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "var(--color-card-background, rgba(255, 255, 255, 0.02))",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
              Trade Chart ({currency})
            </span>
            <button
              onClick={() => setChartHidden(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "6px",
                backgroundColor: "#4763f0",
                border: "none",
                color: "#ffffff",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span>Show chart</span>
              <SlidersHorizontal size={13} />
            </button>
          </div>
        )}

        {/* ORDER FORM PANEL (Image 1) */}
        <div
          style={{
            backgroundColor: "var(--color-card-background, rgba(255, 255, 255, 0.02))",
            borderRadius: "12px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >
          {chartHidden && (
            <button
              onClick={() => setChartHidden(false)}
              style={{
                alignSelf: "flex-start",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                color: "#fff",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Show chart
            </button>
          )}

          {/* Buy / Sell / Convert Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setOrderTab("buy")}
              style={{
                padding: "9px",
                borderRadius: "8px",
                backgroundColor: orderTab === "buy" ? "#01b28b" : "transparent",
                color: orderTab === "buy" ? "#fff" : "rgba(255, 255, 255, 0.6)",
                border: orderTab === "buy" ? "none" : "1px solid rgba(255, 255, 255, 0.06)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderTab("sell")}
              style={{
                padding: "9px",
                borderRadius: "8px",
                backgroundColor: orderTab === "sell" ? "#f84960" : "transparent",
                color: orderTab === "sell" ? "#fff" : "rgba(255, 255, 255, 0.6)",
                border: orderTab === "sell" ? "none" : "1px solid rgba(255, 255, 255, 0.06)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Sell
            </button>
            <button
              onClick={() => setOrderTab("convert")}
              style={{
                padding: "9px",
                borderRadius: "8px",
                backgroundColor: orderTab === "convert" ? "#3b82f6" : "transparent",
                color: orderTab === "convert" ? "#fff" : "rgba(255, 255, 255, 0.6)",
                border: orderTab === "convert" ? "none" : "1px solid rgba(255, 255, 255, 0.06)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Convert
            </button>
          </div>

          {/* ===================== CONVERT TAB CONTENT (Matching Image 2) ===================== */}
          {orderTab === "convert" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              {/* From Box */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", fontWeight: 500 }}>
                  From
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      step="any"
                      value={convertFromAmount}
                      onChange={(e) => setConvertFromAmount(e.target.value)}
                      placeholder="0.00"
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#ffffff",
                        fontSize: "22px",
                        fontWeight: 700,
                        width: "100%",
                      }}
                    />
                    <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.45)", marginTop: "2px" }}>
                      ~${convertFromUsdEquiv}
                    </div>
                  </div>

                  {/* From Asset Pill */}
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConvertFromDropdownOpen(!isConvertFromDropdownOpen);
                        setIsConvertToDropdownOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {convertFromSymbol === "USD" ? (
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          $
                        </span>
                      ) : (
                        <AssetBrandIcon symbol={convertFromSymbol} size={18} />
                      )}
                      <span>{convertFromSymbol}</span>
                      <ChevronDown size={14} color="rgba(255, 255, 255, 0.6)" />
                    </button>

                    {isConvertFromDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          right: 0,
                          width: "140px",
                          backgroundColor: "#16181d",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          zIndex: 60,
                          maxHeight: "180px",
                          overflowY: "auto",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                        }}
                      >
                        {CONVERT_ASSETS.map((sym) => (
                          <div
                            key={sym}
                            onClick={() => {
                              setConvertFromSymbol(sym);
                              setIsConvertFromDropdownOpen(false);
                            }}
                            style={{
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: convertFromSymbol === sym ? "#3b82f6" : "#fff",
                              fontSize: "12.5px",
                              fontWeight: convertFromSymbol === sym ? 700 : 500,
                              cursor: "pointer",
                              backgroundColor: convertFromSymbol === sym ? "rgba(59, 130, 246, 0.12)" : "transparent",
                            }}
                          >
                            <AssetBrandIcon symbol={sym} size={16} />
                            <span>{sym}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "11.5px", color: "rgba(255, 255, 255, 0.55)" }}>
                  {convertFromSymbol === "USD"
                    ? `${Number(accountType === "real" ? realBalance : demoBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `0 ${convertFromSymbol}`}
                </div>
              </div>

              {/* Center Swap Button */}
              <div style={{ display: "flex", justifyContent: "center", margin: "-4px 0", zIndex: 10 }}>
                <button
                  type="button"
                  onClick={handleSwapSymbols}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#16181d",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                  }}
                  title="Swap currencies"
                >
                  <ArrowUpDown size={16} />
                </button>
              </div>

              {/* To Box */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", fontWeight: 500 }}>
                  To
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
                      {convertToCalculated}
                    </div>
                  </div>

                  {/* To Asset Pill */}
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConvertToDropdownOpen(!isConvertToDropdownOpen);
                        setIsConvertFromDropdownOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {convertToSymbol === "USD" ? (
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          $
                        </span>
                      ) : (
                        <AssetBrandIcon symbol={convertToSymbol} size={18} />
                      )}
                      <span>{convertToSymbol}</span>
                      <ChevronDown size={14} color="rgba(255, 255, 255, 0.6)" />
                    </button>

                    {isConvertToDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          right: 0,
                          width: "140px",
                          backgroundColor: "#16181d",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          zIndex: 60,
                          maxHeight: "180px",
                          overflowY: "auto",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                        }}
                      >
                        {CONVERT_ASSETS.map((sym) => (
                          <div
                            key={sym}
                            onClick={() => {
                              setConvertToSymbol(sym);
                              setIsConvertToDropdownOpen(false);
                            }}
                            style={{
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: convertToSymbol === sym ? "#3b82f6" : "#fff",
                              fontSize: "12.5px",
                              fontWeight: convertToSymbol === sym ? 700 : 500,
                              cursor: "pointer",
                              backgroundColor: convertToSymbol === sym ? "rgba(59, 130, 246, 0.12)" : "transparent",
                            }}
                          >
                            <AssetBrandIcon symbol={sym} size={16} />
                            <span>{sym}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "11.5px", color: "rgba(255, 255, 255, 0.55)" }}>
                  {convertToSymbol === "USD"
                    ? `${Number(accountType === "real" ? realBalance : demoBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `0 ${convertToSymbol}`}
                </div>
              </div>

              {/* Convert Button */}
              <button
                type="button"
                onClick={handleExecuteConvert}
                disabled={convertSubmitting || !parseFloat(convertFromAmount)}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  backgroundColor: parseFloat(convertFromAmount) > 0 ? "#3b82f6" : "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: parseFloat(convertFromAmount) > 0 ? "pointer" : "not-allowed",
                  transition: "all 0.15s ease",
                  marginTop: "6px",
                }}
              >
                {convertSubmitting ? "Converting..." : "Convert"}
              </button>
            </div>
          ) : (
            /* ===================== BUY & SELL TAB CONTENT (Matching Image 1) ===================== */
            <>
              {/* Trade Type Dropdown */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    marginBottom: "6px",
                    display: "block",
                    fontWeight: 500,
                  }}
                >
                  Trade type:
                </label>
                <div
                  onClick={() => setIsTradeTypeDropdownOpen(!isTradeTypeDropdownOpen)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#fff",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <span>{tradeType}</span>
                  <ChevronDown
                    size={15}
                    color="rgba(255, 255, 255, 0.5)"
                    style={{
                      transform: isTradeTypeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s",
                    }}
                  />
                </div>

                {isTradeTypeDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      backgroundColor: "#16181d",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      zIndex: 40,
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}
                  >
                    {["Crypto", "Stocks", "Forex", "Commodities"].map((t) => (
                      <div
                        key={t}
                        onClick={() => {
                          setTradeType(t);
                          setIsTradeTypeDropdownOpen(false);
                          const list = ASSETS_BY_TYPE[t] || [];
                          if (list.length > 0) {
                            setCurrency(list[0].symbol);
                          }
                        }}
                        style={{
                          padding: "9px 14px",
                          color: tradeType === t ? "#4763f0" : "#fff",
                          fontSize: "13px",
                          fontWeight: tradeType === t ? 700 : 500,
                          cursor: "pointer",
                          backgroundColor: tradeType === t ? "rgba(71, 99, 240, 0.12)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (tradeType !== t) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (tradeType !== t) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount with Currency selector */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    marginBottom: "6px",
                    display: "block",
                    fontWeight: 500,
                  }}
                >
                  Amount:
                </label>
                <div
                  style={{
                    width: "100%",
                    padding: "6px 8px 6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                  }}
                >
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      width: "100%",
                    }}
                  />
                  <div
                    onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <AssetBrandIcon symbol={currency} size={16} />
                    <span>{currency}</span>
                    <ChevronDown
                      size={13}
                      style={{
                        transform: isAssetDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.15s",
                      }}
                    />
                  </div>
                </div>

                {isAssetDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      right: 0,
                      width: "160px",
                      backgroundColor: "#16181d",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      zIndex: 40,
                      maxHeight: "220px",
                      overflowY: "auto",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}
                  >
                    {(ASSETS_BY_TYPE[tradeType] || []).map((a) => (
                      <div
                        key={a.symbol}
                        onClick={() => {
                          setCurrency(a.symbol);
                          setIsAssetDropdownOpen(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: currency === a.symbol ? "#4763f0" : "#fff",
                          fontSize: "12.5px",
                          fontWeight: currency === a.symbol ? 700 : 500,
                          cursor: "pointer",
                          backgroundColor: currency === a.symbol ? "rgba(71, 99, 240, 0.12)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (currency !== a.symbol) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (currency !== a.symbol) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <AssetBrandIcon symbol={a.symbol} size={16} />
                        <span>{a.symbol}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Balance & Current Asset Price (Matching Image 1) */}
              <div>
                <label
                  htmlFor="trade-funding-asset"
                  style={{ fontSize: "12px", color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))", marginBottom: 6, display: "block", fontWeight: 500 }}
                >
                  Funding asset / result display:
                </label>
                <select
                  id="trade-funding-asset"
                  value={fundingAsset}
                  onChange={(event) => setFundingAsset(event.target.value)}
                  style={{ width: "100%", minHeight: 42, padding: "9px 36px 9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", backgroundColor: "rgba(255,255,255,.03)", color: "#fff" }}
                >
                  {fundingOptions.map((symbol) => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
                <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,.45)", marginTop: 5, lineHeight: 1.4 }}>
                  The final profit or loss will appear under this asset on your dashboard.
                </div>
              </div>

              {/* Dynamic Balance & Current Asset Price (Matching Image 1) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "2px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11.5px",
                    color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                  }}
                >
                  <span>{orderTab === "sell" ? `Current ${currency} balance:` : "Current USD balance:"}</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>
                    {orderTab === "sell"
                      ? `${(holdings.find((h) => h.symbol.toUpperCase() === (currency || "").toUpperCase())?.units ?? 0)} ${currency}`
                      : `$${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`}
                    {accountType === "real" && (holdingsSummary?.totalUsd ?? 0) > 0 && (
                      <span style={{ color: "#3861fb", fontSize: "11px", marginLeft: "6px" }} title="Crypto asset portfolio value">
                        (Portfolio: ${(holdingsSummary?.totalUsd ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </span>
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11.5px",
                    color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                  }}
                >
                  <span>Current {currency} price:</span>
                  <span style={{ fontWeight: 600, color: "#00d592" }}>
                    ${activeAssetPrice < 1
                      ? activeAssetPrice.toFixed(4)
                      : activeAssetPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                  </span>
                </div>
              </div>

              {/* Leverage Slider */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                      fontWeight: 500,
                    }}
                  >
                    Leverage:
                  </label>
                  <div
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {leverage}x
                  </div>
                </div>

                <div style={{ position: "relative", width: "100%", padding: "4px 0" }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    style={{
                      width: "100%",
                      accentColor: "#4763f0",
                      cursor: "pointer",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "10.5px",
                      color: "rgba(255, 255, 255, 0.45)",
                      marginTop: "3px",
                    }}
                  >
                    <span>0x</span>
                    <span>25x</span>
                    <span>50x</span>
                    <span>75x</span>
                    <span>100x</span>
                  </div>
                </div>
              </div>

              {/* Use TP/SL Toggle + Set with AI button */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12.5px",
                      fontWeight: 500,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={useTpSl}
                      onChange={(e) => setUseTpSl(e.target.checked)}
                      style={{ accentColor: "#4763f0", cursor: "pointer" }}
                    />
                    <span>Use TP/SL</span>
                  </label>
                  <button
                    onClick={handleSetWithAi}
                    style={{
                      padding: "3px 10px",
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Sparkles size={11} color="#4763f0" />
                    <span>Set with AI</span>
                  </button>
                </div>

                {useTpSl && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    <div>
                      <label style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                        Stop loss:
                      </label>
                      <input
                        type="text"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color: "#ff3344",
                          fontSize: "12px",
                          fontWeight: 600,
                          boxSizing: "border-box",
                          marginTop: "3px",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                        Take profit:
                      </label>
                      <input
                        type="text"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color: "#01b28b",
                          fontSize: "12px",
                          fontWeight: 600,
                          boxSizing: "border-box",
                          marginTop: "3px",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Duration Selector */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    marginBottom: "6px",
                    display: "block",
                    fontWeight: 500,
                  }}
                >
                  Duration:
                </label>
                <div
                  onClick={() => setIsDurationDropdownOpen(!isDurationDropdownOpen)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#fff",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <span>{duration}</span>
                  <ChevronDown
                    size={15}
                    color="rgba(255, 255, 255, 0.5)"
                    style={{
                      transform: isDurationDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s",
                    }}
                  />
                </div>

                {isDurationDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      backgroundColor: "#16181d",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      zIndex: 40,
                      maxHeight: "220px",
                      overflowY: "auto",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <div
                        key={d}
                        onClick={() => {
                          setDuration(d);
                          setIsDurationDropdownOpen(false);
                        }}
                        style={{
                          padding: "9px 14px",
                          color: duration === d ? "#4763f0" : "#fff",
                          fontSize: "13px",
                          fontWeight: duration === d ? 700 : 500,
                          cursor: "pointer",
                          backgroundColor: duration === d ? "rgba(71, 99, 240, 0.12)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (duration !== d) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (duration !== d) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button (Sell or Buy) */}
              <button
                onClick={handleTradeAction}
                disabled={orderExecuting}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  backgroundColor: orderTab === "sell" ? "#f84960" : "#01b28b",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  opacity: orderExecuting ? 0.7 : 1,
                  marginTop: "6px",
                }}
              >
                {orderExecuting ? "Executing..." : orderTab === "sell" ? "Sell" : "Buy"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===================== LOWER SECTION (My Trades Table) ===================== */}
      <div
        style={{
          backgroundColor: "var(--color-card-background, rgba(255, 255, 255, 0.02))",
          borderRadius: "12px",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxSizing: "border-box",
        }}
      >
        {/* Header & Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
            My trades
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setMyTradesTab("all")}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                backgroundColor: myTradesTab === "all" ? "#3b82f6" : "transparent",
                color: myTradesTab === "all" ? "#fff" : "rgba(255, 255, 255, 0.6)",
                border: "none",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              All
            </button>
            <button
              onClick={() => {
                setMyTradesTab("swaps");
                fetchSwaps();
              }}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                backgroundColor: myTradesTab === "swaps" ? "#3b82f6" : "transparent",
                color: myTradesTab === "swaps" ? "#fff" : "rgba(255, 255, 255, 0.6)",
                border: "none",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Swaps
            </button>
            <button
              onClick={() => setMyTradesTab("auto")}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                backgroundColor: myTradesTab === "auto" ? "#3b82f6" : "transparent",
                color: myTradesTab === "auto" ? "#fff" : "rgba(255, 255, 255, 0.6)",
                border: "none",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Auto
            </button>
          </div>
        </div>

        {/* TAB 1: ALL (Standard Open & Closed Trades) */}
        {myTradesTab === "all" && (() => {
          const openPositions = positions.filter((p) => p.status === "OPEN");
          const closedPositions = positions.filter((p) => p.status === "CLOSED");

          return (
            <>
              {/* Open Trades Accordion */}
              <div
                style={{
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.025)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenTradesOpen(!openTradesOpen)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={15} color="rgba(255, 255, 255, 0.6)" />
                    <span>Open</span>
                    <strong style={{ color: openPositions.length > 0 ? "#3b82f6" : "rgba(255, 255, 255, 0.5)" }}>
                      ({openPositions.length})
                    </strong>
                  </div>
                  <ChevronDown
                    size={14}
                    style={{
                      transition: "transform 0.2s",
                      transform: openTradesOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {openTradesOpen && (
                  <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    {openPositions.length === 0 ? (
                      <div
                        style={{
                          padding: "16px",
                          fontSize: "12.5px",
                          color: "rgba(255, 255, 255, 0.5)",
                          textAlign: "center",
                        }}
                      >
                        No open trades at the moment.
                      </div>
                    ) : (
                      <div className="dashboard-trade-table-scroll" style={{ overflowX: "auto" }}>
                        <table className="dashboard-trade-table" style={{ width: "100%", minWidth: "750px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                          <thead>
                            <tr style={{ color: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Asset</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Side</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Size (Margin)</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Entry price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Mark price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Unrealized PnL</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, textAlign: "right", whiteSpace: "nowrap" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {openPositions.map((pos) => {
                              const baseMark = prices[pos.symbol.toUpperCase()] || pos.entryPrice;
                              // Deterministic micro-fluctuations so open trade profit ticks realistically every second
                              let seed = 0;
                              for (let i = 0; i < pos.id.length; i++) seed = (Math.imul(31, seed) + pos.id.charCodeAt(i)) | 0;
                              seed = Math.abs(seed);
                              const sec = Math.floor(now / 1000);
                              const wave = Math.sin((sec + (seed % 50)) * 0.85) * 0.0016 + Math.cos((sec + ((seed >> 2) % 50)) * 1.35) * 0.001;
                              const mark = baseMark * (1 + wave);
                              const diff = pos.side === "BUY" ? mark - pos.entryPrice : pos.entryPrice - mark;
                              const estPnl = (diff / pos.entryPrice) * pos.amount * pos.leverage;
                              const isProfitable = estPnl >= 0;
                              const posMargin = Number(pos.margin ?? (pos.amount / (pos.leverage || 1)));

                              return (
                                <tr key={pos.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <AssetBrandIcon symbol={pos.symbol} size={18} />
                                      <span>
                                        {pos.symbol}
                                        {pos.source === "COPY_TRADING" && (
                                          <small style={{ display: "block", marginTop: 2, color: "#8ea0ff", fontSize: 9.5, fontWeight: 600 }}>
                                            Copied from {pos.copyExpertName || "expert"}
                                          </small>
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                                    <span
                                      style={{
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        backgroundColor: pos.side === "BUY" ? "rgba(1, 178, 139, 0.15)" : "rgba(248, 73, 96, 0.15)",
                                        color: pos.side === "BUY" ? "#01b28b" : "#f84960",
                                      }}
                                    >
                                      {pos.side} {pos.leverage}x
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.85)", whiteSpace: "nowrap" }}>
                                    ${pos.amount.toFixed(2)} (${posMargin.toFixed(2)})
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.85)", whiteSpace: "nowrap" }}>
                                    ${pos.entryPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.85)", whiteSpace: "nowrap" }}>
                                    ${mark.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", fontWeight: 600, color: isProfitable ? "#01b28b" : "#f84960", whiteSpace: "nowrap" }}>
                                    {isProfitable ? "+" : ""}${estPnl.toFixed(2)}
                                  </td>
                                  <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                                    <button
                                      onClick={() => handleClosePosition(pos)}
                                      disabled={closingPositionId === pos.id}
                                      style={{
                                        padding: "4px 12px",
                                        borderRadius: "4px",
                                        backgroundColor: "rgba(248, 73, 96, 0.15)",
                                        border: "1px solid rgba(248, 73, 96, 0.3)",
                                        color: "#f84960",
                                        fontSize: "11.5px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {closingPositionId === pos.id ? "Closing..." : "Close"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Closed Trades Accordion */}
              <div
                style={{
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.025)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setClosedTradesOpen(!closedTradesOpen)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Check size={15} color="rgba(255, 255, 255, 0.6)" />
                    <span>Closed</span>
                    <strong style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                      ({closedPositions.length})
                    </strong>
                  </div>
                  <ChevronDown
                    size={14}
                    style={{
                      transition: "transform 0.2s",
                      transform: closedTradesOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {closedTradesOpen && (
                  <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    {closedPositions.length === 0 ? (
                      <div
                        style={{
                          padding: "16px",
                          fontSize: "12.5px",
                          color: "rgba(255, 255, 255, 0.5)",
                          textAlign: "center",
                        }}
                      >
                        No closed trades yet.
                      </div>
                    ) : (
                      <div className="dashboard-trade-table-scroll" style={{ overflowX: "auto" }}>
                        <table className="dashboard-trade-table" style={{ width: "100%", minWidth: "700px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                          <thead>
                            <tr style={{ color: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Asset</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Side</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Size</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Entry price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Settled PnL</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, textAlign: "right" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {closedPositions.map((pos) => {
                              const pnl = pos.pnl ?? 0;
                              const isProfitable = pnl >= 0;
                              return (
                                <tr key={pos.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#fff" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <AssetBrandIcon symbol={pos.symbol} size={18} />
                                      <span>
                                        {pos.symbol}
                                        {pos.source === "COPY_TRADING" && (
                                          <small style={{ display: "block", marginTop: 2, color: "#8ea0ff", fontSize: 9.5, fontWeight: 600 }}>
                                            Copied from {pos.copyExpertName || "expert"}
                                          </small>
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 14px" }}>
                                    <span
                                      style={{
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        backgroundColor: pos.side === "BUY" ? "rgba(1, 178, 139, 0.15)" : "rgba(248, 73, 96, 0.15)",
                                        color: pos.side === "BUY" ? "#01b28b" : "#f84960",
                                      }}
                                    >
                                      {pos.side}
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.85)" }}>
                                    ${pos.amount.toFixed(2)}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.85)" }}>
                                    ${pos.entryPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", fontWeight: 600, color: isProfitable ? "#01b28b" : "#f84960" }}>
                                    {isProfitable ? "+" : ""}${pnl.toFixed(2)}
                                  </td>
                                  <td style={{ padding: "12px 14px", textAlign: "right", color: "rgba(255, 255, 255, 0.5)" }}>
                                    CLOSED
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* TAB 2: SWAPS (Matching Image 3) */}
        {myTradesTab === "swaps" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255, 255, 255, 0.85)" }}>
              Swap ({swaps.length})
            </div>
            <div className="dashboard-trade-table-scroll" style={{ overflowX: "auto" }}>
              <table className="dashboard-trade-table" style={{ width: "100%", minWidth: "600px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ color: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <th style={{ padding: "10px 14px", fontWeight: 500 }}>Date</th>
                    <th style={{ padding: "10px 14px", fontWeight: 500 }}>Trade</th>
                    <th style={{ padding: "10px 14px", fontWeight: 500 }}>From</th>
                    <th style={{ padding: "10px 14px", fontWeight: 500 }}>To</th>
                    <th style={{ padding: "10px 14px", fontWeight: 500, textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {swaps.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "28px 14px", textAlign: "center", color: "rgba(255, 255, 255, 0.45)" }}>
                        {swapsLoading ? "Loading swaps..." : "No swaps yet."}
                      </td>
                    </tr>
                  ) : (
                    swaps.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                        <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.7)" }}>
                          {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#fff" }}>
                          {s.trade}
                        </td>
                        <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.85)" }}>
                          {s.from}
                        </td>
                        <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.85)" }}>
                          {s.to}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor: "rgba(1, 178, 139, 0.15)",
                              color: "#01b28b",
                            }}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUTO TRADES (Matching Image 4) */}
        {myTradesTab === "auto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Auto Open Accordion */}
            <div
              style={{
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.025)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setAutoOpenExpanded(!autoOpenExpanded)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={15} color="rgba(255, 255, 255, 0.6)" />
                  <span>Open (0)</span>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    transform: autoOpenExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {autoOpenExpanded && (
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <div style={{ padding: "20px 14px", textAlign: "center", color: "rgba(255, 255, 255, 0.45)", fontSize: "12.5px" }}>
                    No Open trades yet.
                  </div>
                </div>
              )}
            </div>

            {/* Auto Closed Accordion */}
            <div
              style={{
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.025)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setAutoClosedExpanded(!autoClosedExpanded)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Check size={15} color="rgba(255, 255, 255, 0.6)" />
                  <span>Closed (0)</span>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    transform: autoClosedExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {autoClosedExpanded && (
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <div style={{ padding: "20px 14px", textAlign: "center", color: "rgba(255, 255, 255, 0.45)", fontSize: "12.5px" }}>
                    No Closed trades yet.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Responsive Confirmation Dialog & Toast Bar (No native confirm/alert) */}
      <CustomConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
        loading={closingPositionId !== null}
      />
      <CustomNotificationBar
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

export default function StandaloneTradePage() {
  return (
    <Suspense fallback={<div style={{ padding: "32px", color: "#fff", textAlign: "center" }}>Loading trade interface…</div>}>
      <TradingContent />
    </Suspense>
  );
}
