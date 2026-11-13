"use client";
import { logout } from "@/lib/logout";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Copy,
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
  HelpCircle,
  Settings,
  LogOut,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";

// ==========================================
// 1. DEPOSIT DRAWER
// ==========================================
export interface DepositRecord {
  date: string;
  reference: string;
  method: string;
  type: string;
  amount: string;
  totalUSD: string;
  status: "approved" | "pending" | "declined";
}

// Drawer asset key -> [symbol, network] as stored in deposit_addresses
const DEPOSIT_ASSETS = [
  ["BTC", "BTC", "Bitcoin"],
  ["ETH", "ETH", "ERC-20"],
  ["USDT_TRC20", "USDT", "TRC-20"],
  ["USDT_BEP20", "USDT", "BEP-20"],
  ["SOL", "SOL", "Solana"],
] as const;

// Indicative USD rates used to value a crypto deposit; the admin confirms the real amount on approval.
const USD_RATES: Record<string, number> = { BTC: 86450, ETH: 2680, SOL: 185, USDT: 1 };

interface DepositDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (deposit: DepositRecord) => void;
}

export function DepositDrawer({
  isOpen,
  onClose,
  onDepositSuccess,
}: DepositDrawerProps) {
  const [selectedAsset, setSelectedAsset] = useState<
    "BTC" | "ETH" | "USDT_TRC20" | "USDT_BEP20" | "SOL"
  >("USDT_TRC20");
  const [amount, setAmount] = useState("");
  const [txId, setTxId] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>({});

  // Deposit addresses come from the admin-managed settings, not hard-coded values.
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/settings/addresses")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        for (const [key, sym, net] of DEPOSIT_ASSETS) {
          const hit = (data.addresses || []).find(
            (a: { symbol: string; network: string; address: string }) =>
              a.symbol === sym && a.network === net,
          );
          if (hit) map[key] = hit.address;
        }
        setDepositAddresses(map);
      })
      .catch(() => setDepositError("Could not load deposit addresses. Please try again."));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(depositAddresses[selectedAsset]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const units = parseFloat(amount);
    if (!units || units <= 0) {
      setDepositError("Please enter a valid amount.");
      return;
    }
    if (!txId.trim()) {
      setDepositError("Please paste the transaction hash (TxID) from your wallet.");
      return;
    }

    const [, symbol, network] = DEPOSIT_ASSETS.find(([key]) => key === selectedAsset)!;
    const usdValue = Math.round(units * (USD_RATES[symbol] ?? 1) * 100) / 100;

    setIsSubmitting(true);
    setDepositError("");
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: usdValue,
          currency: symbol,
          network,
          txHash: txId.trim(),
          cryptoAddress: depositAddresses[selectedAsset],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDepositError(data.error || "Deposit submission failed.");
        return;
      }

      const created = new Date(data.transaction.createdAt);
      onDepositSuccess({
        date: `${created.getDate()} ${created.toLocaleString("default", { month: "short" })}, ${created.getFullYear()}`,
        reference: data.transaction.id.slice(0, 8).toUpperCase(),
        method: `${symbol} ${network}`,
        type: "Regular",
        amount: `${units} ${symbol}`,
        totalUSD: `$${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: "pending",
      });
      setIsSubmitted(true);
      setAmount("");
      setTxId("");
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1500);
    } catch {
      setDepositError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tp-drawer-backdrop" onClick={onClose}>
      <div className="tp-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tp-drawer-header">
          <h2 className="tp-drawer-title">Deposit funds</h2>
          <button type="button" className="tp-drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {isSubmitted ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <CheckCircle2 size={54} color="#01b28b" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
              Deposit proof submitted!
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
              Your deposit reference has been recorded and will reflect in your account upon blockchain confirmation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Select Asset */}
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.6)",
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Select deposit asset:
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                {[
                  { key: "BTC", label: "BTC" },
                  { key: "ETH", label: "ETH" },
                  { key: "USDT_TRC20", label: "USDT (TRC)" },
                  { key: "USDT_BEP20", label: "USDT (BSC)" },
                  { key: "SOL", label: "SOL" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedAsset(item.key as any)}
                    style={{
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border:
                        selectedAsset === item.key
                          ? "1px solid #3861fb"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      backgroundColor:
                        selectedAsset === item.key
                          ? "rgba(56, 97, 251, 0.15)"
                          : "rgba(255, 255, 255, 0.04)",
                      color: selectedAsset === item.key ? "#fff" : "rgba(255, 255, 255, 0.8)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Box */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.55)",
                  marginBottom: "12px",
                }}
              >
                Deposit address ({selectedAsset.replace("_", " ")} Network):
              </div>

              {/* Monospace Address */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  color: "#38bdf8",
                  marginBottom: "12px",
                }}
              >
                {depositAddresses[selectedAsset] ?? "Loading address..."}
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: copied ? "#01b28b" : "#3861fb",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? "Copied address" : "Copy address"}</span>
              </button>
            </div>

            {/* Amount Field */}
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.6)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Deposit amount:
              </label>
              <input
                required
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {/* Transaction Hash */}
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.6)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Transaction hash / TxID:
              </label>
              <input
                type="text"
                placeholder="Paste blockchain transaction hash..."
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {depositError && (
              <div role="alert" style={{ color: "#ff3344", fontSize: "13px" }}>
                {depositError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !depositAddresses[selectedAsset]}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "#3861fb",
                color: "#ffffff",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                boxShadow: "0 4px 14px rgba(56, 97, 251, 0.3)",
              }}
            >
              Confirm &amp; Submit Deposit Proof
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. WITHDRAW DRAWER
// ==========================================
export interface WithdrawalRecord {
  date: string;
  reference: string;
  method: string;
  type: string;
  amount: string;
  totalUSD: string;
  status: "approved" | "pending" | "declined";
}

interface WithdrawDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawSuccess: (withdrawal: WithdrawalRecord) => void;
  accountType?: "real" | "demo";
}

export function WithdrawDrawer({
  isOpen,
  onClose,
  onWithdrawSuccess,
  accountType = "real",
}: WithdrawDrawerProps) {
  const [selectedMethod, setSelectedMethod] = useState<"Crypto" | "Bank transfer">("Crypto");
  const [cryptoAsset, setCryptoAsset] = useState<"USDT" | "BTC" | "ETH">("USDT");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realBalance, setRealBalance] = useState(0);

  // Real balance comes from the server wallet.
  useEffect(() => {
    if (!isOpen || accountType !== "real") return;
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((data) => setRealBalance(Number(data.wallet?.mainBalance ?? 0)))
      .catch(() => setErrorMsg("Could not load your balance. Please try again."));
  }, [isOpen, accountType]);

  if (!isOpen) return null;

  const currentBalance = accountType === "real" ? realBalance : 10000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Please enter a valid amount.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg(selectedMethod === "Crypto" ? "Please enter the destination address." : "Please enter your bank details.");
      return;
    }
    if (accountType !== "real") {
      setErrorMsg("Withdrawals are only available from your real account.");
      return;
    }
    if (numAmount > currentBalance) {
      setErrorMsg(`Insufficient funds. Available: $${currentBalance.toFixed(2)}.`);
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      // The server re-checks the balance and holds the funds atomically.
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          currency: selectedMethod === "Crypto" ? cryptoAsset : "USD (bank wire)",
          cryptoAddress: address.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Withdrawal failed.");
        return;
      }

      const created = new Date(data.transaction.createdAt);
      onWithdrawSuccess({
        date: `${created.getDate()} ${created.toLocaleString("default", { month: "short" })}, ${created.getFullYear()}`,
        reference: data.transaction.id.slice(0, 8).toUpperCase(),
        method: selectedMethod === "Crypto" ? cryptoAsset : "Bank wire",
        type: "Standard",
        amount: selectedMethod === "Crypto" ? `${amount} ${cryptoAsset}` : `$${amount}`,
        totalUSD: `$${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: "pending",
      });
      setRealBalance(Number(data.newBalance ?? currentBalance - numAmount));
      setIsSubmitted(true);
      setAmount("");
      setAddress("");
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1500);
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tp-drawer-backdrop" onClick={onClose}>
      <div className="tp-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tp-drawer-header">
          <h2 className="tp-drawer-title">Withdraw funds</h2>
          <button type="button" className="tp-drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {isSubmitted ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <CheckCircle2 size={54} color="#01b28b" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
              Withdrawal request submitted!
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
              Your withdrawal has been queued for automated forensic compliance verification. Funds will be disbursed shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Balance Card */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", display: "block" }}>
                  Available balance ({accountType.toUpperCase()})
                </span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: accountType === "real" ? "#3861fb" : "#01b28b" }}>
                  ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Method Tabs */}
            <div>
              <label style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", display: "block", marginBottom: "8px" }}>
                Withdrawal channel:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {(["Crypto", "Bank transfer"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border:
                        selectedMethod === method
                          ? "1px solid #3861fb"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      backgroundColor:
                        selectedMethod === method
                          ? "rgba(56, 97, 251, 0.15)"
                          : "rgba(255, 255, 255, 0.04)",
                      color: selectedMethod === method ? "#fff" : "rgba(255, 255, 255, 0.8)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Address / Account */}
            <div>
              <label style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", display: "block", marginBottom: "6px" }}>
                {selectedMethod === "Crypto" ? "Recipient wallet address:" : "Bank account / IBAN details:"}
              </label>
              <input
                required
                type="text"
                placeholder={selectedMethod === "Crypto" ? "Enter destination address..." : "Bank name, IBAN / SWIFT, account holder"}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {/* Amount */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                  Withdrawal amount:
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance.toString())}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3861fb",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  MAX
                </button>
              </div>
              <input
                required
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 51, 68, 0.12)",
                  border: "1px solid rgba(255, 51, 68, 0.3)",
                  color: "#ff3344",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Fee Note */}
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.45)",
                lineHeight: 1.5,
              }}
            >
              Network verification fee: $0.00 (Waived for institutional traders). Processing turnaround: 10 - 30 minutes.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "#3861fb",
                color: "#ffffff",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                boxShadow: "0 4px 14px rgba(56, 97, 251, 0.3)",
              }}
            >
              Request withdrawal
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

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
