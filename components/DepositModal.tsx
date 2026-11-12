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
} from "lucide-react";
import "@/styles/deposit-modal.css";

export interface DepositAddressItem {
  id: string;
  token: string;
  symbol: string;
  network: string;
  address: string;
  memo: string | null;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Token pricing mapping for USD estimation
const TOKEN_PRICES: Record<string, number> = {
  BTC: 86450,
  ETH: 2680,
  USDT: 1.0,
  USDC: 1.0,
  SOL: 185,
  XRP: 1.45,
};

// Supported tokens with their designated networks
const SUPPORTED_TOKENS = [
  { name: "Ripple", symbol: "XRP", networks: ["XRP"] },
  { name: "Ethereum", symbol: "ETH", networks: ["ERC-20"] },
  { name: "USD Coin", symbol: "USDC", networks: ["ERC-20", "BEP-20", "Solana"] },
  { name: "Tether", symbol: "USDT", networks: ["TRC-20", "BEP-20", "ERC-20"] },
  { name: "Solana", symbol: "SOL", networks: ["Solana"] },
  { name: "Bitcoin", symbol: "BTC", networks: ["Bitcoin"] },
];

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  // Navigation step: "METHOD" (Image 1) -> "STEPPER" (Images 2 & 3) -> "CONFIRMATION" (Image 4)
  const [step, setStep] = useState<"METHOD" | "STEPPER" | "CONFIRMATION" | "SUCCESS">("METHOD");

  // Stepper selections
  const [addresses, setAddresses] = useState<DepositAddressItem[]>([]);
  const [selectedToken, setSelectedToken] = useState<typeof SUPPORTED_TOKENS[0] | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  // Address & Copy
  const [activeAddress, setActiveAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Confirmation form (Image 4)
  const [amountInput, setAmountInput] = useState<string>("100");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset or fetch addresses on open
  useEffect(() => {
    if (isOpen) {
      setStep("METHOD");
      setSelectedToken(null);
      setSelectedNetwork("");
      setActiveAddress("");
      setAmountInput("100");
      setProofFile(null);
      setPreviewUrl(null);
      setErrorMessage("");
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/settings/addresses");
      if (res.ok) {
        const data = await res.json();
        if (data.addresses) {
          setAddresses(data.addresses);
        }
      }
    } catch (e) {
      console.error("Error fetching deposit addresses:", e);
    }
  };

  // Automatically lookup designated address when token & network are chosen (Image 3)
  useEffect(() => {
    if (selectedToken && selectedNetwork) {
      const found = addresses.find(
        (a) =>
          a.symbol.toUpperCase() === selectedToken.symbol.toUpperCase() &&
          a.network.toUpperCase() === selectedNetwork.toUpperCase()
      );
      if (found) {
        setActiveAddress(found.address);
      } else {
        // Fallback default
        setActiveAddress("0x71C6944e5B889498b31B5c26b65389Da205f14E7");
      }
    } else {
      setActiveAddress("");
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
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const calculateUSDValue = () => {
    if (!selectedToken) return "$0.00";
    const num = parseFloat(amountInput) || 0;
    const rate = TOKEN_PRICES[selectedToken.symbol] || 1.0;
    const total = num * rate;
    return `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const numAmount = parseFloat(amountInput);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid deposit amount.");
      return;
    }

    if (!proofFile) {
      setErrorMessage("Please upload your transfer screenshot proof before proceeding.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Upload screenshot
      const formData = new FormData();
      formData.append("file", proofFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error || "Screenshot upload failed");
      }

      const { url: receiptUrl } = await uploadRes.json();

      // 2. Submit deposit transaction
      const depositRes = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          currency: selectedToken?.symbol || "USDT",
          network: selectedNetwork,
          cryptoAddress: activeAddress,
          receiptUrl,
        }),
      });

      if (!depositRes.ok) {
        const errData = await depositRes.json();
        throw new Error(errData.error || "Deposit recording failed");
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
            STEP 0: METHOD SELECTION (IMAGE 1)
            ==================================================================== */}
        {step === "METHOD" && (
          <div>
            <div className="dm-header">
              <h2 className="dm-title">Make a deposit</h2>
              <button type="button" className="dm-close-btn" onClick={onClose}>
                <X size={19} />
              </button>
            </div>
            <p className="dm-subtitle">
              To make a deposit, choose your preferred method, and click on the continue button.
            </p>

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
                <span className="dm-limit-val">$100</span>
              </div>
              <div className="dm-limit-row">
                <span className="dm-limit-label">Maximum deposit</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">$100,000</span>
              </div>
            </div>

            <button
              type="button"
              className="dm-primary-btn"
              onClick={() => setStep("STEPPER")}
            >
              Continue
            </button>
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
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="dm-title">Crypto deposit</h2>
              </div>
              <button type="button" className="dm-close-btn" onClick={onClose}>
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
                        <span
                          className="dm-tag-clear"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedToken(null);
                            setSelectedNetwork("");
                          }}
                        >
                          ✕
                        </span>
                        <span>{selectedToken.name}</span>
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
                            setSelectedNetwork(t.networks[0]); // default to first network
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
                      <span>Select token to deposit</span>
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

              {/* STEP 3: Deposit details (IMAGE 3) */}
              <div className={`dm-step-item ${activeAddress ? "active" : ""}`}>
                <div className="dm-step-indicator">3</div>
                <div className="dm-step-content">
                  <div className="dm-step-title">Deposit details</div>

                  {activeAddress ? (
                    <div className="dm-address-box">
                      <span className="dm-address-text">{activeAddress}</span>
                      <div className="dm-address-actions">
                        <button
                          type="button"
                          className="dm-icon-action-btn"
                          onClick={handleCopyAddress}
                          title="Copy Address"
                        >
                          {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        background: "#101217",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    />
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

            <button
              type="button"
              className="dm-primary-btn"
              disabled={!selectedToken || !selectedNetwork || !activeAddress}
              onClick={() => setStep("CONFIRMATION")}
            >
              Continue
            </button>
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
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="dm-title">Confirmation</h2>
              </div>
              <button type="button" className="dm-close-btn" onClick={onClose}>
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
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="dm-amount-input"
                  placeholder="0.00"
                  required
                />
                <span className="dm-currency-pill">
                  <span style={{ color: "rgba(255, 255, 255, 0.4)", cursor: "pointer" }} onClick={() => setAmountInput("")}>✕</span>
                  <span>{selectedToken?.symbol || "USD"}</span>
                </span>
              </div>
            </div>

            {/* Metadata Rows */}
            <div className="dm-limits-box" style={{ margin: "14px 0" }}>
              <div className="dm-limit-row">
                <span className="dm-limit-label">Current {selectedToken?.symbol} balance</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">0 {selectedToken?.symbol}</span>
              </div>
              <div className="dm-limit-row">
                <span className="dm-limit-label">Minimum deposit</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">$100.00</span>
              </div>
              <div className="dm-limit-row">
                <span className="dm-limit-label">Maximum deposit</span>
                <span className="dm-limit-dots"></span>
                <span className="dm-limit-val">$100,000.00</span>
              </div>
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

            <button
              type="submit"
              className="dm-primary-btn"
              disabled={isSubmitting || !proofFile}
              style={{ backgroundColor: isSubmitting ? "#2563eb" : "#4b5563" }}
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
          </form>
        )}

        {/* ====================================================================
            SUCCESS CONFIRMATION
            ==================================================================== */}
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
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
              Deposit Proof Submitted!
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: "24px" }}>
              Your deposit transaction of {amountInput} {selectedToken?.symbol} has been queued. Our administrative team will verify your uploaded screenshot and credit your balance shortly.
            </p>
            <button
              type="button"
              className="dm-primary-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
