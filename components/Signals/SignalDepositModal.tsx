"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  ChevronDown,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import "@/styles/deposit-modal.css";
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

const SUPPORTED_ASSETS = [
  { name: "Tether", symbol: "USDT", networks: ["TRC-20", "ERC-20", "BEP-20"] },
  { name: "Bitcoin", symbol: "BTC", networks: ["Bitcoin"] },
  { name: "Ethereum", symbol: "ETH", networks: ["ERC-20"] },
  { name: "Solana", symbol: "SOL", networks: ["Solana"] },
  { name: "USD Coin", symbol: "USDC", networks: ["ERC-20", "Solana", "BEP-20"] },
];

interface SignalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: {
    id: string;
    title: string;
    strength: number;
    price: number;
  } | null;
  amount: number;
  onSuccess: (result: any) => void;
}

export default function SignalDepositModal({
  isOpen,
  onClose,
  signal,
  amount,
  onSuccess,
}: SignalDepositModalProps) {
  const [addresses, setAddresses] = useState<DepositAddressItem[]>([]);
  const [selectedAsset, setSelectedAsset] = useState(SUPPORTED_ASSETS[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(SUPPORTED_ASSETS[0].networks[0]);
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [activeAddress, setActiveAddress] = useState<DepositAddressItem | null>(null);

  const [txHash, setTxHash] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [memoCopied, setMemoCopied] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [receipt, setReceipt] = useState<{
    reference: string;
    signalTitle: string;
    units: number;
    symbol: string;
    network: string;
    usdAmount: number;
    submittedAt: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTxHash("");
      setProofFile(null);
      setPreviewUrl(null);
      setErrorMessage("");
      setReceipt(null);
      setSelectedAsset(SUPPORTED_ASSETS[0]);
      setSelectedNetwork(SUPPORTED_ASSETS[0].networks[0]);
      setTokenDropdownOpen(false);
      setNetworkDropdownOpen(false);
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/settings/addresses", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const combined = [
          ...(Array.isArray(data.signalAddresses) && data.signalAddresses.length > 0
            ? data.signalAddresses
            : []),
          ...(Array.isArray(data.addresses) ? data.addresses : []),
        ];
        setAddresses(combined);
      }
    } catch (e) {
      console.error("Failed to load deposit addresses:", e);
    } finally {
      setLoadingAddresses(false);
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

  if (!isOpen || !signal) return null;

  const handleCopy = (text: string, isMemo = false) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
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
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File exceeds 10MB size limit.");
        return;
      }
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!proofFile && !txHash.trim()) {
      setErrorMessage("Please upload your transfer screenshot proof before proceeding.");
      return;
    }

    setSubmitting(true);

    try {
      let receiptUrl = "";
      if (proofFile) {
        const fileToUpload = await compressScreenshot(proofFile);
        const formData = new FormData();
        formData.append("file", fileToUpload);
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

      const res = await fetch("/api/signals/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalId: signal.id,
          signalTitle: signal.title,
          strength: signal.strength,
          amount,
          currency: selectedAsset.symbol,
          network: selectedNetwork,
          txHash: txHash.trim() || undefined,
          receiptUrl: receiptUrl || undefined,
          cryptoAddress: activeAddress?.address || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signal deposit submission failed.");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("balance-changed"));
        window.dispatchEvent(new Event("notifications-updated"));
      }

      setReceipt({
        reference: data.signal?.ref || `SIG-${Date.now().toString().slice(-6)}`,
        signalTitle: signal.title,
        units: Number(amount || signal.price),
        symbol: selectedAsset.symbol,
        network: selectedNetwork,
        usdAmount: Number(amount || signal.price),
        submittedAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      });

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process signal deposit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dm-backdrop" onClick={onClose}>
      <div className="dm-card signal-deposit-modal" onClick={(e) => e.stopPropagation()}>
        {receipt ? (
          /* ====================================================================
             SUCCESS CONFIRMATION (Matching Normal Deposit Modal)
             ==================================================================== */
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
              Your signal deposit has been submitted. We&apos;ll confirm the payment and activate your signal automatically.
            </p>
            <div className="dm-limits-box" style={{ textAlign: "left", marginBottom: "20px" }}>
              {[
                ["Reference", receipt.reference],
                ["Signal package", receipt.signalTitle],
                ["Network", `${receipt.symbol} (${receipt.network})`],
                ["Deposit value", `$${receipt.usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`],
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
            <button
              type="button"
              className="dm-primary-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          /* ====================================================================
             CRYPTO DEPOSIT STEPPER FORM (Matching Normal Deposit Modal)
             ==================================================================== */
          <div>
            {/* Header */}
            <div className="dm-header">
              <div className="dm-header-left">
                <h2 className="dm-title">Crypto deposit</h2>
              </div>
              <button
                type="button"
                className="dm-close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>
            <p className="dm-subtitle">
              To proceed, select your token and network, make payment to the address shown and click on the continue button.
            </p>

            {/* Signal Context Pill */}
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
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                  {signal.title}
                </div>
                <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 600, marginTop: "2px" }}>
                  {signal.strength}% Confidence Strength
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "#3b82f6" }}>
                  ${Number(amount || signal.price).toLocaleString()}.00
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                  Fresh direct deposit
                </div>
              </div>
            </div>

            {/* Policy Notice */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(52, 211, 153, 0.08)",
                border: "1px solid rgba(52, 211, 153, 0.2)",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#d1fae5",
              }}
            >
              <ShieldCheck size={16} color="#34d399" style={{ flexShrink: 0 }} />
              <span>
                Signals must be purchased via a <strong>fresh deposit</strong> and will not deduct from your existing trading balance.
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Stepper matching DepositModal */}
              <div className="dm-stepper">
                {/* STEP 1: Select token to deposit */}
                <div className={`dm-step-item ${selectedAsset ? "completed" : "active"}`}>
                  <div className="dm-step-indicator">
                    {selectedAsset ? <Check size={14} strokeWidth={2.5} /> : "1"}
                  </div>
                  <div className="dm-step-content" style={{ position: "relative" }}>
                    <div className="dm-step-title">Select token to deposit</div>

                    <div
                      className={`dm-select-trigger ${selectedAsset ? "selected" : ""}`}
                      onClick={() => setTokenDropdownOpen(!tokenDropdownOpen)}
                    >
                      {selectedAsset ? (
                        <span className="dm-tag-badge">
                          <span>{selectedAsset.name}</span>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "4px" }}>
                            ({selectedAsset.symbol})
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Select token</span>
                      )}
                      <ChevronDown size={16} color="rgba(255, 255, 255, 0.45)" />
                    </div>

                    {tokenDropdownOpen && (
                      <div className="dm-dropdown-menu">
                        {SUPPORTED_ASSETS.map((t) => (
                          <div
                            key={t.symbol}
                            className="dm-dropdown-item"
                            onClick={() => {
                              setSelectedAsset(t);
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
                <div className={`dm-step-item ${selectedNetwork ? "completed" : selectedAsset ? "active" : ""}`}>
                  <div className="dm-step-indicator">
                    {selectedNetwork ? <Check size={14} strokeWidth={2.5} /> : "2"}
                  </div>
                  <div className="dm-step-content" style={{ position: "relative" }}>
                    <div className="dm-step-title">Select network</div>

                    <div
                      className={`dm-select-trigger ${!selectedAsset ? "disabled" : selectedNetwork ? "selected" : ""}`}
                      onClick={() => {
                        if (selectedAsset) setNetworkDropdownOpen(!networkDropdownOpen);
                      }}
                    >
                      {selectedNetwork ? (
                        <span style={{ fontWeight: 500, color: "#fff" }}>{selectedNetwork}</span>
                      ) : (
                        <span>Select network</span>
                      )}
                      <ChevronDown size={16} color="rgba(255, 255, 255, 0.45)" />
                    </div>

                    {networkDropdownOpen && selectedAsset && (
                      <div className="dm-dropdown-menu">
                        {selectedAsset.networks.map((net) => (
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

                    {activeAddress?.qrCode && (
                      <div style={{ textAlign: "center", marginBottom: "12px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeAddress.qrCode}
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
                      <span className="dm-address-text">
                        {loadingAddresses
                          ? "Loading deposit address..."
                          : activeAddress?.address || "Address available on confirmation"}
                      </span>
                      <div className="dm-address-actions">
                        <button
                          type="button"
                          className="dm-icon-action-btn"
                          onClick={() => handleCopy(activeAddress?.address || "")}
                          title="Copy address"
                        >
                          {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    {activeAddress?.memo && (
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
                        <span style={{ fontFamily: "monospace", color: "#f5a524", fontWeight: 600 }}>
                          {activeAddress.memo}
                        </span>
                        <button
                          type="button"
                          className="dm-icon-action-btn"
                          onClick={() => handleCopy(activeAddress.memo || "", true)}
                          title="Copy memo"
                        >
                          {memoCopied ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 4: Deposit confirmation */}
                <div className="dm-step-item active">
                  <div className="dm-step-indicator">4</div>
                  <div className="dm-step-content">
                    <div className="dm-step-title">Deposit confirmation</div>

                    {/* Transaction Hash Input */}
                    <div style={{ marginBottom: "12px" }}>
                      <label className="dm-field-label" style={{ fontSize: "12px", marginBottom: "6px" }}>
                        Transaction Hash / TxID (Optional)
                      </label>
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
                    <div>
                      <label className="dm-field-label" style={{ fontSize: "12px", marginBottom: "6px" }}>
                        Payment proof:
                      </label>
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
                  </div>
                </div>
              </div>

              {/* Total Deposit Value Row */}
              <div className="dm-total-value-row">
                <span className="dm-total-label">Total deposit value</span>
                <span className="dm-total-amount">
                  ${Number(amount || signal.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
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

              <div className="dm-action-footer">
                <button
                  type="submit"
                  className="dm-primary-btn"
                  disabled={submitting}
                >
                  {submitting ? (
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
          </div>
        )}
      </div>
    </div>
  );
}
