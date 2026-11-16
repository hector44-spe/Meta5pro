"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  X,
  Loader2,
  ChevronLeft,
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export interface CardTypeOption {
  name: "Regular" | "Virtual" | "Physical";
  title: string;
  kycRequired: boolean;
  issuanceFee: number;
  depositTotalMinimum: number | null;
}

const CARD_OPTIONS: CardTypeOption[] = [
  {
    name: "Regular",
    title: "Regular Card",
    kycRequired: false,
    issuanceFee: 1000,
    depositTotalMinimum: null,
  },
  {
    name: "Virtual",
    title: "Virtual Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 10000,
  },
  {
    name: "Physical",
    title: "Physical Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 50000,
  },
];

const SUPPORTED_ASSETS = [
  { name: "Tether", symbol: "USDT", networks: ["TRC-20", "ERC-20", "BEP-20"] },
  { name: "Bitcoin", symbol: "BTC", networks: ["Bitcoin"] },
  { name: "Ethereum", symbol: "ETH", networks: ["ERC-20"] },
  { name: "Solana", symbol: "SOL", networks: ["Solana"] },
  { name: "USD Coin", symbol: "USDC", networks: ["ERC-20", "Solana", "BEP-20"] },
];

interface RequestCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestCardModal({ isOpen, onClose, onSuccess }: RequestCardModalProps) {
  const [step, setStep] = useState<"CONFIG" | "PAYMENT">("CONFIG");
  const [selectedCard, setSelectedCard] = useState<CardTypeOption | null>(null);
  const [cardPin, setCardPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment step state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState(SUPPORTED_ASSETS[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(SUPPORTED_ASSETS[0].networks[0]);
  const [activeAddress, setActiveAddress] = useState<any | null>(null);
  const [txHash, setTxHash] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [memoCopied, setMemoCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep("CONFIG");
      setSelectedCard(null);
      setCardPin("");
      setError(null);
      setTxHash("");
      setProofFile(null);
      setPreviewUrl(null);
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/settings/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      }
    } catch (e) {
      console.error("Failed to load deposit addresses:", e);
    }
  };

  useEffect(() => {
    if (addresses.length === 0) return;
    const match = addresses.find(
      (a) =>
        a.symbol?.toUpperCase() === selectedAsset.symbol.toUpperCase() &&
        a.network?.toUpperCase() === selectedNetwork.toUpperCase(),
    );
    if (match) {
      setActiveAddress(match);
    } else {
      const fallback = addresses.find(
        (a) => a.symbol?.toUpperCase() === selectedAsset.symbol.toUpperCase(),
      );
      setActiveAddress(fallback || addresses[0] || null);
    }
  }, [addresses, selectedAsset, selectedNetwork]);

  if (!isOpen) return null;

  const handleSelectCard = (opt: CardTypeOption) => {
    setSelectedCard(opt);
    setError(null);
  };

  const handleProceedToPayment = () => {
    if (!selectedCard) return;
    if (cardPin.trim().length > 0 && cardPin.trim().length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    setError(null);
    setStep("PAYMENT");
  };

  const handleCopy = (text: string, isMemo = false) => {
    navigator.clipboard.writeText(text);
    if (isMemo) {
      setMemoCopied(true);
      setTimeout(() => setMemoCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File exceeds 5MB size limit.");
        return;
      }
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    if (!proofFile && !txHash.trim()) {
      setError("Please upload a payment proof screenshot or provide a transaction hash.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let receiptUrl = "";
      if (proofFile) {
        const formData = new FormData();
        formData.append("file", proofFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Failed to upload payment proof.");
        }
        receiptUrl = uploadData.url;
      }

      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          cardType: selectedCard.name,
          cardPin: cardPin.trim() || "1234",
          currency: selectedAsset.symbol,
          network: selectedNetwork,
          txHash: txHash.trim() || undefined,
          receiptUrl: receiptUrl || undefined,
          cryptoAddress: activeAddress?.address || undefined,
          amount: selectedCard.issuanceFee,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to request card");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit card payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="request-card-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="request-card-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "480px" }}
      >
        {/* ==================== STEP 1: CARD CONFIGURATION ==================== */}
        {step === "CONFIG" && (
          <div>
            {/* Header */}
            <div className="request-card-header">
              <h3>Request a card</h3>
              <button
                type="button"
                className="cards-drawer-close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Policy Notice: Paid separately */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                backgroundColor: "rgba(79, 107, 255, 0.08)",
                border: "1px solid rgba(79, 107, 255, 0.2)",
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "14px",
                fontSize: "12px",
                color: "#e0e7ff",
              }}
            >
              <ShieldCheck size={16} color="#4F6BFF" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>
                All cards must be <strong>paid for separately</strong> via a direct fresh deposit ($1,000 issuance fee). No funds are deducted from your balance.
              </span>
            </div>

            {/* Cards Label */}
            <div className="request-card-section-label">Cards</div>

            {/* Cards Option List */}
            <div className="request-card-levels-wrapper">
              {CARD_OPTIONS.map((opt) => {
                const isSelected = selectedCard?.name === opt.name;
                return (
                  <div
                    key={opt.name}
                    className={`request-card-level ${isSelected ? "active" : ""}`}
                    onClick={() => handleSelectCard(opt)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelectCard(opt);
                      }
                    }}
                  >
                    {/* Level Top */}
                    <div className="request-card-level-top">
                      <div className="request-card-level-top-left">
                        <CreditCard size={14} strokeWidth={1.5} color="#ffffff" />
                        <p>{opt.title}</p>
                      </div>
                    </div>

                    {/* Level Bottom */}
                    <div className="request-card-level-bottom">
                      {opt.kycRequired && (
                        <div className="request-card-bottom-content">
                          <p>KYC required:</p>
                          <p>Yes</p>
                        </div>
                      )}

                      <div className="request-card-bottom-content">
                        <p>Issurance fee:</p>
                        <p>${opt.issuanceFee.toLocaleString()}</p>
                      </div>

                      <div className="request-card-bottom-content">
                        <p>Deposit total minimum:</p>
                        <p>
                          {opt.depositTotalMinimum !== null
                            ? `$${opt.depositTotalMinimum.toLocaleString()}`
                            : "No minimum"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Card Pin Input */}
            {selectedCard && (
              <div className="request-card-pin-box">
                <label htmlFor="card-pin-input">Card pin:</label>
                <input
                  id="card-pin-input"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={cardPin}
                  onChange={(e) => setCardPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="request-card-pin-input"
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <p style={{ color: "#ff3344", fontSize: "12px", marginTop: "10px", marginInline: 0 }}>
                {error}
              </p>
            )}

            {/* Footer Action Button */}
            <div className="request-card-footer">
              <button
                type="button"
                className="cards-btn-primary"
                disabled={!selectedCard}
                onClick={handleProceedToPayment}
              >
                {selectedCard ? "Proceed to Separate Payment ($1,000)" : "Select a card type"}
              </button>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: SEPARATE DIRECT PAYMENT ==================== */}
        {step === "PAYMENT" && selectedCard && (
          <div>
            {/* Header with Back button */}
            <div className="request-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setStep("CONFIG")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.7)",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <h3 style={{ margin: 0 }}>Card Issuance Deposit</h3>
              </div>
              <button
                type="button"
                className="cards-drawer-close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Summary Box */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                  {selectedCard.title}
                </div>
                <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.5)" }}>
                  Separate direct issuance fee
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#4F6BFF" }}>
                  ${selectedCard.issuanceFee.toLocaleString()}
                </div>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit}>
              {/* Asset Selector */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
                  Select Payment Currency
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                  {SUPPORTED_ASSETS.map((asset) => (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setSelectedNetwork(asset.networks[0]);
                      }}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "8px",
                        border: selectedAsset.symbol === asset.symbol ? "1px solid #4F6BFF" : "1px solid rgba(255, 255, 255, 0.08)",
                        backgroundColor: selectedAsset.symbol === asset.symbol ? "rgba(79, 107, 255, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        color: selectedAsset.symbol === asset.symbol ? "#fff" : "rgba(255, 255, 255, 0.6)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      {asset.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Selector */}
              {selectedAsset.networks.length > 1 && (
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                    Select Network
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {selectedAsset.networks.map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setSelectedNetwork(net)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: selectedNetwork === net ? "1px solid #4F6BFF" : "1px solid rgba(255, 255, 255, 0.08)",
                          backgroundColor: selectedNetwork === net ? "rgba(79, 107, 255, 0.15)" : "rgba(255, 255, 255, 0.02)",
                          color: selectedNetwork === net ? "#fff" : "rgba(255, 255, 255, 0.6)",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Deposit Address Box */}
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                    {selectedAsset.symbol} ({selectedNetwork}) Deposit Address
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeAddress?.address || "Address available")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: copied ? "#34d399" : "#4F6BFF",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#fff",
                    wordBreak: "break-all",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  {activeAddress?.address || "Loading official address..."}
                </div>
              </div>

              {/* TxHash input */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                  Transaction Hash / TxID (Optional if screenshot uploaded)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0x8a7f... or 5b12..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    color: "#fff",
                    fontSize: "12.5px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* File upload */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                  Payment Screenshot Proof
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "1px dashed rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    padding: "12px",
                    textAlign: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    cursor: "pointer",
                  }}
                >
                  {previewUrl ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#34d399", fontSize: "12px", fontWeight: 600 }}>
                      <FileCheck size={16} />
                      <span>{proofFile?.name || "Payment screenshot attached"}</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "rgba(255, 255, 255, 0.6)", fontSize: "12px" }}>
                      <UploadCloud size={16} />
                      <span>Click to upload payment screenshot</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    marginBottom: "12px",
                    color: "#fca5a5",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStep("CONFIG")}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "#1e2229",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#4F6BFF",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Submitting Payment...</span>
                    </>
                  ) : (
                    <span>Confirm & Pay $1,000</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
