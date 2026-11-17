"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronDown,
  Check,
  Copy,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import "@/styles/deposit-modal.css";
import { usePrices } from "@/lib/usePrices";
import { compressScreenshot } from "@/lib/image-compress";

export interface DepositAddressItem {
  id: string;
  token: string;
  symbol: string;
  network: string;
  address: string;
  memo: string | null;
  qrCode?: string | null;
}

export interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: any) => void;
  context?: "default" | "signal" | "card";
  signal?: {
    id: string;
    title: string;
    strength: number;
    price: number;
  } | null;
  card?: {
    name: string;
    title: string;
    issuanceFee: number;
  } | null;
  fixedAmount?: number;
}

// Supported tokens with their designated networks
const SUPPORTED_TOKENS = [
  { name: "Tether", symbol: "USDT", networks: ["TRC-20", "BEP-20", "ERC-20"] },
  { name: "Bitcoin", symbol: "BTC", networks: ["Bitcoin"] },
  { name: "Ethereum", symbol: "ETH", networks: ["ERC-20"] },
  { name: "Solana", symbol: "SOL", networks: ["Solana"] },
  { name: "USD Coin", symbol: "USDC", networks: ["ERC-20", "BEP-20", "Solana"] },
  { name: "Ripple", symbol: "XRP", networks: ["XRP"] },
];

export default function DepositModal({
  isOpen,
  onClose,
  onSuccess,
  context = "default",
  signal = null,
  card = null,
  fixedAmount,
}: DepositModalProps) {
  // Navigation step: "METHOD" (Image 1) -> "STEPPER" (Images 2 & 3) -> "CONFIRMATION" (Image 4) -> "SUCCESS"
  const [step, setStep] = useState<"METHOD" | "STEPPER" | "CONFIRMATION" | "SUCCESS">("METHOD");

  // Stepper selections
  const [addresses, setAddresses] = useState<DepositAddressItem[]>([]);
  const [selectedToken, setSelectedToken] = useState<typeof SUPPORTED_TOKENS[0] | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  // Address & Copy
  const [activeAddress, setActiveAddress] = useState<string>("");
  const [activeMemo, setActiveMemo] = useState<string>("");
  const [activeQrCode, setActiveQrCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [memoCopied, setMemoCopied] = useState(false);

  // Confirmation form
  const [amountInput, setAmountInput] = useState<string>("100");
  const [txHash, setTxHash] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [minDeposit, setMinDeposit] = useState<number>(100);
  const [maxDeposit, setMaxDeposit] = useState<number>(100000);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live USD prices (refreshed every minute)
  const { prices } = usePrices();
  const priceOf = (sym?: string) => (sym ? prices[sym.toUpperCase()] ?? null : null);

  // Confirmation shown after a successful submission
  const [receipt, setReceipt] = useState<{
    reference: string;
    units: number;
    symbol: string;
    network: string;
    usdAmount: number;
    submittedAt: string;
    title?: string;
  } | null>(null);

  const effectiveFixed = fixedAmount ?? (context === "signal" ? signal?.price : context === "card" ? card?.issuanceFee : undefined);

  // Reset or fetch addresses on open
  useEffect(() => {
    if (isOpen) {
      setStep("METHOD");
      setSelectedToken(SUPPORTED_TOKENS[0]);
      setSelectedNetwork(SUPPORTED_TOKENS[0].networks[0]);
      setActiveAddress("");
      setAmountInput(effectiveFixed ? String(effectiveFixed) : "100");
      setTxHash("");
      setProofFile(null);
      setPreviewUrl(null);
      setErrorMessage("");
      setReceipt(null);
      setTokenDropdownOpen(false);
      setNetworkDropdownOpen(false);
      fetchAddresses();
    }
  }, [isOpen, effectiveFixed]);

  const fetchAddresses = async () => {
    try {
      const [addrRes, platRes] = await Promise.all([
        fetch("/api/settings/addresses", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }),
        fetch("/api/settings/platform", {
          cache: "no-store",
        }).catch(() => null),
      ]);
      if (addrRes.ok) {
        const data = await addrRes.json();
        const combined = [
          ...(Array.isArray(data.signalAddresses) && data.signalAddresses.length > 0
            ? data.signalAddresses
            : []),
          ...(Array.isArray(data.addresses) ? data.addresses : []),
        ];
        setAddresses(combined);
      }
      if (platRes && platRes.ok) {
        const platData = await platRes.json();
        if (platData?.deposit?.minDeposit != null) setMinDeposit(platData.deposit.minDeposit);
        if (platData?.deposit?.maxDeposit != null) setMaxDeposit(platData.deposit.maxDeposit);
      }
    } catch (e) {
      console.error("Error fetching deposit addresses:", e);
    }
  };

  // Automatically lookup designated address when token & network are chosen
  useEffect(() => {
    if (selectedToken && selectedNetwork && addresses.length > 0) {
      const found = addresses.find(
        (a) =>
          a.symbol.toUpperCase() === selectedToken.symbol.toUpperCase() &&
          a.network.toUpperCase() === selectedNetwork.toUpperCase()
      );
      if (found) {
        setActiveAddress(found.address);
        setActiveMemo(found.memo || "");
        setActiveQrCode(found.qrCode || "");
      } else {
        const fallback = addresses.find(
          (a) => a.symbol.toUpperCase() === selectedToken.symbol.toUpperCase()
        );
        if (fallback) {
          setActiveAddress(fallback.address);
          setActiveMemo(fallback.memo || "");
          setActiveQrCode(fallback.qrCode || "");
        } else {
          setActiveAddress(addresses[0]?.address || "");
          setActiveMemo(addresses[0]?.memo || "");
          setActiveQrCode(addresses[0]?.qrCode || "");
        }
      }
    }
  }, [selectedToken, selectedNetwork, addresses]);

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    if (!activeAddress) return;
    navigator.clipboard?.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File exceeds 10MB size limit.");
        return;
      }
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const calculateUSDValue = () => {
    if (effectiveFixed != null) {
      return `$${effectiveFixed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    }
    if (!selectedToken) return "$0.00 USD";
    const num = parseFloat(amountInput) || 0;
    const rate = priceOf(selectedToken.symbol);
    if (rate == null) return "…";
    const total = num * rate;
    return `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!proofFile && !txHash.trim()) {
      setErrorMessage("Please upload your transfer screenshot proof before proceeding.");
      return;
    }

    if (!activeAddress) {
      setErrorMessage("Deposits for this token and network are not available right now.");
      return;
    }

    const numAmount = effectiveFixed ?? parseFloat(amountInput);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid deposit amount.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Compress screenshot client-side for rapid upload
      let receiptUrl = "";
      if (proofFile) {
        const fileToUpload = await compressScreenshot(proofFile);
        const formData = new FormData();
        formData.append("file", fileToUpload);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Screenshot upload failed");
        }

        const uploadJson = await uploadRes.json();
        receiptUrl = uploadJson.url;
      }

      // 2. Submit based on context
      if (context === "signal") {
        const res = await fetch("/api/signals/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signalId: signal?.id,
            signalTitle: signal?.title,
            strength: signal?.strength,
            amount: numAmount,
            currency: selectedToken?.symbol || "USDT",
            network: selectedNetwork,
            txHash: txHash.trim() || undefined,
            receiptUrl: receiptUrl || undefined,
            cryptoAddress: activeAddress,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signal deposit submission failed");

        setReceipt({
          reference: data.signal?.ref || `SIG-${Date.now().toString().slice(-6)}`,
          units: numAmount,
          symbol: selectedToken?.symbol || "USDT",
          network: selectedNetwork,
          usdAmount: numAmount,
          submittedAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
          title: signal?.title,
        });
      } else if (context === "card") {
        const res = await fetch("/api/cards/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardType: card?.name || "Regular",
            currency: selectedToken?.symbol || "USDT",
            network: selectedNetwork,
            txHash: txHash.trim() || undefined,
            receiptUrl: receiptUrl || undefined,
            cryptoAddress: activeAddress,
            amount: numAmount,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Card request deposit failed");

        setReceipt({
          reference: data.card?.ref || `CRD-${Date.now().toString().slice(-6)}`,
          units: numAmount,
          symbol: selectedToken?.symbol || "USDT",
          network: selectedNetwork,
          usdAmount: numAmount,
          submittedAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
          title: card?.title,
        });
      } else {
        const depositRes = await fetch("/api/wallet/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            units: numAmount,
            currency: selectedToken?.symbol || "USDT",
            network: selectedNetwork,
            cryptoAddress: activeAddress,
            receiptUrl,
          }),
        });
        const depositData = await depositRes.json();
        if (!depositRes.ok) throw new Error(depositData.error || "Deposit recording failed");

        setReceipt({
          reference: depositData.reference,
          units: numAmount,
          symbol: selectedToken?.symbol || "USDT",
          network: selectedNetwork,
          usdAmount: depositData.usdAmount,
          submittedAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
        });
      }

      // Immediately notify global dashboard listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("balance-changed"));
        window.dispatchEvent(new Event("notifications-updated"));
      }

      setStep("SUCCESS");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred submitting your deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dm-backdrop" onClick={onClose}>
      <div className="dm-card" onClick={(e) => e.stopPropagation()}>
        {/* ====================================================================
            STEP 0: METHOD SELECTION (EXACT IMAGE 1 & 2)
            ==================================================================== */}
        {step === "METHOD" && (
          <div>
            <div className="dm-header">
              <h2 className="dm-title">Make a deposit</h2>
              <button type="button" className="dm-close-btn" onClick={onClose} aria-label="Close">
                <X size={19} />
              </button>
            </div>
            <p className="dm-subtitle">
              To make a deposit, choose your preferred method, and click on the continue button.
            </p>

            {/* Context Badge: Signal */}
            {context === "signal" && signal && (
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{signal.title}</div>
                  <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>
                    {signal.strength}% Confidence Strength
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#3b82f6" }}>
                    ${(effectiveFixed || signal.price).toLocaleString()}.00
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                    One-time allocation
                  </div>
                </div>
              </div>
            )}

            {/* Context Badge: Card */}
            {context === "card" && card && (
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{card.title}</div>
                  <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.5)" }}>
                    Card Issuance Deposit
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#3b82f6" }}>
                    ${(effectiveFixed || card.issuanceFee).toLocaleString()}.00
                  </div>
                </div>
              </div>
            )}

            <div className="dm-section-label">Payment options</div>

            {/* Crypto option (Selected with blue outline) */}
            <div className="dm-option-card selected">
              <span>Crypto</span>
            </div>

            {/* Limits */}
            <div className="dm-limits-box">
              <div className="dm-limit-row">
                <span className="dm-limit-label">Minimum deposit</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">
                  ${effectiveFixed != null ? effectiveFixed.toLocaleString() : minDeposit.toLocaleString()}
                </span>
              </div>
              <div className="dm-limit-row">
                <span className="dm-limit-label">Maximum deposit</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">
                  ${effectiveFixed != null ? effectiveFixed.toLocaleString() : maxDeposit.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="dm-action-footer">
              <button
                type="button"
                className="dm-primary-btn"
                onClick={() => setStep("STEPPER")}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            STEP 1: CRYPTO DEPOSIT STEPPER (IMAGES 2 & 3)
            ==================================================================== */}
        {step === "STEPPER" && (
          <div>
            <div className="dm-header">
              <div className="dm-header-left">
                <button
                  type="button"
                  className="dm-back-btn"
                  onClick={() => setStep("METHOD")}
                  aria-label="Back"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="dm-title">Crypto deposit</h2>
              </div>
              <button type="button" className="dm-close-btn" onClick={onClose} aria-label="Close">
                <X size={19} />
              </button>
            </div>
            <p className="dm-subtitle">
              To proceed, select your token and network, make payment to the address shown and click on the continue button.
            </p>

            {/* Vertical Stepper */}
            <div className="dm-stepper">
              {/* STEP 1: Select token to deposit */}
              <div className={`dm-step-item ${selectedToken ? "completed" : "active"}`}>
                <div className="dm-step-indicator">
                  {selectedToken ? <Check size={14} strokeWidth={2.5} /> : "1"}
                </div>
                <div className="dm-step-content" style={{ position: "relative" }}>
                  <div className="dm-step-title">Select token to deposit</div>

                  <div
                    className={`dm-select-trigger ${selectedToken ? "selected" : ""}`}
                    onClick={() => setTokenDropdownOpen(!tokenDropdownOpen)}
                  >
                    {selectedToken ? (
                      <span className="dm-tag-badge">
                        <span>{selectedToken.name}</span>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "4px" }}>
                          ({selectedToken.symbol})
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Select token</span>
                    )}
                    <ChevronDown size={16} color="rgba(255, 255, 255, 0.45)" />
                  </div>

                  {tokenDropdownOpen && (
                    <div className="dm-dropdown-menu">
                      {SUPPORTED_TOKENS.map((t) => (
                        <div
                          key={t.symbol}
                          className="dm-dropdown-item"
                          onClick={() => {
                            setSelectedToken(t);
                            setSelectedNetwork(t.networks[0]);
                            setTokenDropdownOpen(false);
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{t.name}</span>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                            {t.symbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2: Select network */}
              <div className={`dm-step-item ${selectedNetwork ? "completed" : selectedToken ? "active" : ""}`}>
                <div className="dm-step-indicator">
                  {selectedNetwork ? <Check size={14} strokeWidth={2.5} /> : "2"}
                </div>
                <div className="dm-step-content" style={{ position: "relative" }}>
                  <div className="dm-step-title">Select network</div>

                  <div
                    className={`dm-select-trigger ${!selectedToken ? "disabled" : selectedNetwork ? "selected" : ""}`}
                    onClick={() => {
                      if (selectedToken) setNetworkDropdownOpen(!networkDropdownOpen);
                    }}
                  >
                    {selectedNetwork ? (
                      <span style={{ fontWeight: 500, color: "#fff" }}>{selectedNetwork}</span>
                    ) : (
                      <span>Select network</span>
                    )}
                    <ChevronDown size={16} color="rgba(255, 255, 255, 0.45)" />
                  </div>

                  {networkDropdownOpen && selectedToken && (
                    <div className="dm-dropdown-menu">
                      {selectedToken.networks.map((net) => (
                        <div
                          key={net}
                          className="dm-dropdown-item"
                          onClick={() => {
                            setSelectedNetwork(net);
                            setNetworkDropdownOpen(false);
                          }}
                        >
                          <span>{net}</span>
                          {selectedNetwork === net && <Check size={14} color="#3b82f6" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 3: Deposit details */}
              <div className={`dm-step-item ${activeAddress ? "completed" : "active"}`}>
                <div className="dm-step-indicator">3</div>
                <div className="dm-step-content">
                  <div className="dm-step-title">Deposit details</div>

                  {activeAddress ? (
                    <div>
                      {activeQrCode && (
                        <div style={{ textAlign: "center", marginBottom: "12px" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={activeQrCode}
                            alt="Deposit QR"
                            style={{
                              width: "130px",
                              height: "130px",
                              borderRadius: "10px",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              background: "#ffffff",
                              padding: "6px",
                              display: "inline-block",
                            }}
                          />
                        </div>
                      )}
                      <div className="dm-address-box">
                        <span className="dm-address-text">{activeAddress}</span>
                        <div className="dm-address-actions">
                          <button
                            type="button"
                            className="dm-icon-action-btn"
                            onClick={handleCopyAddress}
                            title="Copy address"
                          >
                            {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                      {activeMemo && (
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "rgba(255, 255, 255, 0.03)",
                            borderRadius: "6px",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            fontSize: "12.5px",
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Memo:</span>
                          <span style={{ fontFamily: "monospace", color: "#f5a524", fontWeight: 600 }}>{activeMemo}</span>
                          <button
                            type="button"
                            className="dm-icon-action-btn"
                            onClick={() => {
                              navigator.clipboard?.writeText(activeMemo);
                              setMemoCopied(true);
                              setTimeout(() => setMemoCopied(false), 2000);
                            }}
                            title="Copy memo"
                          >
                            {memoCopied ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "14px",
                        background: "#101217",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        fontSize: "12px",
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      Loading address for {selectedToken?.symbol}...
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 4: Deposit confirmation */}
              <div className="dm-step-item">
                <div className="dm-step-indicator">4</div>
                <div className="dm-step-content">
                  <div className="dm-step-title">Deposit confirmation</div>
                  <p className="dm-step-subtext">
                    Click on the &apos;continue&apos; button at the bottom to proceed to deposit confirmation
                  </p>
                </div>
              </div>
            </div>

            <div className="dm-action-footer">
              <button
                type="button"
                className="dm-primary-btn"
                disabled={!selectedToken || !selectedNetwork || !activeAddress}
                onClick={() => setStep("CONFIRMATION")}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            STEP 2: CONFIRMATION & PROOF UPLOAD (IMAGE 4)
            ==================================================================== */}
        {step === "CONFIRMATION" && (
          <form onSubmit={handleDepositSubmit}>
            <div className="dm-header">
              <div className="dm-header-left">
                <button
                  type="button"
                  className="dm-back-btn"
                  onClick={() => setStep("STEPPER")}
                  aria-label="Back"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="dm-title">Confirmation</h2>
              </div>
              <button type="button" className="dm-close-btn" onClick={onClose} aria-label="Close">
                <X size={19} />
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  fontSize: "12px",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Amount Input */}
            <div className="dm-form-group">
              <label className="dm-field-label">Amount:</label>
              <div className="dm-amount-input-wrap">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={effectiveFixed != null ? effectiveFixed : amountInput}
                  onChange={(e) => {
                    if (effectiveFixed == null) setAmountInput(e.target.value);
                  }}
                  readOnly={effectiveFixed != null}
                  className="dm-amount-input"
                  placeholder="0.00"
                  required
                />
                <span className="dm-currency-pill">
                  {effectiveFixed == null && (
                    <span style={{ color: "rgba(255, 255, 255, 0.4)", cursor: "pointer" }} onClick={() => setAmountInput("")}>✕</span>
                  )}
                  <span>{effectiveFixed != null ? "USD" : selectedToken?.symbol || "USD"}</span>
                </span>
              </div>
            </div>

            {/* Metadata Rows */}
            <div className="dm-limits-box" style={{ margin: "14px 0" }}>
              {context === "signal" && signal ? (
                <>
                  <div className="dm-limit-row">
                    <span className="dm-limit-label">Signal package</span>
                    <span className="dm-limit-dots"></span>
                    <span className="dm-limit-val">{signal.title}</span>
                  </div>
                  <div className="dm-limit-row">
                    <span className="dm-limit-label">Confidence strength</span>
                    <span className="dm-limit-dots"></span>
                    <span className="dm-limit-val" style={{ color: "#34d399" }}>{signal.strength}%</span>
                  </div>
                </>
              ) : context === "card" && card ? (
                <>
                  <div className="dm-limit-row">
                    <span className="dm-limit-label">Card type</span>
                    <span className="dm-limit-dots"></span>
                    <span className="dm-limit-val">{card.title}</span>
                  </div>
                  <div className="dm-limit-row">
                    <span className="dm-limit-label">Issuance fee</span>
                    <span className="dm-limit-dots"></span>
                    <span className="dm-limit-val">${card.issuanceFee.toLocaleString()}.00</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="dm-limit-row">
                    <span className="dm-limit-label">Current {selectedToken?.symbol} balance</span>
                    <span className="dm-limit-dots"></span>
                    <span className="dm-limit-val">0 {selectedToken?.symbol}</span>
                  </div>
                  <div className="dm-limit-row">
                    <span className="dm-limit-label">Minimum deposit</span>
                    <span className="dm-limit-dots"></span>
                    <span className="dm-limit-val">${minDeposit.toLocaleString()}.00</span>
                  </div>
                  <div className="dm-limit-row">
                    <span className="dm-limit-label">Maximum deposit</span>
                    <span className="dm-limit-dots"></span>
                    <span className="dm-limit-val">${maxDeposit.toLocaleString()}.00</span>
                  </div>
                </>
              )}
            </div>

            {/* Optional TxHash Input */}
            <div className="dm-form-group">
              <label className="dm-field-label">Transaction Hash / TxID (Optional):</label>
              <input
                type="text"
                placeholder="e.g. 0x4f8a... or 7f12..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="dm-amount-input"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "#1a1e26",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Payment Proof Upload */}
            <div className="dm-form-group">
              <label className="dm-field-label">Payment proof:</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: "none" }}
              />

              <div
                className={`dm-upload-dropzone ${proofFile ? "has-file" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer" }}
              >
                {proofFile && previewUrl ? (
                  <div className="dm-file-preview-row">
                    <div className="dm-file-preview-left">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Proof thumbnail" className="dm-file-thumb" />
                      <div>
                        <div className="dm-filename">{proofFile.name}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                          {(proofFile.size / 1024).toFixed(1)} KB • Ready to submit
                        </div>
                      </div>
                    </div>
                    <FileCheck size={18} color="#10b981" />
                  </div>
                ) : (
                  <div className="dm-upload-text">
                    <UploadCloud size={18} />
                    <span>Click here to upload payment proof</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Deposit Value */}
            <div className="dm-total-value-row">
              <span className="dm-total-label">Total deposit value</span>
              <span className="dm-total-amount">{calculateUSDValue()}</span>
            </div>

            <div className="dm-action-footer">
              <button
                type="submit"
                className="dm-primary-btn"
                disabled={isSubmitting || (!proofFile && !txHash.trim())}
                style={{ backgroundColor: isSubmitting ? "#2563eb" : !proofFile && !txHash.trim() ? "#4b5563" : "#3b82f6" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting proof...</span>
                  </>
                ) : (
                  "I have made this deposit"
                )}
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================
            STEP 3: SUCCESS CONFIRMATION
            ==================================================================== */}
        {step === "SUCCESS" && receipt && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
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
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>
              Deposit received
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: "16px" }}>
              {context === "signal"
                ? "Your signal deposit has been submitted. We'll confirm the payment and activate your signal automatically."
                : context === "card"
                ? "Your card request deposit has been submitted. We'll confirm the payment and issue your card."
                : "We'll confirm the payment and credit your balance. You'll get a notification and an email when it's approved."}
            </p>
            <div className="dm-limits-box" style={{ textAlign: "left", marginBottom: "20px" }}>
              {[
                ["Reference", receipt.reference],
                ...(receipt.title ? [["Item", receipt.title]] : []),
                ["Amount", `${receipt.units.toLocaleString()} ${receipt.symbol}`],
                ["Network", receipt.network],
                ["Value", `$${receipt.usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`],
                ["Submitted", receipt.submittedAt],
                ["Status", "Pending confirmation"],
              ].map(([k, v]) => (
                <div className="dm-limit-row" key={k}>
                  <span className="dm-limit-label">{k}</span>
                  <span className="dm-limit-dots"></span>
                  <span className="dm-limit-val" style={k === "Status" ? { color: "#fbbf24" } : undefined}>{v}</span>
                </div>
              ))}
            </div>
            <div className="dm-action-footer">
              <button
                type="button"
                className="dm-primary-btn"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
