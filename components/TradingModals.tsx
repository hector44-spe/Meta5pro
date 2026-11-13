"use client";
import { logout } from "@/lib/logout";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Check,
  Send,
  House,
  CirclePlus,
  CircleMinus,
  WalletMinimal,
  TrendingUp,
  Building,
  Users,
  Cpu,
  Layers,
  Settings,
  LogOut,
  Bell,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";

// Deposits and withdrawals use components/DepositModal.tsx and
// components/WithdrawModal.tsx (opened from the dashboard shell).

// ==========================================
// 3. LIVE SUPPORT CHAT POPUP
// ==========================================
interface LiveChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveChatDialog({ isOpen, onClose }: LiveChatDialogProps) {
  const [messages, setMessages] = useState<Array<{ sender: "agent" | "user"; text: string }>>([
    {
      sender: "agent",
      text: "Hello! Welcome to Meta Gold Support. How can our financial desk assist you today?",
    },
  ]);
  const [inputText, setInputText] = useState("");

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "Thank you for reaching out. An institutional settlement specialist is reviewing your account.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="tp-chat-dialog">
      <div className="tp-chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#01b28b",
            }}
          />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
              Broker live support
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.55)" }}>
              Specialist online
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
        >
          <X size={18} />
        </button>
      </div>

      <div className="tp-chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`tp-chat-msg ${m.sender}`}>
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="tp-chat-input-bar">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="tp-chat-input"
        />
        <button type="submit" className="tp-chat-send-btn">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 4. MOBILE NAVIGATION DRAWER
// ==========================================
interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: "deposit" | "withdraw";
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  currentPage,
}: MobileNavDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="dashboard-mobile-menu-wrapper open"
      style={{ display: "flex", flexDirection: "column", transform: "translateX(0)", opacity: 1, zIndex: 99999 }}
    >
      <div className="dashboard-mobile-menu-top">
        <div className="dashboard-mobile-menu-user">
          <div className="user-avatar">ub</div>
          <div className="user-meta">
            <p>user b</p>
            <p>Real account</p>
          </div>
        </div>
        <div className="dashboard-mobile-menu-buttons">
          <button onClick={onClose} title="Notifications">
            <Bell size={20} />
          </button>
          <button onClick={onClose} title="Settings">
            <Settings size={20} />
          </button>
          <button onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="dashboard-mobile-grid">
        <Link
          href="/dashboard"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <House size={22} />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/deposit"
          className={`dashboard-mobile-grid-item ${currentPage === "deposit" ? "active" : ""}`}
          onClick={onClose}
        >
          <CirclePlus size={22} />
          <span>Deposit</span>
        </Link>
        <Link
          href="/withdraw"
          className={`dashboard-mobile-grid-item ${currentPage === "withdraw" ? "active" : ""}`}
          onClick={onClose}
        >
          <CircleMinus size={22} />
          <span>Withdraw</span>
        </Link>
        <Link
          href="/wallet"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <WalletMinimal size={22} />
          <span>Assets</span>
        </Link>
        <button
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <Settings size={22} />
          <span>Settings</span>
        </button>
        <Link
          href="/cold-storage"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <Layers size={22} />
          <span>Cold storage</span>
        </Link>
        <Link
          href="/cards"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <CreditCard size={22} />
          <span>Cards</span>
        </Link>
        <Link
          href="/subscribe"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <Layers size={22} />
          <span>Subscribe</span>
        </Link>
        <Link
          href="/signals"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <TrendingUp size={22} />
          <span>Signals</span>
        </Link>
        <button
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <WalletMinimal size={22} />
          <span>Connect wallet</span>
        </button>
        <Link
          href="/investing"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <TrendingUp size={22} />
          <span>Investing</span>
        </Link>
        <Link
          href="/copy-trading"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <Users size={22} />
          <span>Copy trading</span>
        </Link>
        <Link
          href="/mining"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <Cpu size={22} />
          <span>Mining</span>
        </Link>
        <Link
          href="/real-estate"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <Building size={22} />
          <span>Real estate</span>
        </Link>
        <Link
          href="/staking"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <Layers size={22} />
          <span>Stake</span>
        </Link>
        <Link
          href="/referrals"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <Users size={22} />
          <span>Referrals</span>
        </Link>
        <Link
          href="/crypto"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <TrendingUp size={22} />
          <span>Trade</span>
        </Link>
        <Link
          href="/markets"
          className="dashboard-mobile-grid-item"
          onClick={onClose}
        >
          <TrendingUp size={22} />
          <span>Markets</span>
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// 5. LANGUAGE SELECTOR MODAL
// ==========================================
interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  if (!isOpen) return null;

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
    { code: "pt", label: "Português" },
    { code: "ru", label: "Русский" },
    { code: "zh", label: "中文" },
    { code: "ja", label: "日本語" },
    { code: "ar", label: "العربية" },
  ];

  return (
    <div className="tp-drawer-backdrop" onClick={onClose}>
      <div
        className="tp-drawer-panel"
        style={{ maxWidth: "380px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tp-drawer-header">
          <h2 className="tp-drawer-title">Select language</h2>
          <button type="button" className="tp-drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px" }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor:
                  lang.code === "en" ? "rgba(56, 97, 251, 0.15)" : "rgba(255, 255, 255, 0.03)",
                color: lang.code === "en" ? "#3861fb" : "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span>{lang.label}</span>
              {lang.code === "en" && <Check size={16} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. NOTIFICATIONS DRAWER
// ==========================================
interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="tp-drawer-backdrop" onClick={onClose}>
      <div className="tp-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tp-drawer-header">
          <h2 className="tp-drawer-title">Notifications</h2>
          <button type="button" className="tp-drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              padding: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                Welcome to institutional trading
              </span>
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>Just now</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", margin: 0 }}>
              Your account has been configured with tier-1 liquidity access and zero-latency execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. SETTINGS / PROFILE DRAWER
// ==========================================
interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="tp-drawer-backdrop" onClick={onClose}>
      <div className="tp-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tp-drawer-header">
          <h2 className="tp-drawer-title">Account settings</h2>
          <button type="button" className="tp-drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: "10px",
            }}
          >
            <div className="tp-avatar-box" style={{ width: "48px", height: "48px", fontSize: "16px" }}>
              ub
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>user b</div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.55)" }}>userb@broker.io</div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "4px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#01b28b",
                  backgroundColor: "rgba(1, 178, 139, 0.12)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                Verified trader
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link
              href="/dashboard"
              onClick={onClose}
              style={{
                padding: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderRadius: "8px",
                color: "#fff",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Trading dashboard</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/wallet"
              onClick={onClose}
              style={{
                padding: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderRadius: "8px",
                color: "#fff",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Custodial wallet hub</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                void logout();
              }}
              style={{
                padding: "12px",
                backgroundColor: "rgba(255, 51, 68, 0.1)",
                borderRadius: "8px",
                color: "#ff3344",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
              }}
            >
              <span>Sign out</span>
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
