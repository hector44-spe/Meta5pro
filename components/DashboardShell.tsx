"use client";
import { logout } from "@/lib/logout";
import CustomNotificationBar, { CustomNotificationState } from "@/components/UI/CustomNotificationBar";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  CirclePlus,
  CircleMinus,
  WalletMinimal,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Bell,
  Globe,
  X,
  CreditCard,
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
  Wrench,
  LogOut,
  Key,
  User,
  SquareUser,
  Menu,
  SquarePlus,
  SquareMinus,
} from "lucide-react";
import "@/styles/dashboard.css";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { ProfileSettings, SecuritySettings, AccountSettings, type UserProfile } from "@/components/SettingsForms";
import NotificationsPanel, { type AppNotification } from "@/components/NotificationsPanel";
import AdminSettingsDrawer from "@/components/AdminSettingsDrawer";
import { usePrices } from "@/lib/usePrices";
import { useHoldings } from "@/lib/useHoldings";
import StakeModal from "@/components/StakeModal";
import ConnectWalletDrawer from "@/components/ConnectWalletDrawer";
import CardsDrawer from "@/components/Cards/CardsDrawer";
import ReferralsDrawer from "@/components/ReferralsDrawer";
import LiveChatPanel, { type LiveChatMessage } from "@/components/dashboard-shell/LiveChatPanel";
import {
  ALL_LANGUAGES,
  getCurrentLanguageCode,
  changeLanguage,
  getFlagUrl,
} from "@/lib/languages";

// ===================== CONTEXT DEFINITION =====================
export type ActiveModalType =
  | "deposit"
  | "withdraw"
  | "stake"
  | "settings"
  | "notifications"
  | "verify"
  | "connectWallet"
  | "referrals"
  | "cards"
  | null;

interface DashboardContextType {
  activeModal: ActiveModalType;
  setActiveModal: (modal: ActiveModalType) => void;
  openModal: (modal: ActiveModalType) => void;
  closeModal: () => void;
  accountType: "real" | "demo";
  setAccountType: (type: "real" | "demo") => void;
  hideBalance: boolean;
  setHideBalance: React.Dispatch<React.SetStateAction<boolean>>;
  realBalance: number;
  demoBalance: number;
  currentBalance: number;
  portfolioBalance: number;
  portfolioChangeUsd: number;
  portfolioChangePercent: number;
  refreshBalance: () => void;
  /** Formats a USD amount in the user's display currency (live FX). */
  formatMoney: (usd: number) => string;
  balanceLoaded: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  notifications: AppNotification[];
  unreadCount: number;
  refreshNotifications: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardShell");
  }
  return context;
}

// ===================== DASHBOARD SHELL COMPONENT =====================
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname: string = usePathname() ?? "";
  const router = useRouter();

  // Navigation & Dropdown states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [earnOpen, setEarnOpen] = useState(true);
  const [tradeOpen, setTradeOpen] = useState(true);

  // Balances & Modals state
  const [accountType, setAccountType] = useState<"real" | "demo">("real");
  const [hideBalance, setHideBalance] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [toastNotification, setToastNotification] = useState<CustomNotificationState | null>(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLangCode, setCurrentLangCode] = useState("en");

  useEffect(() => {
    setCurrentLangCode(getCurrentLanguageCode());
    const handleChanged = (e: any) => {
      if (e?.detail) setCurrentLangCode(e.detail);
    };
    window.addEventListener("mg5-lang-changed", handleChanged);
    return () => window.removeEventListener("mg5-lang-changed", handleChanged);
  }, []);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([
    {
      id: "welcome-init",
      sender: "support",
      text: "Hello! Welcome to Meta Gold 5 Live Support. How can we assist your account or trading today?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isChatOpen) return;
    chatMessagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    if (!isChatOpen) return;
    let active = true;
    const loadMessages = async () => {
      try {
        const response = await fetch("/api/support", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;
        if (data.messages && data.messages.length > 0) {
          setChatMessages(data.messages.map((message: { id: string; sender: "support" | "user"; text: string; createdAt: string }) => ({
            id: message.id,
            sender: message.sender,
            text: message.text,
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          })));
        }
      } catch {
        // Keep the current conversation visible during transient network failures.
      }
    };
    loadMessages();
    const timer = window.setInterval(loadMessages, 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isChatOpen]);

  // Modal specific states
  const [copied, setCopied] = useState(false);
  const [settingsSubView, setSettingsSubView] = useState<
    "main" | "payments" | "verification" | "personal" | "security" | "account"
  >("main");
  const [settingsActiveTab, setSettingsActiveTab] = useState<
    "profile" | "security" | "verification" | "preferences"
  >("profile");

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Click outside for user profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const [realBalance, setRealBalance] = useState<number>(0);
  const [userRefCode, setUserRefCode] = useState<string>("vip-trader");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Sync authenticated trader profile to Zoho SalesIQ
  useEffect(() => {
    if (!profile || typeof window === "undefined") return;
    try {
      const visitor = (window as any).$zoho?.salesiq?.visitor;
      if (visitor) {
        if (profile.fullName && typeof visitor.name === "function") visitor.name(profile.fullName);
        if (profile.email && typeof visitor.email === "function") visitor.email(profile.email);
        if (profile.phoneNumber && typeof visitor.contactnumber === "function") visitor.contactnumber(profile.phoneNumber);
        if (typeof visitor.info === "function") {
          visitor.info({
            "Account Balance": `$${realBalance.toFixed(2)}`,
          });
        }
      }
    } catch {
      // ignore
    }
  }, [profile, realBalance]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState("");
  const displayName = profile?.fullName?.trim() || profile?.email?.split("@")[0] || "";
  const initials =
    (displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("") || "").toLowerCase();
  const demoBalance = 10000;
  const currentBalance = accountType === "real" ? realBalance : demoBalance;
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [accountStats, setAccountStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalProfits: 0,
    totalTrades: 0,
  });

  // Display currency (Settings > Account); amounts are converted with live FX rates
  const { prices } = usePrices();
  const { summary: holdingsSummary } = useHoldings();
  // Live portfolio equity: Cash balance plus net asset gain/loss (prevents double counting deposited crypto already credited to cash)
  const assetEquityAdjustment = holdingsSummary.equityAdjustmentUsd ?? ((holdingsSummary.totalUsd || 0) - (holdingsSummary.externalBookUsd || 0));
  const realPortfolioBalance = Math.max(0, realBalance + assetEquityAdjustment);
  const portfolioBalance = accountType === "real" ? realPortfolioBalance : demoBalance;
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const formatMoney = (usd: number) => {
    const code = displayCurrency;
    const usdPerUnit = code === "USD" ? 1 : prices[code];
    const value = usdPerUnit ? usd / usdPerUnit : usd;
    const shownCode = usdPerUnit ? code : "USD";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: shownCode,
        minimumFractionDigits: value === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${shownCode} ${value.toFixed(2)}`;
    }
  };

  // In-app notifications (bell)
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(true);
  const shownTradeResultIdsRef = useRef(new Set<string>());

  const getSeenTradeResultIds = (): Set<string> => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("meta5_seen_trade_result_ids");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const markTradeResultIdSeen = (id: string) => {
    if (typeof window === "undefined") return;
    try {
      const set = getSeenTradeResultIds();
      set.add(id);
      localStorage.setItem("meta5_seen_trade_result_ids", JSON.stringify(Array.from(set).slice(-200)));
    } catch {
      /* ignore */
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const nextNotifications: AppNotification[] = data.notifications || [];
        setNotifications(nextNotifications);
        setUnreadCount(data.unread || 0);

        const seenIds = getSeenTradeResultIds();
        // Only show toast for fresh trade results (created within last 24h) that haven't been shown yet
        const now = Date.now();
        const result = nextNotifications.find((item) => {
          if (item.read) return false;
          if (item.kind !== "trade_profit" && item.kind !== "trade_loss") return false;
          if (shownTradeResultIdsRef.current.has(item.id) || seenIds.has(item.id)) return false;
          const createdTime = new Date(item.createdAt).getTime();
          // Skip if older than 24 hours to avoid stale toasts on login
          return !isNaN(createdTime) && now - createdTime < 24 * 60 * 60 * 1000;
        });

        if (result) {
          shownTradeResultIdsRef.current.add(result.id);
          markTradeResultIdSeen(result.id);

          // Mark as read in the database immediately so it never shows again across logins or devices
          void fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [result.id] }),
          }).catch(() => {});

          // Update local unread state
          setNotifications((prev) =>
            prev.map((n) => (n.id === result.id ? { ...n, read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));

          setToastNotification({
            type: result.kind === "trade_profit" ? "success" : "error",
            message: result.title,
            durationMs: 15_000,
          });
        }
      }
    } catch {
      /* ignore */
    } finally {
      setNotifLoading(false);
    }
  };
  const markAllNotificationsRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      /* ignore */
    }
  };

  const fetchBalance = async () => {
    try {
      const [res, walletRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/wallet", { cache: "no-store" }),
      ]);
      if (res.ok) {
        const data = await res.json();
        if (data.user?.wallet?.mainBalance !== undefined) {
          setRealBalance(Number(data.user.wallet.mainBalance));
        }
        if (data.user?.id) {
          setUserRefCode(data.user.id.slice(0, 8));
          setIsAdmin(data.user.role === "ADMIN");
          setProfile({
            fullName: data.user.fullName ?? null,
            email: data.user.email,
            phoneNumber: data.user.phoneNumber ?? null,
            country: data.user.country ?? null,
          });
        }
      }
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        if (walletData.wallet?.mainBalance !== undefined) {
          setRealBalance(Number(walletData.wallet.mainBalance));
        }
        if (walletData.stats) {
          setAccountStats({
            totalDeposits: Number(walletData.stats.totalDeposits || 0),
            totalWithdrawals: Number(walletData.stats.totalWithdrawals || 0),
            totalProfits: Number(walletData.stats.totalProfits || 0),
            totalTrades: Number(walletData.stats.totalTrades || 0),
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch balance in shell:", e);
    } finally {
      setBalanceLoaded(true);
    }
  };

  useEffect(() => {
    setSiteOrigin(window.location.origin);
    setCurrentLangCode(getCurrentLanguageCode());
    try {
      const saved = localStorage.getItem("mg5_display_currency");
      if (saved) setDisplayCurrency(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Keep balance and notifications fresh (e.g. after an admin approves a deposit or adds funds)
  useEffect(() => {
    fetchNotifications();
    const handleRefresh = () => {
      fetchBalance();
      fetchNotifications();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleRefresh();
      }
    };

    const t = setInterval(handleRefresh, 15_000);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("deposit-submitted", handleRefresh);
    window.addEventListener("balance-changed", handleRefresh);
    window.addEventListener("notifications-updated", handleRefresh);

    return () => {
      clearInterval(t);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("deposit-submitted", handleRefresh);
      window.removeEventListener("balance-changed", handleRefresh);
      window.removeEventListener("notifications-updated", handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBalance();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const action = params.get("action") || params.get("drawer") || params.get("open");
      if (action === "stake") {
        router.push("/stake");
      } else if (action === "deposit") {
        setActiveModal("deposit");
      } else if (action === "withdraw") {
        setActiveModal("withdraw");
      } else if (action === "referrals" || action === "referral") {
        setActiveModal("referrals");
      } else if (action === "cards" || action === "card") {
        setActiveModal("cards");
      } else if (action === "connectWallet") {
        setActiveModal("connectWallet");
      }
    }
  }, [pathname, activeModal]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = {
      sender: "user" as const,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Message could not be sent");
      setChatMessages((prev) => prev.map((message) => message === userMsg ? { ...message, id: data.message?.id } : message));
    } catch (error) {
      setChatMessages((prev) => prev.filter((message) => message !== userMsg));
      setToastNotification({ type: "error", message: error instanceof Error ? error.message : "Message could not be sent" });
    }
  };


  const contextValue: DashboardContextType = {
    activeModal,
    setActiveModal,
    openModal: (modal) => setActiveModal(modal),
    closeModal: () => setActiveModal(null),
    accountType,
    setAccountType,
    hideBalance,
    setHideBalance,
    realBalance,
    demoBalance,
    currentBalance,
    portfolioBalance,
    portfolioChangeUsd: holdingsSummary.totalChangeUsd,
    portfolioChangePercent: holdingsSummary.totalChangePercent,
    refreshBalance: fetchBalance,
    formatMoney,
    balanceLoaded,
    isChatOpen,
    setIsChatOpen,
    notifications,
    unreadCount,
    refreshNotifications: fetchNotifications,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="dashboard-page-container">
        {/* ===================== EXACT METAGOLD MOBILE MENU DRAWER (3x3 grid) ===================== */}
        <div className={`dashboard-mobile-menu-wrapper ${mobileSidebarOpen ? "open" : ""}`}>
          <div className="dashboard-mobile-menu-top">
            <div
              className="dashboard-mobile-menu-user"
              onClick={() => {
                setActiveModal("settings");
                setMobileSidebarOpen(false);
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="user-avatar">{initials}</div>
              <div className="user-meta">
                <p>{displayName}</p>
                <p>Real account</p>
              </div>
            </div>
            <div className="dashboard-mobile-menu-buttons">
              <button
                onClick={() => {
                  setActiveModal("notifications");
                  setMobileSidebarOpen(false);
                }}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>
              <button
                onClick={() => {
                  setActiveModal("settings");
                  setMobileSidebarOpen(false);
                }}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                title="Close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="dashboard-mobile-grid">
            <Link
              href="/dashboard"
              className={`dashboard-mobile-grid-item ${pathname === "/dashboard" ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <House size={22} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/deposit"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/deposit") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <CirclePlus size={22} />
              <span>Deposit</span>
            </Link>
            <Link
              href="/withdraw"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/withdraw") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <CircleMinus size={22} />
              <span>Withdraw</span>
            </Link>
            <Link
              href="/assets"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/assets") || pathname.startsWith("/wallet") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <WalletMinimal size={22} />
              <span>Assets</span>
            </Link>
            <Link
              href="/copy-trading"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/copy-trading") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Users size={22} />
              <span>Copy trading</span>
            </Link>
            <button
              className="dashboard-mobile-grid-item"
              onClick={() => {
                fetchNotifications();
                setActiveModal("notifications");
                setMobileSidebarOpen(false);
              }}
              style={{ position: "relative" }}
            >
              <Bell size={22} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "14px",
                    background: "#4763f0",
                    color: "#ffffff",
                    borderRadius: "10px",
                    padding: "1px 6px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <Link
              href="/cold-storage"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/cold-storage") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Snowflake size={22} color={pathname.startsWith("/cold-storage") ? "#4763f0" : "currentColor"} />
              <span>Cold storage</span>
            </Link>
            <button
              type="button"
              className={`dashboard-mobile-grid-item ${activeModal === "cards" ? "active" : ""}`}
              onClick={() => {
                setMobileSidebarOpen(false);
                setActiveModal("cards");
              }}
            >
              <CreditCard size={22} color={activeModal === "cards" ? "#4763f0" : "currentColor"} />
              <span>Cards</span>
            </button>
            <Link
              href="/subscribe"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/subscribe") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Layers size={22} color={pathname.startsWith("/subscribe") ? "#4763f0" : "currentColor"} />
              <span>Subscribe</span>
            </Link>
            <Link
              href="/signals"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/signals") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Radio size={22} color={pathname.startsWith("/signals") ? "#4763f0" : "currentColor"} />
              <span>Signals</span>
            </Link>
            <button
              className="dashboard-mobile-grid-item"
              onClick={() => {
                setActiveModal("connectWallet");
                setMobileSidebarOpen(false);
              }}
            >
              <Link2 size={22} />
              <span>Connect wallet</span>
            </button>
            <Link
              href="/investing"
              className="dashboard-mobile-grid-item"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <TrendingUp size={22} />
              <span>Investing</span>
            </Link>
            <button
              className="dashboard-mobile-grid-item"
              onClick={() => {
                setActiveModal("settings");
                setMobileSidebarOpen(false);
              }}
            >
              <Settings size={22} />
              <span>Settings</span>
            </button>
            <Link
              href="/mining"
              className="dashboard-mobile-grid-item"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Cpu size={22} />
              <span>Mining</span>
            </Link>
            <Link
              href="/real-estate"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/real-estate") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Building size={22} color={pathname.startsWith("/real-estate") ? "#4763f0" : "currentColor"} />
              <span>Real estate</span>
            </Link>
            <Link
              href="/stake"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/stake") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <PieChart size={22} color={pathname.startsWith("/stake") ? "#4763f0" : "currentColor"} />
              <span>Stake</span>
            </Link>
            <button
              className="dashboard-mobile-grid-item"
              onClick={() => {
                setActiveModal("referrals");
                setMobileSidebarOpen(false);
              }}
            >
              <UserPlus size={22} />
              <span>Referrals</span>
            </button>
            <Link
              href="/trade"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/trade") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <TrendingUp size={22} />
              <span>Trade</span>
            </Link>
            <Link
              href="/markets"
              className={`dashboard-mobile-grid-item ${pathname.startsWith("/markets") ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <CandlestickChart size={22} />
              <span>Markets</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`dashboard-mobile-grid-item ${pathname.startsWith("/admin") ? "active" : ""}`}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Wrench size={22} color={pathname.startsWith("/admin") ? "#4763f0" : "currentColor"} />
                <span>Manage</span>
              </Link>
            )}
          </div>
        </div>

        {/* ===================== PERSISTENT DESKTOP SIDEBAR ===================== */}
        <aside className="dashboard-sidebar-container">
          <div className="dashboard-sidebar-wrapper scrollbar-hide">
            <div className="sidebar_top">
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 8px",
                }}
              >
                <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
                  <img
                    src="/dashboard_files/logo.svg"
                    alt="Meta Gold 5"
                    style={{ width: "28px", height: "auto" }}
                  />
                </Link>
              </div>

              {/* Primary Navigation Links */}
              <div
                style={{
                  marginTop: "24px",
                  display: "grid",
                  gap: "4px",
                }}
              >
                <Link
                  href="/dashboard"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    backgroundColor:
                      pathname === "/dashboard"
                        ? "var(--color-control-active, rgba(255, 255, 255, 0.075))"
                        : "transparent",
                    boxShadow:
                      pathname === "/dashboard"
                        ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
                        : "none",
                    color: pathname === "/dashboard" ? "#ffffff" : "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    fontSize: "13.5px",
                    fontWeight: pathname === "/dashboard" ? 600 : 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <House size={17} strokeWidth={1.75} color={pathname === "/dashboard" ? "#4763f0" : "currentColor"} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/deposit"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    backgroundColor:
                      pathname.startsWith("/deposit")
                        ? "var(--color-control-active, rgba(255, 255, 255, 0.075))"
                        : "transparent",
                    boxShadow:
                      pathname.startsWith("/deposit")
                        ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
                        : "none",
                    color: pathname.startsWith("/deposit") ? "#ffffff" : "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    fontSize: "13.5px",
                    fontWeight: pathname.startsWith("/deposit") ? 600 : 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <CirclePlus size={17} strokeWidth={1.5} color={pathname.startsWith("/deposit") ? "#4763f0" : "currentColor"} />
                  <span>Deposit</span>
                </Link>

                <Link
                  href="/withdraw"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    backgroundColor:
                      pathname.startsWith("/withdraw")
                        ? "var(--color-control-active, rgba(255, 255, 255, 0.075))"
                        : "transparent",
                    boxShadow:
                      pathname.startsWith("/withdraw")
                        ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
                        : "none",
                    color: pathname.startsWith("/withdraw") ? "#ffffff" : "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    fontSize: "13.5px",
                    fontWeight: pathname.startsWith("/withdraw") ? 600 : 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <CircleMinus size={17} strokeWidth={1.5} color={pathname.startsWith("/withdraw") ? "#4763f0" : "currentColor"} />
                  <span>Withdraw</span>
                </Link>

                <Link
                  href="/assets"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    backgroundColor:
                      pathname.startsWith("/assets") || pathname.startsWith("/wallet")
                        ? "var(--color-control-active, rgba(255, 255, 255, 0.075))"
                        : "transparent",
                    boxShadow:
                      pathname.startsWith("/assets") || pathname.startsWith("/wallet")
                        ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
                        : "none",
                    color: pathname.startsWith("/assets") || pathname.startsWith("/wallet") ? "#ffffff" : "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    fontSize: "13.5px",
                    fontWeight: pathname.startsWith("/assets") || pathname.startsWith("/wallet") ? 600 : 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <WalletMinimal size={17} strokeWidth={1.5} color={pathname.startsWith("/assets") || pathname.startsWith("/wallet") ? "#4763f0" : "currentColor"} />
                  <span>Assets</span>
                </Link>

                <button
                  onClick={() => {
                    setSettingsSubView("main");
                    setActiveModal("settings");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    backgroundColor:
                      activeModal === "settings"
                        ? "var(--color-control-active, rgba(255, 255, 255, 0.075))"
                        : "transparent",
                    boxShadow:
                      activeModal === "settings"
                        ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
                        : "none",
                    color:
                      activeModal === "settings"
                        ? "#ffffff"
                        : "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    fontSize: "13.5px",
                    fontWeight: activeModal === "settings" ? 600 : 500,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Settings
                    size={17}
                    strokeWidth={1.5}
                    color={activeModal === "settings" ? "#4763f0" : "currentColor"}
                  />
                  <span>Settings</span>
                </button>

                {/* Notifications Sidebar Button */}
                <button
                  onClick={() => {
                    fetchNotifications();
                    setActiveModal("notifications");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    backgroundColor:
                      activeModal === "notifications"
                        ? "var(--color-control-active, rgba(255, 255, 255, 0.075))"
                        : "transparent",
                    boxShadow:
                      activeModal === "notifications"
                        ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
                        : "none",
                    color:
                      activeModal === "notifications"
                        ? "#ffffff"
                        : "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                    fontSize: "13.5px",
                    fontWeight: activeModal === "notifications" ? 600 : 500,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Bell
                      size={17}
                      strokeWidth={1.5}
                      color={activeModal === "notifications" ? "#4763f0" : "currentColor"}
                    />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: "#4763f0",
                        color: "#ffffff",
                        borderRadius: "10px",
                        padding: "1px 7px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Admin Control Panel Manage Button (Admins Only) */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      backgroundColor:
                        pathname.startsWith("/admin")
                          ? "var(--color-control-active, rgba(255, 255, 255, 0.075))"
                          : "transparent",
                      boxShadow:
                        pathname.startsWith("/admin")
                          ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
                          : "none",
                      color:
                        pathname.startsWith("/admin")
                          ? "#ffffff"
                          : "var(--color-text-secondary, rgba(255, 255, 255, 0.6))",
                      fontSize: "13.5px",
                      fontWeight: pathname.startsWith("/admin") ? 600 : 500,
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Wrench
                      size={17}
                      strokeWidth={1.5}
                      color={pathname.startsWith("/admin") ? "#4763f0" : "currentColor"}
                    />
                    <span>Manage</span>
                  </Link>
                )}
              </div>

              {/* Collapsible: Services */}
              <div style={{ marginTop: "14px" }}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 12px",
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-secondary, rgba(255, 255, 255, 0.5))",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <span>Services</span>
                  <ChevronDown
                    size={15}
                    style={{
                      transition: "transform 0.2s",
                      transform: servicesOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    }}
                  />
                </button>
                {servicesOpen && (
                  <div style={{ display: "grid", gap: "2px", paddingLeft: "8px" }}>
                    <Link
                      href="/cold-storage"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: pathname.startsWith("/cold-storage") ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                        backgroundColor: pathname.startsWith("/cold-storage")
                          ? "var(--color-control-active, rgba(255, 255, 255, 0.075))"
                          : "transparent",
                        fontSize: "12.5px",
                        fontWeight: pathname.startsWith("/cold-storage") ? 600 : 500,
                        textDecoration: "none",
                        borderRadius: "6px",
                      }}
                    >
                      <Snowflake
                        size={15}
                        strokeWidth={1.5}
                        color={pathname.startsWith("/cold-storage") ? "#4763f0" : "currentColor"}
                      />
                      <span>Cold storage</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveModal("cards")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: activeModal === "cards" ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                        backgroundColor: activeModal === "cards" ? "rgba(255, 255, 255, 0.05)" : "transparent",
                        fontSize: "12.5px",
                        borderRadius: "6px",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: activeModal === "cards" ? 600 : 500,
                      }}
                    >
                      <CreditCard size={15} strokeWidth={1.5} color={activeModal === "cards" ? "#4763f0" : "currentColor"} />
                      <span>Cards</span>
                    </button>
                    <Link
                      href="/subscribe"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: pathname.startsWith("/subscribe") ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                        backgroundColor: pathname.startsWith("/subscribe") ? "rgba(255, 255, 255, 0.05)" : "transparent",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: pathname.startsWith("/subscribe") ? 600 : 500,
                      }}
                    >
                      <Layers
                        size={15}
                        strokeWidth={1.5}
                        color={pathname.startsWith("/subscribe") ? "#4763f0" : "currentColor"}
                      />
                      <span>Subscribe</span>
                    </Link>
                    <Link
                      href="/signals"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: pathname.startsWith("/signals") ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                        backgroundColor: pathname.startsWith("/signals") ? "rgba(255, 255, 255, 0.05)" : "transparent",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: pathname.startsWith("/signals") ? 600 : 500,
                      }}
                    >
                      <Radio
                        size={15}
                        strokeWidth={1.5}
                        color={pathname.startsWith("/signals") ? "#4763f0" : "currentColor"}
                      />
                      <span>Signals</span>
                    </Link>
                    <button
                      onClick={() => setActiveModal("connectWallet")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: "rgba(255, 255, 255, 0.65)",
                        fontSize: "12.5px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: "6px",
                      }}
                    >
                      <Link2 size={15} strokeWidth={1.5} />
                      <span>Connect wallet</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Collapsible: Earn */}
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => setEarnOpen(!earnOpen)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 12px",
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-secondary, rgba(255, 255, 255, 0.5))",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <span>Earn</span>
                  <ChevronDown
                    size={15}
                    style={{
                      transition: "transform 0.2s",
                      transform: earnOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    }}
                  />
                </button>
                {earnOpen && (
                  <div style={{ display: "grid", gap: "2px", paddingLeft: "8px" }}>
                    <Link
                      href="/investing"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: "rgba(255, 255, 255, 0.65)",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                      }}
                    >
                      <TrendingUp size={15} strokeWidth={1.5} />
                      <span>Investing</span>
                    </Link>
                    <Link
                      href="/copy-trading"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: "rgba(255, 255, 255, 0.65)",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                      }}
                    >
                      <Users size={15} strokeWidth={1.5} />
                      <span>Copy trading</span>
                    </Link>
                    <Link
                      href="/mining"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: "rgba(255, 255, 255, 0.65)",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                      }}
                    >
                      <Cpu size={15} strokeWidth={1.5} />
                      <span>Mining</span>
                    </Link>
                    <Link
                      href="/real-estate"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: pathname.startsWith("/real-estate") ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                        backgroundColor: pathname.startsWith("/real-estate") ? "rgba(255, 255, 255, 0.05)" : "transparent",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: pathname.startsWith("/real-estate") ? 600 : 500,
                      }}
                    >
                      <Building size={15} strokeWidth={1.5} color={pathname.startsWith("/real-estate") ? "#4763f0" : "currentColor"} />
                      <span>Real estate</span>
                    </Link>
                    <Link
                      href="/stake"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: pathname.startsWith("/stake") ? "#fff" : "rgba(255, 255, 255, 0.65)",
                        backgroundColor: pathname.startsWith("/stake") ? "rgba(71, 99, 240, 0.12)" : "transparent",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: pathname.startsWith("/stake") ? 600 : 500,
                      }}
                    >
                      <PieChart size={15} strokeWidth={1.5} color={pathname.startsWith("/stake") ? "#4763f0" : "currentColor"} />
                      <span>Stake</span>
                    </Link>
                    <button
                      onClick={() => setActiveModal("referrals")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: "rgba(255, 255, 255, 0.65)",
                        fontSize: "12.5px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: "6px",
                      }}
                    >
                      <UserPlus size={15} strokeWidth={1.5} />
                      <span>Referrals</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Collapsible: Trade */}
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => setTradeOpen(!tradeOpen)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 12px",
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-secondary, rgba(255, 255, 255, 0.5))",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <span>Trade</span>
                  <ChevronDown
                    size={15}
                    style={{
                      transition: "transform 0.2s",
                      transform: tradeOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    }}
                  />
                </button>
                {tradeOpen && (
                  <div style={{ display: "grid", gap: "2px", paddingLeft: "8px" }}>
                    <Link
                      href="/markets"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: pathname.startsWith("/markets") ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                        backgroundColor: pathname.startsWith("/markets") ? "rgba(255, 255, 255, 0.08)" : "transparent",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: pathname.startsWith("/markets") ? 600 : 400,
                      }}
                    >
                      <History size={15} strokeWidth={1.5} color={pathname.startsWith("/markets") ? "#4763f0" : "currentColor"} />
                      <span>Markets</span>
                    </Link>
                    <Link
                      href="/trade"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        color: pathname.startsWith("/trade") ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                        backgroundColor: pathname.startsWith("/trade") ? "rgba(255, 255, 255, 0.08)" : "transparent",
                        fontSize: "12.5px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: pathname.startsWith("/trade") ? 600 : 400,
                      }}
                    >
                      <CandlestickChart size={15} strokeWidth={1.5} color={pathname.startsWith("/trade") ? "#4763f0" : "currentColor"} />
                      <span>Trade</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Footer User Card */}
            <div
              onClick={() => setActiveModal("verify")}
              style={{
                marginTop: "16px",
                padding: "8px 10px",
                borderRadius: "10px",
                backgroundColor: "var(--color-input, rgba(255, 255, 255, 0.025))",
                boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "var(--color-primary, #4763f0)",
                  }}
                >
                  {initials}
                </div>
                <img
                  src="/dashboard_files/starter.svg"
                  alt="Starter"
                  style={{
                    width: "13px",
                    height: "13px",
                    borderRadius: "50%",
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    color: "#01b28b",
                    fontWeight: 500,
                    marginTop: "2px",
                  }}
                >
                  <span>Verify your account</span>
                  <ChevronRight size={11} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ===================== RIGHT MAIN WRAPPER ===================== */}
        <div className="dashboard-page-wrapper">
          {/* ===================== PINNED TOP HEADER BAR ===================== */}
          <header
            className="dashboard-header-container"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1000,
              display: "block",
              flex: "0 0 auto",
              visibility: "visible",
              opacity: 1,
            }}
          >
            <div className="dashboard-header-wrapper">
              {/* Breadcrumb / Mobile trigger */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Mobile menu button: shown on mobile/tablet viewports */}
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="dashboard-mobile-menu-trigger"
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                    background: "none",
                    border: "none",
                    padding: "4px",
                    color: "#ffffff",
                  }}
                  title="Open navigation"
                  aria-label="Open navigation"
                >
                  <Menu size={22} color="#ffffff" strokeWidth={2} />
                </button>

                <div
                  className="dashboard-header-title-badge"
                  style={{
                    alignItems: "center",
                    gap: "8px",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  <House size={18} color="rgba(255, 255, 255, 0.85)" strokeWidth={2} />
                  <span>
                    {pathname.startsWith("/cold-storage")
                      ? "Cold storage"
                      : pathname.startsWith("/signals")
                      ? "Signals"
                      : pathname.startsWith("/copy-trading")
                      ? "Copy trading"
                      : pathname.startsWith("/stake") || pathname.startsWith("/staking")
                      ? "Stake"
                      : pathname.startsWith("/mining")
                      ? "Mining"
                      : pathname.startsWith("/subscribe")
                      ? "Subscriptions"
                      : pathname.startsWith("/real-estate")
                      ? "Real estate"
                      : pathname.startsWith("/assets")
                      ? "Assets"
                      : pathname.startsWith("/wallet")
                      ? "Wallet"
                      : pathname.startsWith("/cards")
                      ? "Cards"
                      : "Dashboard"}
                  </span>
                </div>
              </div>

              {/* Right Header Controls */}
              <div
                className="dashboard-header-right tp-header-right"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  position: "relative",
                }}
              >
                {/* Globe Language Picker */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="tp-header-btn"
                    title="Select language"
                    aria-label="Select language"
                  >
                    <Globe size={18} color="#ffffff" />
                  </button>

                  {langDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: "220px",
                        maxHeight: "320px",
                        overflowY: "auto",
                        background: "#18181b",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                        zIndex: 9999,
                        padding: "6px",
                      }}
                    >
                      {ALL_LANGUAGES.map((l) => (
                        <div
                          key={l.code}
                          onClick={() => {
                            changeLanguage(l.code);
                            setCurrentLangCode(l.code);
                            setLangDropdownOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 10px",
                            cursor: "pointer",
                            borderRadius: "5px",
                            background:
                              currentLangCode === l.code
                                ? "rgba(71, 99, 240, 0.25)"
                                : "transparent",
                            color: currentLangCode === l.code ? "#4763f0" : "#fff",
                            fontSize: "12.5px",
                            fontWeight: currentLangCode === l.code ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (currentLangCode !== l.code) {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentLangCode !== l.code) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <img
                            src={getFlagUrl(l.countryCode)}
                            alt={l.code}
                            style={{
                              width: "18px",
                              height: "13px",
                              objectFit: "cover",
                              borderRadius: "2px",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <span
                            style={{
                              textTransform: "uppercase",
                              fontWeight: 600,
                              minWidth: "24px",
                              fontSize: "11px",
                            }}
                          >
                            {l.code.toUpperCase()}
                          </span>
                          <span
                            style={{
                              color: "rgba(255, 255, 255, 0.8)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {l.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Switcher ($0 REAL v) */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="tp-account-pill"
                  >
                    <span className="tp-account-mask">
                      {hideBalance ? "******" : !balanceLoaded ? "…" : formatMoney(portfolioBalance)}{" "}
                    </span>
                    <span
                      style={{
                        color: accountType === "real" ? "#3861fb" : "#01b28b",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {accountType === "real" ? "REAL" : "DEMO"}
                    </span>
                    <ChevronDown size={14} color="#ffffff" />
                  </button>

                  {accountDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        right: 0,
                        width: "190px",
                        background: "#16181d",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "10px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                        zIndex: 100,
                        overflow: "hidden",
                        padding: "6px",
                      }}
                    >
                      <button
                        onClick={() => {
                          setAccountType("real");
                          setAccountDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          background:
                            accountType === "real"
                              ? "rgba(71, 99, 240, 0.15)"
                              : "transparent",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          textAlign: "left",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>Real account</span>
                        <span style={{ color: "#4763f0" }}>{formatMoney(realPortfolioBalance)}</span>
                      </button>
                      <button
                        onClick={() => {
                          setAccountType("demo");
                          setAccountDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          background:
                            accountType === "demo"
                              ? "rgba(1, 178, 139, 0.15)"
                              : "transparent",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          textAlign: "left",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "2px",
                        }}
                      >
                        <span>Demo account</span>
                        <span style={{ color: "#01b28b" }}>$10,000.00</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar with Profile Dropdown (Matches Image 1) */}
                <div style={{ position: "relative" }} ref={profileDropdownRef}>
                  <div
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="tp-avatar-box"
                    title="Account & profile"
                    style={{ cursor: "pointer" }}
                  >
                    {initials}
                    <span className="tp-avatar-diamond" />
                  </div>

                  {profileDropdownOpen && (
                    <div className="user-account-dropdown">
                      {/* Left Column: Account Profile & Stats */}
                      <div className="uad-left">
                        <div className="uad-user-header">
                          <div className="uad-avatar">
                            {initials}
                            <span className="uad-avatar-diamond" />
                          </div>
                          <div className="uad-user-info">
                            <p className="uad-username">{displayName || "user"}</p>
                            <button
                              type="button"
                              className="uad-verify-link"
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                setActiveModal("verify");
                              }}
                            >
                              <span>Verify your account</span>
                              <ChevronRight size={12} strokeWidth={2} />
                            </button>
                          </div>
                        </div>

                        {/* Tier Box */}
                        <div className="uad-tier-box">
                          <span className="uad-tier-title">
                            Starter <span style={{ fontSize: "9px" }}>◆</span>
                          </span>
                          <span className="uad-tier-pct">1%</span>
                          <button
                            type="button"
                            className="uad-upgrade-btn"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              router.push("/subscribe");
                            }}
                          >
                            UPGRADE
                          </button>
                        </div>

                        {/* Account Summary Header */}
                        <div className="uad-summary-title">Account Summary</div>

                        {/* Stats List */}
                        <div className="uad-summary-list">
                          <div className="uad-summary-row">
                            <span>Total Deposits</span>
                            <span>{formatMoney(accountStats.totalDeposits)}</span>
                          </div>
                          <div className="uad-summary-row">
                            <span>Total Withdrawals</span>
                            <span>{formatMoney(accountStats.totalWithdrawals)}</span>
                          </div>
                          <div className="uad-summary-row">
                            <span>Total Profits</span>
                            <span style={{ color: accountStats.totalProfits >= 0 ? "#01b28b" : "#f84960" }}>
                              {formatMoney(accountStats.totalProfits)}
                            </span>
                          </div>
                          <div className="uad-summary-row">
                            <span>Total trades</span>
                            <span>{accountStats.totalTrades.toLocaleString("en-US")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Actions */}
                      <div className="uad-right">
                        <div className="uad-actions-list">
                          <button
                            type="button"
                            className="uad-action-item"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setActiveModal("deposit");
                            }}
                          >
                            <SquarePlus size={16} strokeWidth={1.5} />
                            <span>Add funds</span>
                          </button>

                          <button
                            type="button"
                            className="uad-action-item"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setActiveModal("withdraw");
                            }}
                          >
                            <SquareMinus size={16} strokeWidth={1.5} />
                            <span>Withdraw</span>
                          </button>

                          <button
                            type="button"
                            className="uad-action-item"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setActiveModal("settings");
                            }}
                          >
                            <Settings size={16} strokeWidth={1.5} />
                            <span>Settings</span>
                          </button>

                          <button
                            type="button"
                            className="uad-action-item"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              fetchNotifications();
                              setActiveModal("notifications");
                            }}
                          >
                            <Bell size={16} strokeWidth={1.5} />
                            <span>Notifications</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          className="uad-action-item logout"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            void logout();
                          }}
                        >
                          <LogOut size={16} strokeWidth={1.5} />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* ===================== MAIN CONTENT ===================== */}
          <main className="dashboard-page-content scrollbar-hide">
            {children}
          </main>
        </div>

        {/* ===================== LIVE CHAT DIALOG ===================== */}
        {isChatOpen && (
          <LiveChatPanel
            messages={chatMessages}
            input={chatInput}
            onInputChange={setChatInput}
            onClose={() => setIsChatOpen(false)}
            onSubmit={handleSendChatMessage}
            messagesEndRef={chatMessagesEndRef}
          />
        )}

        {/* ===================== SHARED MODALS & DRAWERS ===================== */}

        {/* Deposit Modal (Images 1-4 Multi-step Crypto Flow) */}
        <DepositModal
          isOpen={activeModal === "deposit"}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null);
            fetchBalance();
            fetchNotifications();
          }}
        />

        {/* Stake & Yield Modal */}
        <StakeModal
          isOpen={activeModal === "stake"}
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />

        {/* Withdraw Modal: method selection -> crypto withdrawal form (emailed confirmation code) */}
        <WithdrawModal
          isOpen={activeModal === "withdraw"}
          onClose={() => setActiveModal(null)}
          onSuccess={() => fetchBalance()}
        />

        {/* Settings Drawer (Matches Image 1 on Mobile & Image 2 on Desktop) */}
        {/* Admin accounts: platform settings instead of the investor settings */}
        {activeModal === "settings" && isAdmin && (
          <AdminSettingsDrawer onClose={() => setActiveModal(null)} onLogout={() => void logout()} />
        )}

        {activeModal === "settings" && !isAdmin && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(6px)",
              display: "flex",
              justifyContent: "flex-end",
              zIndex: 9999,
            }}
            onClick={() => setActiveModal(null)}
          >
            <div
              className="settings-drawer-panel"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Navigation Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 20px 14px 20px",
                }}
              >
                <button
                  onClick={() => {
                    if (settingsSubView !== "main") {
                      setSettingsSubView("main");
                    } else {
                      setActiveModal(null);
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  <ChevronLeft size={19} />
                  <span>{settingsSubView === "main" ? "Settings" : "Back"}</span>
                </button>

                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.5)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Close settings"
                  aria-label="Close settings"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Settings Menu (Image 1 & Image 2) */}
              {settingsSubView === "main" && (
                <div
                  style={{
                    padding: "0 18px 80px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {/* User Profile Card */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: "#11192e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#4763f0",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#ffffff",
                          lineHeight: "1.2",
                        }}
                      >
                        {displayName}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#5c7099",
                          marginTop: "2px",
                        }}
                      >
                        {profile?.email}
                      </div>
                    </div>
                  </div>

                  {/* Payments Card */}
                  <div
                    onClick={() => setSettingsSubView("payments")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "13px 15px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)")
                    }
                  >
                    <CreditCard size={19} color="rgba(255, 255, 255, 0.7)" />
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff" }}>
                        Payments
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "rgba(255, 255, 255, 0.5)",
                          marginTop: "2px",
                        }}
                      >
                        Deposit and withdraw
                      </div>
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.45)",
                      marginTop: "8px",
                      marginBottom: "2px",
                      paddingLeft: "4px",
                    }}
                  >
                    Profile
                  </div>

                  <div
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Verification Row */}
                    <div
                      onClick={() => setSettingsSubView("verification")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "13px 15px",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <UserCheck size={19} color="rgba(255, 255, 255, 0.7)" />
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff" }}>
                          Verification
                        </div>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "rgba(255, 255, 255, 0.5)",
                            marginTop: "2px",
                          }}
                        >
                          Verification and confirmation of identity
                        </div>
                      </div>
                    </div>

                    {/* Personal Row */}
                    <div
                      onClick={() => setSettingsSubView("personal")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "13px 15px",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <User size={19} color="rgba(255, 255, 255, 0.7)" />
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff" }}>
                          Personal
                        </div>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "rgba(255, 255, 255, 0.5)",
                            marginTop: "2px",
                          }}
                        >
                          Your personal information
                        </div>
                      </div>
                    </div>

                    {/* Security Row */}
                    <div
                      onClick={() => setSettingsSubView("security")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "13px 15px",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <Key size={19} color="rgba(255, 255, 255, 0.7)" />
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff" }}>
                          Security
                        </div>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "rgba(255, 255, 255, 0.5)",
                            marginTop: "2px",
                          }}
                        >
                          Email, password and 2FA
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Setup Section */}
                  <div
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.45)",
                      marginTop: "8px",
                      marginBottom: "2px",
                      paddingLeft: "4px",
                    }}
                  >
                    Setup
                  </div>

                  <div
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Account Row */}
                    <div
                      onClick={() => setSettingsSubView("account")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "13px 15px",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <SquareUser size={19} color="rgba(255, 255, 255, 0.7)" />
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff" }}>
                          Account
                        </div>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "rgba(255, 255, 255, 0.5)",
                            marginTop: "2px",
                          }}
                        >
                          Language, currency and account
                        </div>
                      </div>
                    </div>

                    {/* Logout Row */}
                    <div
                      onClick={() => {
                        void logout();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "13px 15px",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <LogOut size={19} color="rgba(255, 255, 255, 0.7)" />
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff" }}>
                          Logout
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subview: Payments */}
              {settingsSubView === "payments" && (
                <div style={{ padding: "0 18px 80px 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                    Payment options
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      onClick={() => {
                        setActiveModal("deposit");
                      }}
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(1, 178, 139, 0.15)",
                        border: "1px solid rgba(1, 178, 139, 0.3)",
                        color: "#01b28b",
                        fontWeight: 600,
                        fontSize: "13.5px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <CirclePlus size={22} />
                      <span>Deposit</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveModal("withdraw");
                      }}
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        fontWeight: 600,
                        fontSize: "13.5px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <CircleMinus size={22} />
                      <span>Withdraw</span>
                    </button>
                  </div>
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                      Accepted methods
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
                      Crypto (BTC, ETH, USDT, SOL), Bank Wire, Cards
                    </div>
                  </div>
                </div>
              )}

              {/* Subview: Verification */}
              {settingsSubView === "verification" && (
                <div style={{ padding: "0 18px 80px 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(1, 178, 139, 0.1)",
                      border: "1px solid rgba(1, 178, 139, 0.25)",
                    }}
                  >
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#01b28b" }}>
                      Identity verification (KYC)
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>
                      Complete verification to unlock higher withdrawal limits and advanced trading features.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveModal("verify");
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: "#4763f0",
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "13.5px",
                    }}
                  >
                    Open document upload form
                  </button>
                </div>
              )}

              {/* Subview: Personal */}
              {settingsSubView === "personal" && (
                <ProfileSettings profile={profile} onSaved={setProfile} />
              )}

              {/* Subview: Security */}
              {settingsSubView === "security" && <SecuritySettings email={profile?.email ?? null} />}

              {/* Subview: Account */}
              {settingsSubView === "account" && (
                <AccountSettings
                  languages={ALL_LANGUAGES}
                  langCode={currentLangCode}
                  onLanguageChange={(code) => {
                    setCurrentLangCode(code);
                    changeLanguage(code);
                  }}
                  currency={displayCurrency}
                  onCurrencyChange={(code) => {
                    setDisplayCurrency(code);
                    try {
                      localStorage.setItem("mg5_display_currency", code);
                    } catch {
                      /* storage unavailable */
                    }
                  }}
                  hideBalance={hideBalance}
                  onToggleHideBalance={() => setHideBalance(!hideBalance)}
                  rateNote={
                    displayCurrency !== "USD" && prices[displayCurrency]
                      ? `1 USD = ${(1 / prices[displayCurrency]).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${displayCurrency}.`
                      : null
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* Notifications Drawer */}
        {activeModal === "notifications" && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
              display: "flex",
              justifyContent: "flex-end",
              zIndex: 9999,
            }}
            onClick={() => setActiveModal(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "460px",
                height: "100%",
                backgroundColor: "#12141a",
                borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  Notifications
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <NotificationsPanel
                items={notifications}
                unread={unreadCount}
                loading={notifLoading}
                onMarkAllRead={markAllNotificationsRead}
              />
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {activeModal === "verify" && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={() => setActiveModal(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "460px",
                backgroundColor: "#16181d",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>
                  Account verification
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div
                style={{
                  fontSize: "12.5px",
                  color: "rgba(255, 255, 255, 0.7)",
                  lineHeight: "1.5",
                }}
              >
                Verify your identity to increase withdrawal limits and unlock all advanced trading features on Meta Gold 5.
              </div>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  color: "#fff",
                }}
              >
                Status:{" "}
                <strong style={{ color: "#ffaa00" }}>
                  Pending verification (tier 1)
                </strong>
              </div>
              <button
                onClick={() => {
                  setToastNotification({
                    type: "info",
                    message: "Verification document upload initiated. Please prepare your government-issued ID.",
                  });
                  setActiveModal(null);
                }}
                style={{
                  padding: "11px",
                  borderRadius: "8px",
                  backgroundColor: "#01b28b",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13.5px",
                  cursor: "pointer",
                }}
              >
                Upload identity documents
              </button>
            </div>
          </div>
        )}

        {/* Connect Wallet Drawer */}
        <ConnectWalletDrawer
          isOpen={activeModal === "connectWallet"}
          onClose={() => setActiveModal(null)}
        />

        {/* Cards Drawer (Slide-over drawer matches Meta Gold design) */}
        <CardsDrawer
          isOpen={activeModal === "cards"}
          onClose={() => setActiveModal(null)}
        />

        {/* Referrals Drawer (Exact Meta Gold Replica) */}
        <ReferralsDrawer
          isOpen={activeModal === "referrals"}
          onClose={() => setActiveModal(null)}
          referralCode={userRefCode}
        />
      </div>

      <CustomNotificationBar
        notification={toastNotification}
        onClose={() => setToastNotification(null)}
      />
    </DashboardContext.Provider>
  );
}
