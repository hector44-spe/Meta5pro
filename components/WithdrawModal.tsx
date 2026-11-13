"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronDown, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import "@/styles/deposit-modal.css";
import "@/styles/app-forms.css";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Indicative USD prices used to show coin amounts; the admin settles the real amount.
const TOKEN_PRICES: Record<string, number> = {
  BTC: 86450,
  ETH: 2680,
  USDT: 1.0,
  USDC: 1.0,
  SOL: 185,
  XRP: 1.45,
};

const TOKENS = [
  { name: "Bitcoin", symbol: "BTC", networks: ["Bitcoin"] },
  { name: "Ethereum", symbol: "ETH", networks: ["ERC-20"] },
  { name: "Tether", symbol: "USDT", networks: ["TRC-20", "BEP-20", "ERC-20"] },
  { name: "USD Coin", symbol: "USDC", networks: ["ERC-20", "BEP-20", "Solana"] },
  { name: "Solana", symbol: "SOL", networks: ["Solana"] },
  { name: "Ripple", symbol: "XRP", networks: ["XRP"] },
];

const MIN_WITHDRAWAL = 10;
const MAX_WITHDRAWAL = 1_000_000;

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtUnits = (n: number) => n.toFixed(8);

export default function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const [step, setStep] = useState<"METHOD" | "FORM" | "SUCCESS">("METHOD");

  const [balanceUsd, setBalanceUsd] = useState(0);
  const [token, setToken] = useState<(typeof TOKENS)[number] | null>(null);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");

  const [codeStatus, setCodeStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [codeMessage, setCodeMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset and load the real balance each time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setStep("METHOD");
    setToken(null);
    setTokenOpen(false);
    setShowNetwork(false);
    setNetwork("");
    setAddress("");
    setAmount("");
    setCode("");
    setCodeStatus("idle");
    setCodeMessage("");
    setError("");
    fetch("/api/wallet")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setBalanceUsd(Number(d?.wallet?.mainBalance ?? 0)))
      .catch(() => setBalanceUsd(0));
  }, [isOpen]);

  const price = token ? TOKEN_PRICES[token.symbol] ?? 1 : 1;
  const units = parseFloat(amount) || 0;
  const totalUsd = Math.round(units * price * 100) / 100;
  const availableUnits = useMemo(() => balanceUsd / price, [balanceUsd, price]);

  if (!isOpen) return null;

  const requestCode = async () => {
    setError("");
    setCodeStatus("sending");
    try {
      const res = await fetch("/api/wallet/withdraw/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalUsd || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setCodeStatus("sent");
      setCodeMessage(data.message);
    } catch (e) {
      setCodeStatus("idle");
      setError(e instanceof Error ? e.message : "Could not send code");
    }
  };

  const validate = (): string | null => {
    if (!token) return "Select the asset to withdraw.";
    if (address.trim().length < 10) return "Enter a valid destination address.";
    if (!units || units <= 0) return "Enter an amount.";
    if (totalUsd < MIN_WITHDRAWAL) return `Minimum withdrawal is ${fmtUsd(MIN_WITHDRAWAL)}.`;
    if (totalUsd > MAX_WITHDRAWAL) return `Maximum withdrawal is ${fmtUsd(MAX_WITHDRAWAL)}.`;
    if (totalUsd > balanceUsd) return `Insufficient balance. Available: ${fmtUsd(balanceUsd)}.`;
    if (!/^\d{6}$/.test(code.trim())) return "Enter the 6-digit withdrawal code sent to your email.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const chosenNetwork = network || token!.networks[0];
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalUsd,
          currency: `${fmtUnits(units)} ${token!.symbol} (${chosenNetwork})`,
          cryptoAddress: address.trim(),
          code: code.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");
      setStep("SUCCESS");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="dm-backdrop" onClick={onClose}>
      <div className="dm-card" onClick={(e) => e.stopPropagation()}>
        {/* STEP 1: method selection */}
        {step === "METHOD" && (
          <div>
            <div className="dm-header">
              <h2 className="dm-title">Select withdrawal method</h2>
              <button type="button" className="dm-close-btn" onClick={onClose} aria-label="Close">
                <X size={19} />
              </button>
            </div>
            <p className="dm-subtitle">
              To make a withdrawal, choose your preferred method, and click on the continue button.
            </p>

            <div className="dm-section-label">Available methods</div>
            <div className="dm-option-card selected">
              <span>Crypto</span>
            </div>

            <div className="dm-limits-box">
              <div className="dm-limit-row">
                <span className="dm-limit-label">Minimum withdrawal</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">{fmtUsd(MIN_WITHDRAWAL).replace(".00", "")}</span>
              </div>
              <div className="dm-limit-row">
                <span className="dm-limit-label">Maximum withdrawal</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">{fmtUsd(MAX_WITHDRAWAL).replace(".00", "")}</span>
              </div>
            </div>

            <button type="button" className="dm-primary-btn" onClick={() => setStep("FORM")}>
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: crypto withdrawal form */}
        {step === "FORM" && (
          <form onSubmit={handleSubmit}>
            <div className="dm-header">
              <div className="dm-header-left">
                <button type="button" className="dm-back-btn" onClick={() => setStep("METHOD")} aria-label="Back">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="dm-title">Crypto withdrawal</h2>
              </div>
              <button type="button" className="dm-close-btn" onClick={onClose} aria-label="Close">
                <X size={19} />
              </button>
            </div>
            <p className="dm-subtitle">
              To proceed, select your token, enter your address, amount and click on the button below
            </p>

            {/* Asset */}
            <div className="dm-form-group" style={{ position: "relative" }}>
              <label className="dm-field-label app-label">Asset:</label>
              <div
                className={`dm-select-trigger ${token ? "selected" : ""}`}
                onClick={() => setTokenOpen(!tokenOpen)}
                role="button"
                tabIndex={0}
              >
                <span style={{ color: token ? "#fff" : "rgba(255, 255, 255, 0.85)", fontWeight: 600 }}>
                  {token ? `${token.name} (${token.symbol})` : "Select asset"}
                </span>
                <ChevronDown size={16} color="rgba(255, 255, 255, 0.6)" />
              </div>
              {tokenOpen && (
                <div className="dm-dropdown-menu">
                  {TOKENS.map((t) => (
                    <div
                      key={t.symbol}
                      className="dm-dropdown-item"
                      onClick={() => {
                        setToken(t);
                        setNetwork(t.networks[0]);
                        setTokenOpen(false);
                      }}
                    >
                      {t.name} ({t.symbol})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="dm-form-group">
              <label className="dm-field-label app-label">Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your crypto address"
                autoComplete="off"
                spellCheck={false}
                className="app-input"
              />
              <button
                type="button"
                onClick={() => setShowNetwork(!showNetwork)}
                className="app-link-btn"
              >
                Has network?
              </button>
              {showNetwork && (
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  disabled={!token}
                  className="app-input" style={{ marginTop: "6px" }}
                >
                  {!token && <option value="">Select an asset first</option>}
                  {token?.networks.map((n) => (
                    <option key={n} value={n} style={{ color: "#000" }}>
                      {n}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount */}
            <div className="dm-form-group">
              <label className="dm-field-label app-label">Amount:</label>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="app-input"
              />
              <div className="dm-limit-row" style={{ marginTop: "8px" }}>
                <span className="dm-limit-label">Available balance</span>
                <span className="dm-limit-dots"></span>
                <button
                  type="button"
                  className="dm-limit-val app-plain-btn"
                  onClick={() => token && setAmount(fmtUnits(availableUnits))}
                  style={{ cursor: token ? "pointer" : "default" }}
                  title={token ? "Use full balance" : undefined}
                >
                  {fmtUnits(token ? availableUnits : 0)}
                </button>
              </div>
            </div>

            {/* Withdrawal code (emailed one-time code) */}
            <div className="dm-form-group">
              <label className="dm-field-label app-label">Withdrawal code:</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Withdrawal code"
                  className="app-input" style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={requestCode}
                  disabled={codeStatus === "sending"}
                  className="app-side-btn"
                >
                  {codeStatus === "sending" ? "Sending…" : codeStatus === "sent" ? "Resend" : "Send code"}
                </button>
              </div>
              {codeMessage && (
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "6px" }}>
                  {codeMessage}
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                style={{ display: "flex", gap: "8px", alignItems: "flex-start", color: "#ff5c6a", fontSize: "13px", margin: "4px 0 12px" }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>{error}</span>
              </div>
            )}

            <div className="dm-total-value-row">
              <span className="dm-total-label">Total withdrawal value</span>
              <span className="dm-total-amount">{fmtUsd(totalUsd)}</span>
            </div>

            <button
              type="submit"
              className="dm-primary-btn"
              disabled={submitting}
              style={{ backgroundColor: submitting ? "#2563eb" : undefined }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        )}

        {/* STEP 3: success */}
        {step === "SUCCESS" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
              }}
            >
              <CheckCircle2 size={32} color="#10b981" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Withdrawal requested</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: "24px" }}>
              Your withdrawal of {fmtUnits(units)} {token?.symbol} ({fmtUsd(totalUsd)}) is pending review. The funds are
              on hold until it is processed, and you&apos;ll get an email when it&apos;s approved.
            </p>
            <button type="button" className="dm-primary-btn" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
