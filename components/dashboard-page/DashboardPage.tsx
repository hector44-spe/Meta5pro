"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePrices } from "@/lib/usePrices";
import { useHoldings } from "@/lib/useHoldings";
import assetCatalog from "@/data/assetsData.json";
import Link from "next/link";
import {
  CirclePlus,
  CircleMinus,
  WalletMinimal,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
  FileText,
  Clock,
  Check,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowLeftRight,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";
import CustomNotificationBar, { CustomNotificationState } from "@/components/UI/CustomNotificationBar";
import AssetBrandIcon from "@/components/dashboard/AssetBrandIcon";
import "@/styles/dashboard.css";

export default function DashboardPage() {
  const {
    openModal,
    hideBalance,
    setHideBalance,
    accountType,
    currentBalance,
    portfolioBalance,
    portfolioChangeUsd,
    portfolioChangePercent,
    realBalance,
    demoBalance,
    refreshBalance,
    formatMoney,
    balanceLoaded,
    notifications,
    unreadCount,
  } = useDashboard();

  interface Position {
    id: string;
    userId: string;
    symbol: string;
    type: "BUY" | "SELL";
    side?: "BUY" | "SELL";
    amount: number;
    entryPrice: number;
    leverage: number;
    margin: number;
    pnl: number | null;
    status: "OPEN" | "CLOSED";
    createdAt: string;
    closedAt: string | null;
    duration?: string;
    closeAt?: string | null;
    customPnl?: number | null;
    isCustomPnl?: boolean;
  }

  const livePrices: Record<string, number> = {
    BTC: 86900.0,
    ETH: 2710.0,
    SOL: 188.0,
    XRP: 1.48,
    DOGE: 0.38,
    BNB: 640.0,
    ADA: 0.72,
    EURUSD: 1.054,
    GBPUSD: 1.261,
    USDJPY: 154.2,
    AUDUSD: 0.651,
    AAPL: 228.0,
    NVDA: 135.0,
    TSLA: 320.0,
    MSFT: 425.0,
    GOOGL: 175.0,
    GOLD: 2680.0,
    XAUUSD: 2680.0,
    SILVER: 31.2,
    OIL: 68.5,
    USDT: 1.0,
    USDC: 1.0,
  };

  const [mounted, setMounted] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);

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

  const handleClosePosition = (pos: { id: string; symbol: string; type: string }) => {
    setConfirmState({
      title: `Close Position on ${pos.symbol}?`,
      message: `Are you sure you want to close this ${pos.type} position? Any unrealized profit or loss will be realized immediately.`,
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
              type: "success",
              message: `Position on ${pos.symbol} closed successfully. Realized PnL: $${Number(data.position?.pnl || 0).toFixed(2)}`,
            });
            await fetchPositions();
            refreshBalance();
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

  useEffect(() => {
    setMounted(true);
    fetchPositions();
    fetchSwaps();
  }, []);

  // Timer for countdown ticks
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll open positions without continuously saturating the API and database.
  useEffect(() => {
    const hasOpen = positions.some((p) => p.status === "OPEN");
    if (!hasOpen) return;
    const interval = setInterval(() => {
      fetchPositions();
      refreshBalance();
    }, 10_000);
    return () => clearInterval(interval);
  }, [positions]);

  // Tabs & Controls state
  const [activeMobileTab, setActiveMobileTab] = useState<"assets" | "overview" | "categories">("assets");
  const [moveMoneyOpen, setMoveMoneyOpen] = useState(false);
  const [orderTab, setOrderTab] = useState<"buy" | "sell" | "convert">("buy");
  const [tradeType, setTradeType] = useState("Crypto");
  const [isTradeTypeDropdownOpen, setIsTradeTypeDropdownOpen] = useState(false);
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("BTC");
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [leverage, setLeverage] = useState(5);
  const [useTpSl, setUseTpSl] = useState(false);
  const [stopLoss, setStopLoss] = useState("73913.647");
  const [takeProfit, setTakeProfit] = useState("73916.647");
  const [duration, setDuration] = useState("2 minutes");
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  const [myTradesTab, setMyTradesTab] = useState<"all" | "swaps" | "auto">("all");
  const [openTradesOpen, setOpenTradesOpen] = useState(false);
  const [closedTradesOpen, setClosedTradesOpen] = useState(false);
  const [chartHidden, setChartHidden] = useState(false);

  // User & Balances
  const [userProfile, setUserProfile] = useState<{
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    status: string;
    wallet?: {
      mainBalance: number;
      interestBalance: number;
      totalDeposited: number;
      totalWithdrawn: number;
    };
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserProfile(d.user);
      })
      .catch(console.error);
  }, []);

  const [orderExecuting, setOrderExecuting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  // Live prices (refresh every minute) and the user's real per-coin holdings
  const { prices } = usePrices();
  const { holdings, summary: holdingsSummary, loading: holdingsLoading } = useHoldings();
  const btcPrice = prices[(currency || "BTC").toUpperCase()] ?? 0;

  const fmtUsdValue = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtUnitsValue = (n: number, sym: string) =>
    `${n === 0 ? "0.0000" : Number(n.toFixed(8)).toString()} ${sym}`;

  // Top assets purchased by the client first (reflecting real held/bought amounts), then defaults
  const assetsList = useMemo(() => {
    const catalog = assetCatalog as { name: string; symbol: string; icon: string }[];
    const info = (sym: string) => {
      const c = catalog.find((a) => a.symbol.toUpperCase() === sym);
      return { name: c?.name ?? sym, icon: c?.icon ?? `/dashboard_files/${sym}.svg` };
    };

    const heldMap = new Map<string, { units: number; pendingUnits: number; usd: number; changePercent: number; changeUsd: number; realizedTradePnl: number }>();

    // 1. From wallet holdings (strictly approved deposits, conversions, bought assets)
    for (const h of holdings) {
      const u = h.units; // Only approved units; do not add unapproved pending deposits
      if (u > 0 || h.pendingUnits > 0) {
        const p = prices[h.symbol] ?? h.price ?? 0;
        heldMap.set(h.symbol.toUpperCase(), {
          units: u,
          pendingUnits: h.pendingUnits,
          usd: u * p,
          changePercent: h.changePercent,
          changeUsd: h.changeUsd,
          realizedTradePnl: h.realizedTradePnl,
        });
      }
    }

    const heldItems = Array.from(heldMap.entries())
      .map(([sym, data]) => ({
        symbol: sym,
        ...info(sym),
        usdNum: data.usd,
        usd: fmtUsdValue(data.usd),
        amount: fmtUnitsValue(data.units, sym),
        pendingAmount: data.pendingUnits > 0 ? fmtUnitsValue(data.pendingUnits, sym) : null,
        livePrice: prices[sym] ?? 0,
        changePercent: data.changePercent,
        changeUsd: data.changeUsd,
        realizedTradePnl: data.realizedTradePnl,
      }))
      .sort((a, b) => b.usdNum - a.usdNum);

    const defaults = ["BTC", "ETH", "SOL", "AAPL", "GOOGL"]
      .filter((sym) => !heldMap.has(sym))
      .map((sym) => ({
        symbol: sym,
        ...info(sym),
        usdNum: 0,
        usd: fmtUsdValue(0),
        amount: fmtUnitsValue(0, sym),
        pendingAmount: null,
        livePrice: prices[sym] ?? 0,
        changePercent: 0,
        changeUsd: 0,
        realizedTradePnl: 0,
      }));

    return [...heldItems, ...defaults];
  }, [holdings, prices]);

  const totalProfit = useMemo(() => {
    const pnl = positions.reduce((acc, p) => acc + Number(p.pnl || 0), 0);
    const interest = Number(userProfile?.wallet?.interestBalance ?? 0);
    return Math.round((pnl + interest) * 100) / 100;
  }, [positions, userProfile]);

  const categoriesData = useMemo(() => {
    const cryptoTotal = assetsList
      .filter((a) => a.usdNum > 0 && !["AAPL", "GOOGL", "MSFT", "NVDA", "TSLA"].includes(a.symbol))
      .reduce((acc, a) => acc + a.usdNum, 0);

    const stocksTotal = assetsList
      .filter((a) => a.usdNum > 0 && ["AAPL", "GOOGL", "MSFT", "NVDA", "TSLA"].includes(a.symbol))
      .reduce((acc, a) => acc + a.usdNum, 0);

    const cashBalance = Math.max(0, (currentBalance || Number(userProfile?.wallet?.mainBalance ?? 0)) - holdingsSummary.externalBookUsd);
    const activeMargin = positions
      .filter((p) => p.status === "OPEN")
      .reduce((acc, p) => acc + (Number(p.amount) / Number(p.leverage || 1)), 0);

    const grandTotal = cryptoTotal + stocksTotal + cashBalance + activeMargin || 1;

    return [
      { name: "Crypto Assets", value: cryptoTotal, color: "#f7931a", pct: Math.round((cryptoTotal / grandTotal) * 100) },
      { name: "Available Cash", value: cashBalance, color: "#01b28b", pct: Math.round((cashBalance / grandTotal) * 100) },
      { name: "Trading Margin", value: activeMargin, color: "#4763f0", pct: Math.round((activeMargin / grandTotal) * 100) },
      ...(stocksTotal > 0 ? [{ name: "Stocks & Equities", value: stocksTotal, color: "#a78bfa", pct: Math.round((stocksTotal / grandTotal) * 100) }] : []),
    ];
  }, [assetsList, currentBalance, userProfile, positions, holdingsSummary.externalBookUsd]);

  const ASSETS_BY_TYPE: Record<
    string,
    Array<{ symbol: string; name: string; price: number; icon?: string }>
  > = {
    Crypto: [
      { symbol: "BTC", name: "Bitcoin", price: 86900.0, icon: "/dashboard_files/BTC.svg" },
      { symbol: "ETH", name: "Ethereum", price: 2710.0, icon: "/dashboard_files/ETH.svg" },
      { symbol: "SOL", name: "Solana", price: 188.0, icon: "/dashboard_files/SOL.svg" },
      { symbol: "XRP", name: "Ripple", price: 1.48, icon: "/dashboard_files/XRP.svg" },
      { symbol: "DOGE", name: "Dogecoin", price: 0.38 },
      { symbol: "BNB", name: "Binance Coin", price: 640.0 },
      { symbol: "ADA", name: "Cardano", price: 0.72 },
    ],
    Forex: [
      { symbol: "EURUSD", name: "EUR / USD", price: 1.054 },
      { symbol: "GBPUSD", name: "GBP / USD", price: 1.261 },
      { symbol: "USDJPY", name: "USD / JPY", price: 154.2 },
      { symbol: "AUDUSD", name: "AUD / USD", price: 0.651 },
    ],
    Stocks: [
      { symbol: "AAPL", name: "Apple Inc.", price: 228.0 },
      { symbol: "NVDA", name: "NVIDIA Corp.", price: 135.0 },
      { symbol: "TSLA", name: "Tesla Inc.", price: 320.0 },
      { symbol: "MSFT", name: "Microsoft Corp.", price: 425.0 },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 175.0 },
    ],
    Commodities: [
      { symbol: "GOLD", name: "Gold (XAU/USD)", price: 2680.0 },
      { symbol: "SILVER", name: "Silver (XAG/USD)", price: 31.2 },
      { symbol: "OIL", name: "Crude Oil (WTI)", price: 68.5 },
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

  const activeAssetPrice = useMemo(() => {
    const sym = (currency || "BTC").toUpperCase();
    if (prices[sym]) return prices[sym];
    return livePrices[sym] ?? 100.0;
  }, [prices, currency, livePrices]);

  // TradingView chart (official embed iframe, loaded lazily by the browser)
  // Live TradingView symbol for the asset selected in the trade panel.
  const tvSymbol = useMemo(() => {
    const c = (currency || "BTC").toUpperCase();
    const stocks: Record<string, string> = {
      AAPL: "NASDAQ:AAPL",
      GOOGL: "NASDAQ:GOOGL",
      TSLA: "NASDAQ:TSLA",
      MSFT: "NASDAQ:MSFT",
      NVDA: "NASDAQ:NVDA",
    };
    const forex: Record<string, string> = {
      EURUSD: "FX:EURUSD",
      GBPUSD: "FX:GBPUSD",
      USDJPY: "FX:USDJPY",
      AUDUSD: "FX:AUDUSD",
    };
    const commodities: Record<string, string> = {
      GOLD: "OANDA:XAUUSD",
      XAUUSD: "OANDA:XAUUSD",
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

  // Convert calculations (matching Image 2)
  const CONVERT_ASSETS = ["USD", "BTC", "ETH", "SOL", "USDT", "XRP", "BNB", "ADA"];

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
      const curBal = Number(currentBalance || 0);
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

  // AI assistant for TP/SL
  const handleSetWithAi = () => {
    const base = activeAssetPrice || 100;
    if (orderTab === "sell") {
      setStopLoss((base * 1.025).toFixed(base < 10 ? 4 : 2));
      setTakeProfit((base * 0.95).toFixed(base < 10 ? 4 : 2));
    } else {
      setStopLoss((base * 0.975).toFixed(base < 10 ? 4 : 2));
      setTakeProfit((base * 1.05).toFixed(base < 10 ? 4 : 2));
    }
    setUseTpSl(true);
  };

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
      openModal("deposit");
      setNotification({
        type: "error",
        message: "Insufficient real balance for this order. Please deposit.",
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
          amount: parsedAmount,
          leverage: leverage || 5,
          duration: duration || "2 minutes",
          useTpSl,
          stopLoss: useTpSl ? stopLoss : null,
          takeProfit: useTpSl ? takeProfit : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotification({
          type: "error",
          message: data.error || "Order execution failed",
        });
      } else {
        setNotification({
          type: "success",
          message: `${orderTab === "sell" ? "Sell" : "Buy"} order executed successfully! Position #${(data.position?.id || "OK").slice(0, 8)}`,
        });
        await fetchPositions();
        refreshBalance();
        setOpenTradesOpen(true);
      }
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Execution failed",
      });
    } finally {
      setOrderExecuting(false);
    }
  };

  // Keep navigation fixed by scrolling only the dashboard content pane.
  // `scrollIntoView()` may also scroll outer ancestors on mobile browsers.
  const scrollToTradingPanel = (tab?: "buy" | "sell" | "convert") => {
    if (tab) setOrderTab(tab);
    window.requestAnimationFrame(() => {
      const target = document.getElementById("trade-section");
      const scroller = target?.closest(".dashboard-page-content") as HTMLElement | null;
      if (!target || !scroller) return;
      const targetTop = scroller.scrollTop
        + target.getBoundingClientRect().top
        - scroller.getBoundingClientRect().top
        - 12;
      scroller.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    });
  };

  return (
    <div className="dashboard-content-grid">
      {/* ===================== UPPER SECTION (MainCard: Matches Image 1) ===================== */}
      <div
        className="dashboard-upper-grid dashboard-maincard-grid"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Full-width Balance & Top Assets Card (Image 1) */}
        <div
          style={{
            backgroundColor: "var(--color-card-background, rgba(255, 255, 255, 0.02))",
            borderRadius: "12px",
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            boxSizing: "border-box",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            width: "100%",
          }}
        >
          {/* Balance Top Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--color-text-secondary, rgba(255, 255, 255, 0.5))",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                <span>Total Balance</span>
                <button
                  onClick={() => setHideBalance(!hideBalance)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                  }}
                  title="Toggle balance visibility"
                >
                  {hideBalance ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                  marginTop: "6px",
                  lineHeight: 1.1,
                }}
              >
                {hideBalance ? "••••••" : !balanceLoaded ? "…" : portfolioBalance === 0 ? "$0" : formatMoney(portfolioBalance)}
              </div>
              {!hideBalance && balanceLoaded && holdingsSummary.totalCostBasisUsd > 0 && (
                <div
                  style={{
                    marginTop: "7px",
                    color: portfolioChangeUsd >= 0 ? "#01b28b" : "#f84960",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {portfolioChangeUsd >= 0 ? "+" : "−"}{formatMoney(Math.abs(portfolioChangeUsd))}
                  {" "}({portfolioChangePercent >= 0 ? "+" : ""}{portfolioChangePercent.toFixed(2)}%)
                </div>
              )}
            </div>

            {/* Desktop Move money & quick action icons */}
            <div
              className="balance-card-desktop-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                position: "relative",
              }}
            >
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMoveMoneyOpen(!moveMoneyOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(71, 99, 240, 0.12)",
                    border: "1px solid rgba(71, 99, 240, 0.25)",
                    color: "#7189ff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Zap size={14} fill="currentColor" />
                  <span>Move money</span>
                  <ChevronDown size={13} />
                </button>

                {moveMoneyOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      width: "170px",
                      background: "#16181d",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "10px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      zIndex: 100,
                      overflow: "hidden",
                      padding: "4px",
                    }}
                  >
                    <button
                      onClick={() => {
                        openModal("deposit");
                        setMoveMoneyOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        background: "none",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        textAlign: "left",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CirclePlus size={14} color="#01b28b" />
                      <span>Deposit</span>
                    </button>
                    <button
                      onClick={() => {
                        openModal("withdraw");
                        setMoveMoneyOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        background: "none",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        textAlign: "left",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CircleMinus size={14} color="#ff3344" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => openModal("deposit")}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  color: "rgba(255, 255, 255, 0.7)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Deposit"
              >
                <WalletMinimal size={15} />
              </button>
              <button
                onClick={() => openModal("notifications")}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  color: "rgba(255, 255, 255, 0.7)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="History"
              >
                <FileText size={15} />
              </button>
            </div>

            {/* Mobile Three Dots (···) */}
            <button
              className="balance-card-mobile-dots"
              onClick={() => openModal("settings")}
              aria-label="More options"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Mobile 4 Circular Action Buttons */}
          <div className="balance-card-mobile-actions">
            <button
              className="balance-card-mobile-action-btn"
              style={{ background: "transparent", backgroundColor: "transparent", border: "none", boxShadow: "none", padding: 0 }}
              onClick={() => openModal("deposit")}
            >
              <div className="balance-card-mobile-action-icon">
                <Plus size={18} />
              </div>
              <span className="balance-card-mobile-action-label">Deposit</span>
            </button>
            <button
              className="balance-card-mobile-action-btn"
              style={{ background: "transparent", backgroundColor: "transparent", border: "none", boxShadow: "none", padding: 0 }}
              onClick={() => openModal("withdraw")}
            >
              <div className="balance-card-mobile-action-icon">
                <ArrowUpRight size={18} />
              </div>
              <span className="balance-card-mobile-action-label">Withdraw</span>
            </button>
            <button
              className="balance-card-mobile-action-btn"
              style={{ background: "transparent", backgroundColor: "transparent", border: "none", boxShadow: "none", padding: 0 }}
              onClick={() => scrollToTradingPanel("buy")}
            >
              <div className="balance-card-mobile-action-icon">
                <TrendingUp size={18} />
              </div>
              <span className="balance-card-mobile-action-label">Trade</span>
            </button>
            <button
              className="balance-card-mobile-action-btn"
              style={{ background: "transparent", backgroundColor: "transparent", border: "none", boxShadow: "none", padding: 0 }}
              onClick={() => scrollToTradingPanel("convert")}
            >
              <div className="balance-card-mobile-action-icon">
                <ArrowLeftRight size={18} />
              </div>
              <span className="balance-card-mobile-action-label">Convert</span>
            </button>
          </div>

          {/* Top Assets Table (Image 1) */}
          <div className="balance-card-desktop-assets">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                Top Assets
              </div>
              <Link
                href="/assets"
                style={{
                  fontSize: "12.5px",
                  color: "#3861fb",
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>View all assets</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            {/* Assets Rows */}
            <div style={{ display: "grid", gap: "2px" }}>
              {holdingsLoading && assetsList.length === 0 ? (
                <div style={{ padding: "18px 10px", color: "rgba(255,255,255,.55)", fontSize: 12 }}>
                  Loading live holdings…
                </div>
              ) : assetsList.map((asset) => (
                <div
                  key={asset.symbol}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 10px",
                    borderRadius: "8px",
                    transition: "background 0.15s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <AssetBrandIcon symbol={asset.symbol} size={28} />
                    <div>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "#ffffff",
                        }}
                      >
                        {asset.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 500,
                          color: "rgba(255, 255, 255, 0.45)",
                        }}
                      >
                        {asset.symbol}{asset.livePrice > 0 ? ` · ${fmtUsdValue(asset.livePrice)}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "#ffffff",
                      }}
                    >
                      {asset.usd}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 400,
                        color: "rgba(255, 255, 255, 0.45)",
                      }}
                    >
                      {asset.amount}
                    </div>
                    {asset.pendingAmount && (
                      <div style={{ fontSize: "10.5px", color: "#f5a524", marginTop: 2 }}>
                        Pending: {asset.pendingAmount}
                      </div>
                    )}
                    {asset.usdNum > 0 && (
                      <div style={{ fontSize: "10.5px", fontWeight: 600, marginTop: 2, color: asset.changePercent >= 0 ? "#01b28b" : "#f84960" }}>
                        {asset.changeUsd >= 0 ? "+" : "−"}{fmtUsdValue(Math.abs(asset.changeUsd))}
                        {" "}({asset.changePercent >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%)
                      </div>
                    )}
                    {asset.realizedTradePnl !== 0 && (
                      <div style={{ fontSize: "10.5px", fontWeight: 700, marginTop: 3, color: asset.realizedTradePnl > 0 ? "#01b28b" : "#f84960" }}>
                        Trade result: {asset.realizedTradePnl > 0 ? "+" : "−"}{fmtUsdValue(Math.abs(asset.realizedTradePnl))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section (Image 1: Positioned below Main Card) */}
        <div
          className="dashboard-desktop-categories-card"
          style={{
            padding: "8px 4px 12px 4px",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            Categories
          </div>

          {/* If no categories yet or balance is 0, display Image 1 exact empty state */}
          {categoriesData.every((c) => c.value === 0) || (currentBalance === 0 && assetsList.every((a) => a.usdNum === 0)) ? (
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.65)",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "4px",
              }}
            >
              <span>No categories yet.</span>
              <button
                type="button"
                onClick={() => openModal("deposit")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#3861fb",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "inherit",
                }}
              >
                Deposit now
              </button>
              <span>to see your portfolio breakdown.</span>
            </div>
          ) : (
            <div>
              {/* Visual allocation bar */}
              <div
                style={{
                  display: "flex",
                  height: "8px",
                  borderRadius: "4px",
                  overflow: "hidden",
                  gap: "2px",
                  marginBottom: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                }}
              >
                {categoriesData.map((cat, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: `${Math.max(cat.pct, cat.value > 0 ? 6 : 0)}%`,
                      backgroundColor: cat.color,
                      transition: "width 0.3s ease",
                    }}
                    title={`${cat.name}: ${cat.pct}%`}
                  />
                ))}
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {categoriesData.map((cat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: cat.color,
                        }}
                      />
                      <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#ffffff" }}>
                        {cat.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff" }}>
                        ${cat.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)", width: "32px", textAlign: "right" }}>
                        {cat.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== MOBILE CARD 2: TABBED CARD (Top Assets | Overview | Categories) ===================== */}
      <div className="dashboard-mobile-tabbed-card">
        <div className="dashboard-mobile-tabs-header">
          <button
            className={`dashboard-mobile-tab-btn ${activeMobileTab === "assets" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("assets")}
          >
            Top assets
          </button>
          <button
            className={`dashboard-mobile-tab-btn ${activeMobileTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("overview")}
          >
            Overview
          </button>
          <button
            className={`dashboard-mobile-tab-btn ${activeMobileTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("categories")}
          >
            Categories
          </button>
        </div>

        {/* TAB 1: Top Assets */}
        {activeMobileTab === "assets" && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                Top assets
              </div>
              <Link
                href="/assets"
                style={{
                  fontSize: "12.5px",
                  color: "#4763f0",
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>View all assets</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            <div style={{ display: "grid", gap: "2px" }}>
              {holdingsLoading && assetsList.length === 0 ? (
                <div style={{ padding: "18px 0", color: "rgba(255,255,255,.55)", fontSize: 12 }}>
                  Loading live holdings…
                </div>
              ) : assetsList.map((asset) => (
                <div
                  key={asset.symbol}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <AssetBrandIcon symbol={asset.symbol} size={28} />
                    <div>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "#fff",
                        }}
                      >
                        {asset.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "rgba(255, 255, 255, 0.45)",
                        }}
                      >
                        {asset.symbol}{asset.livePrice > 0 ? ` · ${fmtUsdValue(asset.livePrice)}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      {asset.usd}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "rgba(255, 255, 255, 0.45)",
                      }}
                    >
                      {asset.amount}
                    </div>
                    {asset.pendingAmount && (
                      <div style={{ fontSize: "10.5px", color: "#f5a524", marginTop: 2 }}>
                        Pending: {asset.pendingAmount}
                      </div>
                    )}
                    {asset.usdNum > 0 && (
                      <div style={{ fontSize: "10.5px", fontWeight: 600, marginTop: 2, color: asset.changePercent >= 0 ? "#01b28b" : "#f84960" }}>
                        {asset.changeUsd >= 0 ? "+" : "−"}{fmtUsdValue(Math.abs(asset.changeUsd))}
                        {" "}({asset.changePercent >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%)
                      </div>
                    )}
                    {asset.realizedTradePnl !== 0 && (
                      <div style={{ fontSize: "10.5px", fontWeight: 700, marginTop: 3, color: asset.realizedTradePnl > 0 ? "#01b28b" : "#f84960" }}>
                        Trade result: {asset.realizedTradePnl > 0 ? "+" : "−"}{fmtUsdValue(Math.abs(asset.realizedTradePnl))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Overview */}
        {activeMobileTab === "overview" && (
          <div>
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: "16px",
              }}
            >
              Account Overview
            </div>
            <div style={{ display: "grid", gap: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  Total deposits
                </span>
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  ${Number(userProfile?.wallet?.totalDeposited ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  Total withdrawals
                </span>
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  ${Number(userProfile?.wallet?.totalWithdrawn ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  Total profits
                </span>
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: totalProfit >= 0 ? "#01b28b" : "#ff3344",
                  }}
                >
                  {totalProfit >= 0
                    ? `+$${totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `-$${Math.abs(totalProfit).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  Verification
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: userProfile?.status === "ACTIVE" ? "#01b28b" : "#ff3344",
                    backgroundColor: userProfile?.status === "ACTIVE" ? "rgba(1, 178, 139, 0.15)" : "rgba(255, 51, 68, 0.15)",
                    padding: "3px 10px",
                    borderRadius: "20px",
                  }}
                >
                  {userProfile?.status === "ACTIVE" ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Categories */}
        {activeMobileTab === "categories" && (
          <div>
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: "12px",
              }}
            >
              Portfolio Categories
            </div>

            {/* Visual allocation bar */}
            <div
              style={{
                display: "flex",
                height: "8px",
                borderRadius: "4px",
                overflow: "hidden",
                gap: "2px",
                marginBottom: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              }}
            >
              {categoriesData.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${Math.max(cat.pct, cat.value > 0 ? 6 : 0)}%`,
                    backgroundColor: cat.color,
                    transition: "width 0.3s ease",
                  }}
                  title={`${cat.name}: ${cat.pct}%`}
                />
              ))}
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              {categoriesData.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: cat.color,
                      }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#ffffff" }}>
                      {cat.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                      ${cat.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.45)", width: "34px", textAlign: "right" }}>
                      {cat.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================== MOBILE CARD 3: TRADING STATS ===================== */}
      <div className="dashboard-mobile-trading-stats">
        {/* Trading progress */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "12.5px",
                color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                fontWeight: 500,
              }}
            >
              Trading progress
            </span>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#fff" }}>
              0%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "5px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#01b28b",
              }}
            />
          </div>
        </div>

        {/* Signal strength (15 red segments) */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "12.5px",
                color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                fontWeight: 500,
              }}
            >
              Signal strength
            </span>
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#ff3344",
              }}
            >
              0%
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(15, 1fr)",
              gap: "4px",
              height: "7px",
            }}
          >
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "100%",
                  borderRadius: "2px",
                  backgroundColor: "#ef4444",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===================== MID SECTION (TradingView Chart + Order Form) ===================== */}
      <div
        id="trade-section"
        style={{
          display: "grid",
          gridTemplateColumns: chartHidden ? "1fr" : "1fr 380px",
          gap: "8px",
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
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              minHeight: "520px",
              height: "560px",
              boxSizing: "border-box",
            }}
          >
            {/* Header row of chart */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                  Trade
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
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
              Trade
            </span>
            <button
              onClick={() => setChartHidden(false)}
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
              <span>Show chart</span>
              <SlidersHorizontal size={13} />
            </button>
          </div>
        )}

        {/* ORDER FORM PANEL */}
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
                padding: "5px 10px",
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
              gap: "6px",
            }}
          >
            <button
              onClick={() => setOrderTab("buy")}
              style={{
                padding: "8px",
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
                padding: "8px",
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
                padding: "8px",
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
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
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
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
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
                    marginBottom: "4px",
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
                    marginBottom: "4px",
                    display: "block",
                    fontWeight: 500,
                  }}
                >
                  Amount:
                </label>
                <div
                  style={{
                    width: "100%",
                    padding: "5px 6px 5px 12px",
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
                      padding: "5px 10px",
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
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
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
                      ? `0 ${currency}`
                      : `$${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`}
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
                    marginBottom: "6px",
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

                <div style={{ position: "relative", width: "100%", padding: "6px 0" }}>
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
                      marginTop: "4px",
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
                    marginBottom: "4px",
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
                  marginTop: "4px",
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
          gap: "14px",
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
                    padding: "12px 14px",
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
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", minWidth: "750px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
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
                              const side = pos.side || pos.type;
                              const baseMark = prices[pos.symbol.toUpperCase()] || pos.entryPrice;
                              let seed = 0;
                              for (let i = 0; i < pos.id.length; i++) seed = (Math.imul(31, seed) + pos.id.charCodeAt(i)) | 0;
                              seed = Math.abs(seed);
                              const sec = Math.floor(now / 1000);
                              const wave = Math.sin((sec + (seed % 50)) * 0.85) * 0.0016 + Math.cos((sec + ((seed >> 2) % 50)) * 1.35) * 0.001;
                              const mark = baseMark * (1 + wave);
                              const diff = side === "BUY" ? mark - pos.entryPrice : pos.entryPrice - mark;
                              const estPnl = (diff / pos.entryPrice) * pos.amount * pos.leverage;
                              const isProfitable = estPnl >= 0;
                              const posMargin = Number(pos.margin ?? (pos.amount / (pos.leverage || 1)));

                              return (
                                <tr key={pos.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <AssetBrandIcon symbol={pos.symbol} size={18} />
                                      <span>{pos.symbol}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                                    <span
                                      style={{
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        backgroundColor: side === "BUY" ? "rgba(1, 178, 139, 0.15)" : "rgba(248, 73, 96, 0.15)",
                                        color: side === "BUY" ? "#01b28b" : "#f84960",
                                      }}
                                    >
                                      {side} {pos.leverage}x
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
                    padding: "12px 14px",
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
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", minWidth: "700px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
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
                                      <span>{pos.symbol}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 14px" }}>
                                    <span
                                      style={{
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        backgroundColor: (pos.side || pos.type) === "BUY" ? "rgba(1, 178, 139, 0.15)" : "rgba(248, 73, 96, 0.15)",
                                        color: (pos.side || pos.type) === "BUY" ? "#01b28b" : "#f84960",
                                      }}
                                    >
                                      {pos.side || pos.type}
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
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "600px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
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
                  padding: "12px 14px",
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
                  padding: "12px 14px",
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
