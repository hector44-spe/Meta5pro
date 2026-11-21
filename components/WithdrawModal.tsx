"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronDown, CheckCircle2, Loader2, AlertCircle, Snowflake } from "lucide-react";
import "@/styles/deposit-modal.css";
import "@/styles/app-forms.css";
import { usePrices } from "@/lib/usePrices";
import { openLiveSupport } from "@/components/ZohoSalesIQ";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isFrozen?: boolean;
}


const TOKENS = [
  { name: "Bitcoin", symbol: "BTC", networks: ["Bitcoin"] },
  { name: "Ethereum", symbol: "ETH", networks: ["ERC-20"] },
  { name: "Tether", symbol: "USDT", networks: ["TRC-20", "BEP-20", "ERC-20"] },
  { name: "USD Coin", symbol: "USDC", networks: ["ERC-20", "BEP-20", "Solana"] },
  { name: "Solana", symbol: "SOL", networks: ["Solana"] },
  { name: "Ripple", symbol: "XRP", networks: ["XRP"] },
];

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtUnits = (n: number) => n.toFixed(8);

export default function WithdrawModal({ isOpen, onClose, onSuccess, isFrozen = false }: WithdrawModalProps) {
  const [step, setStep] = useState<"METHOD" | "FORM" | "MANUAL" | "SUCCESS">("METHOD");
  const [paymentMethod, setPaymentMethod] = useState<"CRYPTO" | "BANK" | "PAYPAL">("CRYPTO");

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
  const [codeError, setCodeError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [minWithdrawal, setMinWithdrawal] = useState(10);
  const [maxWithdrawal, setMaxWithdrawal] = useState(1_000_000);
  const [useWithdrawalCode, setUseWithdrawalCode] = useState(true);
  const [allowCrypto, setAllowCrypto] = useState(true);
  const [allowBankTransfer, setAllowBankTransfer] = useState(false);
  const [allowPayPal, setAllowPayPal] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  // Reset and load the real balance each time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setStep("METHOD");
    setPaymentMethod("CRYPTO");
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
    setRecipientName(""); setBankName(""); setAccountNumber(""); setRoutingNumber(""); setPaypalEmail("");
    fetch("/api/wallet")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setBalanceUsd(Number(d?.wallet?.mainBalance ?? 0)))
      .catch(() => setBalanceUsd(0));

    fetch("/api/settings/platform", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.withdrawal) {
          if (typeof d.withdrawal.minWithdrawal === "number") setMinWithdrawal(d.withdrawal.minWithdrawal);
          if (typeof d.withdrawal.maxWithdrawal === "number") setMaxWithdrawal(d.withdrawal.maxWithdrawal);
          if (typeof d.withdrawal.useWithdrawalCode === "boolean") setUseWithdrawalCode(d.withdrawal.useWithdrawalCode);
          if (typeof d.withdrawal.allowCrypto === "boolean") setAllowCrypto(d.withdrawal.allowCrypto);
          if (typeof d.withdrawal.allowBankTransfer === "boolean") setAllowBankTransfer(d.withdrawal.allowBankTransfer);
          if (typeof d.withdrawal.allowPayPal === "boolean") setAllowPayPal(d.withdrawal.allowPayPal);
        }
      })
      .catch(() => null);
  }, [isOpen]);

  // Live USD price for the selected coin (refreshed every minute)
  const { prices } = usePrices();
  const price = token ? prices[token.symbol] ?? 0 : 0;
  const units = parseFloat(amount) || 0;
  const totalUsd = paymentMethod === "CRYPTO" ? Math.round(units * price * 100) / 100 : Math.round(units * 100) / 100;
  const availableUnits = useMemo(() => (price > 0 ? balanceUsd / price : 0), [balanceUsd, price]);

  useEffect(() => {
    const enabled = {
      CRYPTO: allowCrypto,
      BANK: allowBankTransfer,
      PAYPAL: allowPayPal,
    } as const;
    if (enabled[paymentMethod]) return;
    if (allowCrypto) setPaymentMethod("CRYPTO");
    else if (allowBankTransfer) setPaymentMethod("BANK");
    else if (allowPayPal) setPaymentMethod("PAYPAL");
  }, [allowCrypto, allowBankTransfer, allowPayPal, paymentMethod]);

  if (!isOpen) return null;

  const requestCode = async () => {
    setError("");
    setCodeError("");
    setCodeMessage("");
    setCodeStatus("sending");
    try {
      const res = await fetch("/api/wallet/withdraw/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalUsd || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sending failed, contact support for more info");
      setCodeStatus("sent");
      setCodeMessage(data.message);
    } catch (e) {
      setCodeStatus("idle");
      const msg = e instanceof Error ? e.message : "Sending failed, contact support for more info";
      setCodeError(msg);
    }
  };

  const validate = (): string | null => {
    if (isFrozen) return "Withdrawals are currently restricted on your account.";
    if (paymentMethod === "BANK") {
      if (!allowBankTransfer) return "Bank withdrawals are temporarily unavailable.";
      if (!recipientName.trim() || !bankName.trim() || !accountNumber.trim()) return "Enter the required bank account details.";
    } else if (paymentMethod === "PAYPAL") {
      if (!allowPayPal) return "PayPal withdrawals are temporarily unavailable.";
      if (!recipientName.trim() || !/^\S+@\S+\.\S+$/.test(paypalEmail)) return "Enter a valid PayPal recipient and email.";
    } else if (!allowCrypto) return "Crypto withdrawals are temporarily paused by administration.";
    if (paymentMethod !== "CRYPTO") {
      if (!units || units <= 0) return "Enter an amount.";
      if (totalUsd < minWithdrawal) return `Minimum withdrawal is ${fmtUsd(minWithdrawal)}.`;
      if (totalUsd > maxWithdrawal) return `Maximum withdrawal is ${fmtUsd(maxWithdrawal)}.`;
      if (totalUsd > balanceUsd) return `Insufficient balance. Available: ${fmtUsd(balanceUsd)}.`;
      if (useWithdrawalCode && !/^\d{6}$/.test(code.trim())) return "Enter the 6-digit withdrawal code emailed to you.";
      return null;
    }
    if (!token) return "Select the asset to withdraw.";
    if (!(price > 0)) return "Loading the live price… please try again in a moment.";
    if (address.trim().length < 10) return "Enter a valid destination address.";
    if (!units || units <= 0) return "Enter an amount.";
    if (totalUsd < minWithdrawal) return `Minimum withdrawal is ${fmtUsd(minWithdrawal)}.`;
    if (totalUsd > maxWithdrawal) return `Maximum withdrawal is ${fmtUsd(maxWithdrawal)}.`;
    if (totalUsd > balanceUsd) return `Insufficient balance. Available: ${fmtUsd(balanceUsd)}.`;
    if (useWithdrawalCode && !/^\d{6}$/.test(code.trim())) return "Enter the 6-digit withdrawal code emailed to you.";
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
      if (paymentMethod !== "CRYPTO") {
        const res = await fetch("/api/wallet/withdraw/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: paymentMethod,
            amountUsd: totalUsd,
            code: code.trim(),
            recipientName: recipientName.trim(),
            paypalEmail: paymentMethod === "PAYPAL" ? paypalEmail.trim() : undefined,
            bankName: paymentMethod === "BANK" ? bankName.trim() : undefined,
            accountNumber: paymentMethod === "BANK" ? accountNumber.trim() : undefined,
            routingNumber: paymentMethod === "BANK" ? routingNumber.trim() : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Withdrawal failed");
        setStep("SUCCESS");
        onSuccess?.();
        return;
      }
      const chosenNetwork = network || token!.networks[0];
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          units,
          currency: token!.symbol,
          network: chosenNetwork,
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

            {isFrozen && (
              <div
                style={{
                  margin: "8px 0 16px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(14, 165, 233, 0.06) 100%)",
                  border: "1px solid rgba(56, 189, 248, 0.28)",
                  color: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              >
                <Snowflake size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#e0f2fe", fontWeight: 500 }}>
                  Withdrawals are currently restricted on your account.
                </span>
              </div>
            )}

            <div className="dm-section-label">Available methods</div>
            <div className="dm-payment-options">
              {allowCrypto && <button type="button" className={`dm-option-card ${paymentMethod === "CRYPTO" ? "selected" : ""}`} onClick={() => setPaymentMethod("CRYPTO")}><span>Crypto</span><small>Withdraw to a wallet</small></button>}
              {allowBankTransfer && <button type="button" className={`dm-option-card ${paymentMethod === "BANK" ? "selected" : ""}`} onClick={() => setPaymentMethod("BANK")}><span>Bank transfer</span><small>Withdraw to your bank</small></button>}
              {allowPayPal && <button type="button" className={`dm-option-card ${paymentMethod === "PAYPAL" ? "selected" : ""}`} onClick={() => setPaymentMethod("PAYPAL")}><span>PayPal</span><small>Withdraw to PayPal</small></button>}
              {!allowCrypto && !allowBankTransfer && !allowPayPal && <div className="dm-method-empty">No withdrawal methods are currently available.</div>}
            </div>

            <div className="dm-limits-box">
              <div className="dm-limit-row">
                <span className="dm-limit-label">Minimum withdrawal</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">{fmtUsd(minWithdrawal).replace(".00", "")}</span>
              </div>
              <div className="dm-limit-row">
                <span className="dm-limit-label">Maximum withdrawal</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">{fmtUsd(maxWithdrawal).replace(".00", "")}</span>
              </div>
            </div>

            <button
              type="button"
              className="dm-primary-btn"
              disabled={isFrozen || (!allowCrypto && !allowBankTransfer && !allowPayPal)}
              onClick={() => setStep(paymentMethod === "CRYPTO" ? "FORM" : "MANUAL")}
            >
              {isFrozen ? "Account Frozen (Withdrawals Restricted)" : "Continue"}
            </button>
          </div>
        )}

        {step === "MANUAL" && (
          <form onSubmit={handleSubmit} className="app-form">
            <div className="dm-header">
              <div className="dm-header-left"><button type="button" className="dm-back-btn" onClick={() => setStep("METHOD")}><ChevronLeft size={20} /></button><h2 className="dm-title">{paymentMethod === "BANK" ? "Bank withdrawal" : "PayPal withdrawal"}</h2></div>
              <button type="button" className="dm-close-btn" onClick={onClose}><X size={19} /></button>
            </div>
            <p className="dm-subtitle">Enter the receiving account details. Your request will remain pending until reviewed.</p>
            {isFrozen && (
              <div
                style={{
                  margin: "8px 0 16px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(14, 165, 233, 0.06) 100%)",
                  border: "1px solid rgba(56, 189, 248, 0.28)",
                  color: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              >
                <Snowflake size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#e0f2fe", fontWeight: 500 }}>
                  Withdrawals are currently restricted on your account.
                </span>
              </div>
            )}
            {error && <div className="dm-error"><AlertCircle size={15} /><span>{error}</span></div>}
            <label><span className="app-label">Amount (USD)</span><input className="app-input" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></label>
            <label><span className="app-label">Recipient name</span><input className="app-input" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Full legal name" /></label>
            {paymentMethod === "BANK" ? (
              <>
                <label><span className="app-label">Bank name</span><input className="app-input" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" /></label>
                <label><span className="app-label">Account number / IBAN</span><input className="app-input" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number or IBAN" /></label>
                <label><span className="app-label">Routing / SWIFT code (optional)</span><input className="app-input" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} placeholder="Routing or SWIFT code" /></label>
              </>
            ) : (
              <label><span className="app-label">PayPal email</span><input className="app-input" type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="paypal@example.com" /></label>
            )}
            {useWithdrawalCode && (
              <div><span className="app-label">Withdrawal code</span><div className="dm-code-row"><input className="app-input" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" /><button type="button" className="app-side-btn" onClick={requestCode} disabled={codeStatus === "sending"}>{codeStatus === "sending" ? "Sending…" : codeStatus === "sent" ? "Resend" : "Send code"}</button></div>{codeMessage && <div style={{ color: "#10b981", fontSize: 12, marginTop: 6 }}>{codeMessage}</div>}</div>
            )}
            <div className="dm-limits-box"><div className="dm-limit-row"><span className="dm-limit-label">Available balance</span><span className="dm-limit-dots"/><span className="dm-limit-val">{fmtUsd(balanceUsd)}</span></div><div className="dm-limit-row"><span className="dm-limit-label">Requested</span><span className="dm-limit-dots"/><span className="dm-limit-val">{fmtUsd(totalUsd)}</span></div></div>
            <button type="submit" className="dm-primary-btn" disabled={isFrozen || submitting}>
              {isFrozen ? "Account Frozen" : submitting ? <Loader2 size={16} className="animate-spin" /> : "Request withdrawal"}
            </button>
          </form>
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

            {isFrozen && (
              <div
                style={{
                  margin: "8px 0 16px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(14, 165, 233, 0.06) 100%)",
                  border: "1px solid rgba(56, 189, 248, 0.28)",
                  color: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              >
                <Snowflake size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#e0f2fe", fontWeight: 500 }}>
                  Withdrawals are currently restricted on your account.
                </span>
              </div>
            )}

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

            {/* Emailed one-time withdrawal code */}
            {useWithdrawalCode && (
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
                    placeholder="Enter emailed code"
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
                {codeError ? (
                  <div style={{ fontSize: "12px", color: "#ff5c6a", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>
                      Sending failed,{" "}
                      <button
                        type="button"
                        onClick={() => openLiveSupport()}
                        style={{
                          color: "#38bdf8",
                          textDecoration: "underline",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        contact support
                      </button>{" "}
                      for more info
                    </span>
                  </div>
                ) : codeMessage ? (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "6px" }}>
                    {codeMessage}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "5px" }}>
                    Request a one-time code. It expires after 10 minutes.
                  </div>
                )}
              </div>
            )}

            {error && (
              <div
                role="alert"
                style={{ display: "flex", gap: "8px", alignItems: "flex-start", color: "#ff5c6a", fontSize: "13px", margin: "4px 0 12px" }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>
                  {error.includes("contact support") ? (
                    <>
                      Sending failed,{" "}
                      <button
                        type="button"
                        onClick={() => openLiveSupport()}
                        style={{
                          color: "#38bdf8",
                          textDecoration: "underline",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        contact support
                      </button>{" "}
                      for more info
                    </>
                  ) : (
                    error
                  )}
                </span>
              </div>
            )}

            <div className="dm-total-value-row">
              <span className="dm-total-label">Total withdrawal value</span>
              <span className="dm-total-amount">{fmtUsd(totalUsd)}</span>
            </div>

            <button
              type="submit"
              className="dm-primary-btn"
              disabled={isFrozen || submitting}
              style={{ backgroundColor: isFrozen ? "rgba(255, 255, 255, 0.12)" : submitting ? "#2563eb" : undefined }}
            >
              {isFrozen ? (
                "Account Frozen"
              ) : submitting ? (
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
