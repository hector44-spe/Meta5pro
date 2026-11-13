"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CirclePlus,
  CircleMinus,
  Globe,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

interface TradingHeaderProps {
  pageType: "deposit" | "withdraw";
  accountType: "real" | "demo";
  onAccountTypeChange: (type: "real" | "demo") => void;
  hideBalance?: boolean;
  onToggleHideBalance?: () => void;
  onOpenMobileMenu: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenLanguage: () => void;
}

export default function TradingHeader({
  pageType,
  accountType,
  onAccountTypeChange,
  hideBalance = true,
  onToggleHideBalance,
  onOpenMobileMenu,
  onOpenSettings,
  onOpenNotifications,
  onOpenLanguage,
}: TradingHeaderProps) {
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  return (
    <header className="tp-header-container">
      <div className="tp-header-inner">
        {/* Left Side: On Desktop (+) Deposit or (-) Withdraw; On Mobile Hamburger with Red 1 Badge */}
        <div className="tp-header-left">
          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            className="tp-mobile-menu-btn"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
          >
            <Menu size={22} strokeWidth={2} />
            <span className="tp-menu-badge">1</span>
          </button>

          {/* Desktop Link / Title: (+) Deposit or (-) Withdraw */}
          <Link
            href="/dashboard"
            className="tp-header-title-link"
            title="Return to dashboard"
          >
            <span className="tp-header-title-icon">
              {pageType === "deposit" ? (
                <CirclePlus size={18} strokeWidth={2} />
              ) : (
                <CircleMinus size={18} strokeWidth={2} />
              )}
            </span>
            <span style={{ fontSize: "15px", fontWeight: 600 }}>
              {pageType === "deposit" ? "Deposit" : "Withdraw"}
            </span>
          </Link>
        </div>

        {/* Right Side: Globe | ****** REAL v | Bell (1) | ub (diamond) */}
        <div className="tp-header-right">
          {/* Globe Language Button */}
          <button
            type="button"
            className="tp-header-btn"
            onClick={onOpenLanguage}
            title="Change language"
          >
            <Globe size={18} strokeWidth={1.8} />
          </button>

          {/* Account Selector Pill */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="tp-account-pill"
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              title="Switch account"
            >
              <span className="tp-account-mask">
                {hideBalance
                  ? "******"
                  : accountType === "real"
                    ? "$0"
                    : "$10,000.00"}
              </span>
              <span
                className={
                  accountType === "real"
                    ? "tp-account-type-real"
                    : "tp-account-type-demo"
                }
              >
                {accountType.toUpperCase()}
              </span>
              <ChevronDown size={14} strokeWidth={2} style={{ color: "#a0a5b8" }} />
            </button>

            {/* Account Switcher Dropdown */}
            {accountDropdownOpen && (
              <div className="tp-dropdown-menu">
                <button
                  type="button"
                  className={`tp-dropdown-item ${accountType === "real" ? "active" : ""}`}
                  onClick={() => {
                    onAccountTypeChange("real");
                    setAccountDropdownOpen(false);
                  }}
                >
                  <span>Real account</span>
                  <span style={{ color: "#3861fb" }}>
                    {hideBalance ? "******" : "$0"}
                  </span>
                </button>
                <button
                  type="button"
                  className={`tp-dropdown-item ${accountType === "demo" ? "active" : ""}`}
                  onClick={() => {
                    onAccountTypeChange("demo");
                    setAccountDropdownOpen(false);
                  }}
                >
                  <span>Demo account</span>
                  <span style={{ color: "#01b28b" }}>
                    {hideBalance ? "******" : "$10,000.00"}
                  </span>
                </button>
                {onToggleHideBalance && (
                  <button
                    type="button"
                    className="tp-dropdown-item"
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      marginTop: "4px",
                      paddingTop: "8px",
                      color: "rgba(255, 255, 255, 0.65)",
                    }}
                    onClick={() => {
                      onToggleHideBalance();
                      setAccountDropdownOpen(false);
                    }}
                  >
                    <span>{hideBalance ? "Show balance" : "Hide balance"}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notifications Bell Button with Red 1 Badge (hidden on narrow mobile matching screenshot) */}
          <button
            type="button"
            className="tp-header-btn tp-desktop-col"
            onClick={onOpenNotifications}
            title="Notifications"
          >
            <Bell size={18} strokeWidth={1.8} />
            <span className="tp-bell-badge">1</span>
          </button>

          {/* User Avatar: ub with cyan diamond */}
          <div
            className="tp-avatar-box"
            onClick={onOpenSettings}
            title="User profile & settings"
          >
            <span>ub</span>
            <span className="tp-avatar-diamond" />
          </div>
        </div>
      </div>
    </header>
  );
}
