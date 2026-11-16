"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePrices } from "@/lib/usePrices";
import { useHoldings } from "@/lib/useHoldings";
import assetCatalog from "@/data/assetsData.json";
import Link from "next/link";
import {
  House,
  CirclePlus,
  CircleMinus,
  WalletMinimal,
  Settings,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
  FileText,
  Clock,
  Check,
  Bell,
  Globe,
  SlidersHorizontal,
  X,
  CreditCard,
  UserCheck,
  User,
  Key,
  SquareUser,
  LogOut,
  Snowflake,
  Layers,
  Radio,
  Link2,
  TrendingUp,
  Users,
  Cpu,
  Building,
  PieChart,
  UserPlus,
  CandlestickChart,
  History,
  MessageSquare,
  Copy,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowLeftRight,
  MoreHorizontal,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import "@/styles/dashboard.css";

// Authentic Brand Icons matching Image 4
function AssetBrandIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  if (symbol === "BTC") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ borderRadius: "50%", flexShrink: 0 }}>
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path
          d="M23.05 13.72c.32-2.13-1.3-3.27-3.52-4.04l.72-2.88-1.76-.44-.7 2.81c-.46-.12-.93-.22-1.4-.33l.7-2.83-1.75-.44-.72 2.88c-.38-.08-.76-.17-1.12-.26l.01-.01-2.42-.6-.47 1.87s1.3.3 1.28.32c.71.18.84.65.82 1.02l-.82 3.29c.08.02.18.06.18.06l-.18-.05-1.15 4.6c-.09.22-.31.54-.8.42.02.03-1.28-.32-1.28-.32l-.87 2.01 2.28.57c.43.11.85.22 1.26.32l-.73 2.92 1.76.44.72-2.89c.48.13.94.25 1.4.36l-.72 2.91 1.75.44.73-2.91c2.99.56 5.25.34 6.19-2.37.76-2.18-.04-3.44-1.61-4.26 1.15-.26 2.01-1.02 2.24-2.58zm-4.01 5.63c-.54 2.18-4.21 1-5.4.7l.96-3.86c1.19.3 5.01.88 4.44 3.16zm.54-5.66c-.5 1.98-3.55.98-4.54.73l.87-3.5c.99.24 4.18.7 3.67 2.77z"
          fill="#ffffff"
        />
      </svg>
    );
  }
  if (symbol === "ETH") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ borderRadius: "50%", flexShrink: 0 }}>
        <circle cx="12" cy="12" r="12" fill="#627EEA" />
        <path d="M11.519 3.84v6.316l4.714 2.142-4.714-8.458z" fill="#ffffff" fillOpacity="0.6" />
        <path d="M11.519 3.84L6.804 12.298l4.715-2.142V3.84z" fill="#ffffff" />
        <path d="M11.519 14.449v4.751l4.717-6.643-4.717 1.892z" fill="#ffffff" fillOpacity="0.6" />
        <path d="M11.519 19.2v-4.751l-4.715-1.892L11.519 19.2z" fill="#ffffff" />
        <path d="M11.519 13.689l4.714-2.788-4.714-2.142v4.93z" fill="#ffffff" fillOpacity="0.2" />
        <path d="M6.804 10.901l4.715 2.788V8.759L6.804 10.901z" fill="#ffffff" fillOpacity="0.6" />
      </svg>
    );
  }
  if (symbol === "SOL") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ borderRadius: "50%", flexShrink: 0 }}>
        <defs>
          <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="12" fill="url(#solGrad)" />
        <path d="M7.11 14.63a.43.43 0 0 1 .3-.12h10.38c.19 0 .28.22.15.36l-2.05 2.01a.43.43 0 0 1-.3.12H5.21c-.19 0-.28-.22-.15-.36l2.05-2.01zm0-7.51a.44.44 0 0 1 .3-.12h10.38c.19 0 .28.22.15.35l-2.05 2.02a.43.43 0 0 1-.3.12H5.21c-.19 0-.28-.23-.15-.36l2.05-2.01zm8.78 3.73a.43.43 0 0 0-.3-.12H5.21c-.19 0-.28.22-.15.35l2.05 2.02a.43.43 0 0 0 .3.12h10.38c.19 0 .28-.22.15-.36l-2.05-2.01z" fill="#ffffff" />
      </svg>
    );
  }
  if (symbol === "AAPL") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ borderRadius: "50%", flexShrink: 0 }}>
        <circle cx="12" cy="12" r="12" fill="#1c1c1e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <path
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" transform="translate(4.8 4.8) scale(0.6)"
          fill="#ffffff"
        />
      </svg>
    );
  }
  if (symbol === "GOLD" || symbol === "XAUUSD") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ borderRadius: "50%", flexShrink: 0 }}>
        <circle cx="12" cy="12" r="12" fill="#EAB308" />
        <path d="M7 16h10l-2-8H9L7 16z" fill="#713F12" />
        <path d="M9 8l1.5-3h3L15 8H9z" fill="#FDE047" />
      </svg>
    );
  }
  if (symbol === "EURUSD" || symbol === "GBPUSD" || symbol === "USDJPY" || symbol === "AUDUSD") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ borderRadius: "50%", flexShrink: 0 }}>
        <circle cx="12" cy="12" r="12" fill="#2563EB" />
        <text x="12" y="15" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">FX</text>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ borderRadius: "50%", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="12" fill="#334155" />
      <text x="12" y="15.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
        {(symbol || "A").slice(0, 3).toUpperCase()}
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const {
    openModal,
    hideBalance,
    setHideBalance,
    accountType,
    currentBalance,
    realBalance,
    refreshBalance,
    formatMoney,
    balanceLoaded,
  } = useDashboard();

  interface Position {
    id: string;
    userId: string;
    symbol: string;
    type: "BUY" | "SELL";
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

  const handleClosePosition = async (id: string) => {
    setClosingPositionId(id);
    try {
      const res = await fetch(`/api/trades/positions/${id}/close`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to close position");
      } else {
        await fetchPositions();
        refreshBalance();
      }
    } catch (err) {
      console.error("Close position error:", err);
    } finally {
      setClosingPositionId(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPositions();
  }, []);

  // Timer for countdown ticks
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll positions every 4s if there are open positions to capture admin changes & auto-settlement
  useEffect(() => {
    const hasOpen = positions.some((p) => p.status === "OPEN");
    if (!hasOpen) return;
    const interval = setInterval(() => {
      fetchPositions();
      refreshBalance();
    }, 4000);
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
    wallet?: { mainBalance: number; interestBalance: number };
  } | null>(null);

  const [orderExecuting, setOrderExecuting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  // Live prices (refresh every minute) and the user's real per-coin holdings
  const { prices } = usePrices();
  const { holdings } = useHoldings();
  const btcPrice = prices[(currency || "BTC").toUpperCase()] ?? 0;

  const fmtUsdValue = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtUnitsValue = (n: number, sym: string) =>
    `${n === 0 ? "0.0000" : Number(n.toFixed(8)).toString()} ${sym}`;

  // Held coins first (largest value first), then the usual defaults at zero
  const assetsList = useMemo(() => {
    const catalog = assetCatalog as { name: string; symbol: string; icon: string }[];
    const info = (sym: string) => {
      const c = catalog.find((a) => a.symbol.toUpperCase() === sym);
      return { name: c?.name ?? sym, icon: c?.icon ?? `/dashboard_files/${sym}.svg` };
    };
    const held = holdings
      .filter((h) => h.units > 0 || h.pendingUnits > 0)
      .map((h) => {
        const usd = h.units * (prices[h.symbol] ?? h.price ?? 0);
        return { symbol: h.symbol, ...info(h.symbol), usdNum: usd, usd: fmtUsdValue(usd), amount: fmtUnitsValue(h.units, h.symbol) };
      })
      .sort((a, b) => b.usdNum - a.usdNum);
    const defaults = ["BTC", "ETH", "SOL", "AAPL", "GOOGL"]
      .filter((sym) => !held.some((h) => h.symbol === sym))
      .map((sym) => ({ symbol: sym, ...info(sym), usdNum: 0, usd: fmtUsdValue(0), amount: fmtUnitsValue(0, sym) }));
    return [...held, ...defaults];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdings, prices]);

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

  // AI assistant for TP/SL
  const handleSetWithAi = () => {
    setUseTpSl(true);
    const base = activeAssetPrice || 100;
    if (orderTab === "sell") {
      setStopLoss((base * 1.025).toFixed(base < 10 ? 4 : 2));
      setTakeProfit((base * 0.95).toFixed(base < 10 ? 4 : 2));
    } else {
      setStopLoss((base * 0.975).toFixed(base < 10 ? 4 : 2));
      setTakeProfit((base * 1.05).toFixed(base < 10 ? 4 : 2));
    }
  };

  const handleTradeAction = async () => {
    setOrderFeedback(null);
    const requiredMargin = (parseFloat(amount) || 100) / (leverage || 5);
    if (accountType === "real" && realBalance < requiredMargin) {
      openModal("deposit");
      return;
    }

    setOrderExecuting(true);
    try {
      const res = await fetch("/api/trades/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side: orderTab.toUpperCase(),
          symbol: currency || "BTC",
          amount: parseFloat(amount) || 100,
          leverage: leverage || 5,
          duration: duration || "2 minutes",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order execution failed");
      }
      setOrderFeedback(data.message);
      await fetchPositions();
      refreshBalance();
      setOpenTradesOpen(true);
    } catch (err: unknown) {
      setOrderFeedback(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setOrderExecuting(false);
    }
  };

  return (
    <div className="dashboard-content-grid">
      {/* ===================== UPPER SECTION (MainCard) ===================== */}
      <div
        className="dashboard-upper-grid dashboard-maincard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 440px",
          gap: "8px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* LEFT COLUMN: Balance Card + Categories Card (Image 4) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
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
                <span>Total balance</span>
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
                {hideBalance ? "••••••" : !balanceLoaded ? "…" : formatMoney(currentBalance)}
              </div>
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
              onClick={() => openModal("deposit")}
            >
              <div className="balance-card-mobile-action-icon">
                <Plus size={18} />
              </div>
              <span className="balance-card-mobile-action-label">Deposit</span>
            </button>
            <button
              className="balance-card-mobile-action-btn"
              onClick={() => openModal("withdraw")}
            >
              <div className="balance-card-mobile-action-icon">
                <ArrowUpRight size={18} />
              </div>
              <span className="balance-card-mobile-action-label">Withdraw</span>
            </button>
            <button
              className="balance-card-mobile-action-btn"
              onClick={() => {
                const el = document.getElementById("trade-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="balance-card-mobile-action-icon">
                <TrendingUp size={18} />
              </div>
              <span className="balance-card-mobile-action-label">Trade</span>
            </button>
            <button
              className="balance-card-mobile-action-btn"
              onClick={() => {
                setOrderTab("convert");
                const el = document.getElementById("trade-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="balance-card-mobile-action-icon">
                <ArrowLeftRight size={18} />
              </div>
              <span className="balance-card-mobile-action-label">Convert</span>
            </button>
          </div>

          {/* Desktop Top Assets Table */}
          <div className="balance-card-desktop-assets">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
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

            {/* Assets Rows */}
            <div style={{ display: "grid", gap: "2px" }}>
              {assetsList.slice(0, 4).map((asset) => (
                <div
                  key={asset.symbol}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
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
                      gap: "10px",
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
                        {asset.symbol}
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Categories Card (Image 4: Located below Balance & Top Assets on Left Column) */}
        <div
          className="dashboard-desktop-categories-card"
          style={{
            backgroundColor: "var(--color-card-background, rgba(255, 255, 255, 0.02))",
            borderRadius: "12px",
            padding: "16px 20px",
            boxSizing: "border-box",
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
          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 500,
              color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
              lineHeight: "1.4",
            }}
          >
            No categories yet.{" "}
            <strong
              onClick={() => openModal("deposit")}
              style={{
                color: "var(--color-primary, #4763f0)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Deposit now
            </strong>{" "}
            to see your portfolio breakdown.
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Desktop Trading Progress & Signal Strength (Image 2) */}
      <div
        className="dashboard-desktop-trading-stats-card"
        style={{
          backgroundColor: "var(--color-card-background, rgba(255, 255, 255, 0.02))",
          borderRadius: "12px",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxSizing: "border-box",
          height: "fit-content",
        }}
      >
        {/* Trading progress & Signal strength */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
          {/* Trading progress */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
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
                height: "4px",
                borderRadius: "2px",
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
                marginBottom: "8px",
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
              {assetsList.map((asset) => (
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
                        {asset.symbol}
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
              Overview
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
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  $0
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
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  $0
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
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  $0
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
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ff3344",
                  }}
                >
                  Your account is not verified
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
                marginBottom: "14px",
              }}
            >
              Categories
            </div>
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 500,
                color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                lineHeight: "1.4",
              }}
            >
              No categories yet.{" "}
              <strong
                onClick={() => openModal("deposit")}
                style={{
                  color: "var(--color-primary, #4763f0)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Deposit now
              </strong>{" "}
              to see your portfolio breakdown.
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
                backgroundColor: orderTab === "sell" ? "#ff3344" : "transparent",
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
                backgroundColor: orderTab === "convert" ? "rgba(255, 255, 255, 0.12)" : "transparent",
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
              onClick={() => {
                setIsTradeTypeDropdownOpen(!isTradeTypeDropdownOpen);
                setIsAssetDropdownOpen(false);
                setIsDurationDropdownOpen(false);
              }}
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
                {["Crypto", "Forex", "Stocks", "Commodities"].map((t) => (
                  <div
                    key={t}
                    onClick={() => {
                      setTradeType(t);
                      setIsTradeTypeDropdownOpen(false);
                      const defaults: Record<string, string> = {
                        Crypto: "BTC",
                        Forex: "EURUSD",
                        Stocks: "AAPL",
                        Commodities: "GOLD",
                      };
                      if (defaults[t]) setCurrency(defaults[t]);
                    }}
                    style={{
                      padding: "10px 14px",
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
                onClick={() => {
                  setIsAssetDropdownOpen(!isAssetDropdownOpen);
                  setIsTradeTypeDropdownOpen(false);
                  setIsDurationDropdownOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <AssetBrandIcon symbol={currency} size={15} />
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

            {/* Asset Selection Dropdown */}
            {isAssetDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 0,
                  width: "220px",
                  maxHeight: "260px",
                  overflowY: "auto",
                  backgroundColor: "#16181d",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  zIndex: 40,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                }}
              >
                {(ASSETS_BY_TYPE[tradeType] || ASSETS_BY_TYPE.Crypto).map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      setCurrency(asset.symbol);
                      setIsAssetDropdownOpen(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: currency === asset.symbol ? "#4763f0" : "#fff",
                      fontSize: "12.5px",
                      fontWeight: currency === asset.symbol ? 700 : 500,
                      cursor: "pointer",
                      backgroundColor: currency === asset.symbol ? "rgba(71, 99, 240, 0.12)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (currency !== asset.symbol) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (currency !== asset.symbol) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <AssetBrandIcon symbol={asset.symbol} size={16} />
                      <div>
                        <div>{asset.symbol}</div>
                        <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.45)" }}>{asset.name}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 10 ? 3 : 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* USD Balance & Current BTC Price */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11.5px",
                color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
              }}
            >
              <span>Current USD balance:</span>
              <span style={{ fontWeight: 600, color: "#fff" }}>
                {currentBalance} USD
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
              <span style={{ fontWeight: 600, color: "#01b28b" }}>
                ${activeAssetPrice ? activeAssetPrice.toLocaleString("en-US", { minimumFractionDigits: activeAssetPrice < 10 ? 3 : 2, maximumFractionDigits: activeAssetPrice < 10 ? 4 : 2 }) : "Loading…"}
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

          {/* Duration */}
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
              onClick={() => {
                setIsDurationDropdownOpen(!isDurationDropdownOpen);
                setIsTradeTypeDropdownOpen(false);
                setIsAssetDropdownOpen(false);
              }}
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

          {/* Buy / CTA Button */}
          {orderFeedback && (
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                backgroundColor: orderFeedback.includes("executed")
                  ? "rgba(1, 178, 139, 0.15)"
                  : "rgba(255, 51, 68, 0.15)",
                color: orderFeedback.includes("executed")
                  ? "var(--color-positive)"
                  : "var(--color-negative)",
                textAlign: "center",
              }}
            >
              {orderFeedback}
            </div>
          )}
          <button
            onClick={handleTradeAction}
            disabled={orderExecuting}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor:
                orderTab === "buy"
                  ? "#01b28b"
                  : orderTab === "sell"
                  ? "#ff3344"
                  : "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              opacity: orderExecuting ? 0.7 : 1,
            }}
          >
            {orderExecuting
              ? "Executing..."
              : `${orderTab === "buy" ? "Buy" : orderTab === "sell" ? "Sell" : "Convert"} ${currency} ${accountType === "real" ? "(real)" : "(demo)"}`}
          </button>
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
                backgroundColor: myTradesTab === "all" ? "#4763f0" : "transparent",
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
              onClick={() => setMyTradesTab("swaps")}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                backgroundColor: myTradesTab === "swaps" ? "#4763f0" : "transparent",
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
                backgroundColor: myTradesTab === "auto" ? "#4763f0" : "transparent",
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

        {/* Open Trades Accordion */}
        {(() => {
          const openPositions = positions.filter((p) => p.status === "OPEN");
          const closedPositions = positions.filter((p) => p.status === "CLOSED");

          return (
            <>
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
                    <strong style={{ color: openPositions.length > 0 ? "#4763f0" : "rgba(255, 255, 255, 0.5)" }}>
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
                        <table style={{ width: "100%", minWidth: "820px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                          <thead>
                            <tr style={{ color: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Asset</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Side</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Size (Margin)</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Duration</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Entry price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Mark price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Unrealized PnL</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, textAlign: "right", whiteSpace: "nowrap" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {openPositions.map((p) => {
                              const liveMark = livePrices[p.symbol] || p.entryPrice;
                              const posAmount = Number(p.amount || 0);
                              const posLeverage = Number(p.leverage || 1);
                              const posMargin = Number(p.margin ?? (posAmount / (posLeverage || 1)));

                              const curPnl =
                                p.isCustomPnl && typeof p.customPnl === "number"
                                  ? p.customPnl
                                  : p.type === "BUY"
                                  ? ((liveMark - p.entryPrice) / p.entryPrice) * posAmount
                                  : ((p.entryPrice - liveMark) / p.entryPrice) * posAmount;
                              const roe = posMargin > 0 ? (curPnl / posMargin) * 100 : 0;
                              const isProfit = curPnl >= 0;

                              let timeLeftStr = "";
                              if (p.closeAt) {
                                const diffSec = Math.max(0, Math.floor((new Date(p.closeAt).getTime() - now) / 1000));
                                if (diffSec <= 0) {
                                  timeLeftStr = "Expiring...";
                                } else {
                                  const m = Math.floor(diffSec / 60);
                                  const s = diffSec % 60;
                                  timeLeftStr = `${m}:${s < 10 ? "0" : ""}${s}`;
                                }
                              }

                              return (
                                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <AssetBrandIcon symbol={p.symbol} size={20} />
                                      <span>{p.symbol}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                                    <span
                                      style={{
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        backgroundColor: p.type === "BUY" ? "rgba(1, 178, 139, 0.15)" : "rgba(234, 57, 67, 0.15)",
                                        color: p.type === "BUY" ? "#01b28b" : "#ea3943",
                                      }}
                                    >
                                      {p.type} {posLeverage}x
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", whiteSpace: "nowrap" }}>
                                    ${posAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "11px", display: "block" }}>
                                      Margin: ${posMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", whiteSpace: "nowrap" }}>
                                    <div style={{ fontSize: "12px", fontWeight: 500 }}>{p.duration || "—"}</div>
                                    {timeLeftStr && (
                                      <span
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          fontSize: "10.5px",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          backgroundColor:
                                            timeLeftStr === "Expiring..."
                                              ? "rgba(239, 68, 68, 0.2)"
                                              : "rgba(71, 99, 240, 0.15)",
                                          color: timeLeftStr === "Expiring..." ? "#f87171" : "#7189ff",
                                          fontWeight: 600,
                                          marginTop: "3px",
                                        }}
                                      >
                                        <Clock size={10} />
                                        {timeLeftStr}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                                    ${Number(p.entryPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                                    ${Number(liveMark).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", fontFamily: "monospace", color: isProfit ? "#01b28b" : "#ea3943", fontWeight: 600, whiteSpace: "nowrap" }}>
                                    {isProfit ? "+" : ""}${curPnl.toFixed(2)} ({isProfit ? "+" : ""}{roe.toFixed(2)}%)
                                  </td>
                                  <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                                    <button
                                      onClick={() => handleClosePosition(p.id)}
                                      disabled={closingPositionId === p.id}
                                      style={{
                                        padding: "5px 12px",
                                        borderRadius: "6px",
                                        backgroundColor: "rgba(234, 57, 67, 0.15)",
                                        color: "#ea3943",
                                        border: "1px solid rgba(234, 57, 67, 0.3)",
                                        fontSize: "11.5px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {closingPositionId === p.id ? "Closing..." : "Close"}
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
                    <strong style={{ color: "rgba(255, 255, 255, 0.5)" }}>({closedPositions.length})</strong>
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
                        <table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                          <thead>
                            <tr style={{ color: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Asset</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Side</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Size</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Entry price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>Realized PnL</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, textAlign: "right", whiteSpace: "nowrap" }}>Closed at</th>
                            </tr>
                          </thead>
                          <tbody>
                            {closedPositions.map((p) => {
                              const realizedPnl = Number(p.pnl || 0);
                              const isProfit = realizedPnl >= 0;
                              return (
                                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <AssetBrandIcon symbol={p.symbol} size={20} />
                                      <span>{p.symbol}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                                    <span
                                      style={{
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                                        color: p.type === "BUY" ? "#01b28b" : "#ea3943",
                                      }}
                                    >
                                      {p.type} {p.leverage}x
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", whiteSpace: "nowrap" }}>
                                    ${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                                    ${Number(p.entryPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", fontFamily: "monospace", color: isProfit ? "#01b28b" : "#ea3943", fontWeight: 600, whiteSpace: "nowrap" }}>
                                    {isProfit ? "+" : ""}${realizedPnl.toFixed(2)}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.5)", fontSize: "11px", textAlign: "right", whiteSpace: "nowrap" }}>
                                    {p.closedAt ? new Date(p.closedAt).toLocaleDateString() : "-"}
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
      </div>
    </div>
  );
}
