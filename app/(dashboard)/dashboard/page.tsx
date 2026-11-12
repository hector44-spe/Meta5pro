"use client";

import React, { useState, useEffect, useRef } from "react";
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
          d="M15.44 12.38c.02 2.07 1.82 2.76 1.84 2.77-.02.05-.29 1-.95 1.97-.57.84-1.17 1.67-2.1 1.69-.92.02-1.22-.55-2.28-.55-1.07 0-1.4.53-2.28.57-.9.03-1.58-.9-2.15-1.74-1.18-1.7-2.07-4.8-.87-6.88.6-.1.03 1.57-.6 2.61-.6 1.05 0 1.98.7 2.62.7.63 0 1.76-.88 2.94-.75.49.02 1.88.2 2.77 1.5-.07.05-1.66.97-1.64 2.89zm-1.89-4.88c.49-.6.82-1.42.73-2.25-.71.03-1.56.47-2.06 1.06-.44.51-.83 1.35-.72 2.16.79.06 1.6-.41 2.05-.97z"
          fill="#ffffff"
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ borderRadius: "50%", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="12" fill="#2d3748" />
      <text x="12" y="16" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">G</text>
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
  }

  const livePrices: Record<string, number> = {
    BTC: 86900.0,
    ETH: 2710.0,
    SOL: 188.0,
    XRP: 1.48,
    USDT: 1.0,
    USDC: 1.0,
    AAPL: 228.0,
    NVDA: 135.0,
    TSLA: 320.0,
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

  // Tabs & Controls state
  const [activeMobileTab, setActiveMobileTab] = useState<"assets" | "overview" | "categories">("assets");
  const [moveMoneyOpen, setMoveMoneyOpen] = useState(false);
  const [orderTab, setOrderTab] = useState<"buy" | "sell" | "convert">("buy");
  const [tradeType, setTradeType] = useState("Crypto");
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("BTC");
  const [leverage, setLeverage] = useState(5);
  const [useTpSl, setUseTpSl] = useState(false);
  const [stopLoss, setStopLoss] = useState("73913.647");
  const [takeProfit, setTakeProfit] = useState("73916.647");
  const [duration, setDuration] = useState("2 minutes");
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

  const btcPrice = 73915.147;

  const assetsList = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      icon: "/dashboard_files/BTC.svg",
      usd: "$0.00",
      amount: "0.0000 BTC",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      icon: "/dashboard_files/ETH.svg",
      usd: "$0.00",
      amount: "0.0000 ETH",
    },
    {
      name: "Solana",
      symbol: "SOL",
      icon: "/dashboard_files/SOL.svg",
      usd: "$0.00",
      amount: "0.0000 SOL",
    },
    {
      name: "Apple",
      symbol: "AAPL",
      icon: "/dashboard_files/AAPL.svg",
      usd: "$0.00",
      amount: "0.0000 AAPL",
    },
    {
      name: "Alphabet",
      symbol: "GOOGL",
      icon: "/dashboard_files/GOOGL.svg",
      usd: "$0.00",
      amount: "0.0000 GOOGL",
    },
  ];

  // TradingView Embed Chart reference
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartHidden) return;
    const container = chartContainerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "BINANCE:BTCUSDT",
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      hide_volume: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [chartHidden]);

  // AI assistant for TP/SL
  const handleSetWithAi = () => {
    setUseTpSl(true);
    const sl = (btcPrice * 0.985).toFixed(3);
    const tp = (btcPrice * 1.035).toFixed(3);
    setStopLoss(sl);
    setTakeProfit(tp);
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
                {hideBalance
                  ? "••••••"
                  : currentBalance === 0
                  ? "$0"
                  : `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                href="/crypto"
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
                href="/crypto"
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
              ref={chartContainerRef}
              style={{
                width: "100%",
                height: "calc(100% - 36px)",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              }}
            />
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
          <div>
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
              }}
            >
              <span>{tradeType}</span>
              <ChevronDown size={15} color="rgba(255, 255, 255, 0.5)" />
            </div>
          </div>

          {/* Amount with Currency selector */}
          <div>
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
                <img
                  src="/dashboard_files/BTC.svg"
                  alt="BTC"
                  style={{ width: "15px", height: "15px" }}
                />
                <span>{currency}</span>
                <ChevronDown size={13} />
              </div>
            </div>
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
              <span>Current BTC price:</span>
              <span style={{ fontWeight: 600, color: "#01b28b" }}>
                ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 3 })}
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
                    Stop Loss:
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
                    Take Profit:
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
          <div>
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
              }}
            >
              <span>{duration}</span>
              <ChevronDown size={15} color="rgba(255, 255, 255, 0.5)" />
            </div>
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
              : `${orderTab === "buy" ? "Buy" : orderTab === "sell" ? "Sell" : "Convert"} ${currency} ${accountType === "real" ? "(Real)" : "(Demo)"}`}
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
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                          <thead>
                            <tr style={{ color: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Asset</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Side</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Size (Margin)</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Entry Price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Mark Price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Unrealized PnL</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, textAlign: "right" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {openPositions.map((p) => {
                              const liveMark = livePrices[p.symbol] || p.entryPrice;
                              const curPnl = p.type === "BUY"
                                ? ((liveMark - p.entryPrice) / p.entryPrice) * p.amount
                                : ((p.entryPrice - liveMark) / p.entryPrice) * p.amount;
                              const roe = p.margin > 0 ? (curPnl / p.margin) * 100 : 0;
                              const isProfit = curPnl >= 0;

                              return (
                                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontWeight: 600 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <AssetBrandIcon symbol={p.symbol} size={20} />
                                      <span>{p.symbol}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 14px" }}>
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
                                      {p.type} {p.leverage}x
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff" }}>
                                    ${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "11px", display: "block" }}>
                                      Margin: ${Number(p.margin).toFixed(2)}
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontFamily: "monospace" }}>
                                    ${Number(p.entryPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontFamily: "monospace" }}>
                                    ${Number(liveMark).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", fontFamily: "monospace", color: isProfit ? "#01b28b" : "#ea3943", fontWeight: 600 }}>
                                    {isProfit ? "+" : ""}${curPnl.toFixed(2)} ({isProfit ? "+" : ""}{roe.toFixed(2)}%)
                                  </td>
                                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
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
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                          <thead>
                            <tr style={{ color: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Asset</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Side</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Size</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Entry Price</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500 }}>Realized PnL</th>
                              <th style={{ padding: "10px 14px", fontWeight: 500, textAlign: "right" }}>Closed At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {closedPositions.map((p) => {
                              const realizedPnl = Number(p.pnl || 0);
                              const isProfit = realizedPnl >= 0;
                              return (
                                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontWeight: 600 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <AssetBrandIcon symbol={p.symbol} size={20} />
                                      <span>{p.symbol}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 14px" }}>
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
                                  <td style={{ padding: "12px 14px", color: "#fff" }}>
                                    ${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "#fff", fontFamily: "monospace" }}>
                                    ${Number(p.entryPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "12px 14px", fontFamily: "monospace", color: isProfit ? "#01b28b" : "#ea3943", fontWeight: 600 }}>
                                    {isProfit ? "+" : ""}${realizedPnl.toFixed(2)}
                                  </td>
                                  <td style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.5)", fontSize: "11px", textAlign: "right" }}>
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
