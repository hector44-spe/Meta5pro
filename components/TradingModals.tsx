"use client";

import React, { useState } from "react";
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

  if (!isOpen) return null;

  const depositAddresses: Record<string, string> = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x71C6944e5B889498b31B5c26b65389Da205f14E7",
    USDT_TRC20: "TJY6ZpB8E7WcEKnLq3h74V75tKjM9zD5eR",
    USDT_BEP20: "0x71C6944e5B889498b31B5c26b65389Da205f14E7",
    SOL: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkkD88V5K1kGqXz999",
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(depositAddresses[selectedAsset]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const ref = "DP" + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString("default", { month: "short" })}, ${now.getFullYear()}`;

    const newDep: DepositRecord = {
      date: dateFormatted,
      reference: ref,
      method: selectedAsset.replace("_", " "),
      type: "Regular",
      amount: `${amount} ${selectedAsset.split("_")[0]}`,
      totalUSD: `$${(parseFloat(amount) * (selectedAsset.startsWith("USDT") ? 1 : selectedAsset === "BTC" ? 73915 : 2650)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: "pending",
    };

    onDepositSuccess(newDep);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="tp-drawer-backdrop" onClick={onClose}>
      <div className="tp-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tp-drawer-header">
          <h2 className="tp-drawer-title">Deposit Funds</h2>
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
              Deposit Proof Submitted!
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
                Select Deposit Asset:
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
                {depositAddresses[selectedAsset]}
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
                <span>{copied ? "Copied Address" : "Copy Address"}</span>
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
                Deposit Amount:
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
                Transaction Hash / TxID:
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

            {/* Submit Button */}
            <button
              type="submit"
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
  const [selectedMethod, setSelectedMethod] = useState<"Crypto" | "Bank Transfer">("Crypto");
  const [cryptoAsset, setCryptoAsset] = useState<"USDT" | "BTC" | "ETH">("USDT");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const currentBalance = accountType === "real" ? 0 : 10000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Please enter a valid amount.");
      return;
    }

    if (numAmount > currentBalance && accountType === "real") {
      setErrorMsg("Insufficient funds in your Real Account balance ($0). Please deposit first or switch to Demo Account.");
      return;
    }

    setErrorMsg("");
    const ref = "WD" + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString("default", { month: "short" })}, ${now.getFullYear()}`;

    const newWd: WithdrawalRecord = {
      date: dateFormatted,
      reference: ref,
      method: selectedMethod === "Crypto" ? cryptoAsset : "Bank Wire",
      type: "Standard",
      amount: selectedMethod === "Crypto" ? `${amount} ${cryptoAsset}` : `$${amount}`,
      totalUSD: `$${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: "pending",
    };

    onWithdrawSuccess(newWd);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="tp-drawer-backdrop" onClick={onClose}>
      <div className="tp-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tp-drawer-header">
          <h2 className="tp-drawer-title">Withdraw Funds</h2>
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
              Withdrawal Request Submitted!
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
                  Available Balance ({accountType.toUpperCase()})
                </span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: accountType === "real" ? "#3861fb" : "#01b28b" }}>
                  ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Method Tabs */}
            <div>
              <label style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", display: "block", marginBottom: "8px" }}>
                Withdrawal Channel:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {(["Crypto", "Bank Transfer"] as const).map((method) => (
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
                {selectedMethod === "Crypto" ? "Recipient Wallet Address:" : "Bank Account / IBAN details:"}
              </label>
              <input
                required
                type="text"
                placeholder={selectedMethod === "Crypto" ? "Enter destination address..." : "Bank name, IBAN / SWIFT, Account holder"}
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
                  Withdrawal Amount:
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
              Request Withdrawal
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
              Broker Live Support
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.55)" }}>
              Specialist Online
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
            <p>Real Account</p>
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
          <span>Cold Storage</span>
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
          <span>Real Estate</span>
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
          <h2 className="tp-drawer-title">Select Language</h2>
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
                Welcome to Institutional Trading
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
          <h2 className="tp-drawer-title">Account Settings</h2>
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
                Verified Trader
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
              <span>Trading Dashboard</span>
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
              <span>Custodial Wallet Hub</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/login"
              onClick={onClose}
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
              <span>Sign Out</span>
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
