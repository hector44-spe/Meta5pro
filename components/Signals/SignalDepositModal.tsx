"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  Zap,
  ShieldCheck,
} from "lucide-react";

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
  const [activeAddress, setActiveAddress] = useState<DepositAddressItem | null>(null);

  const [txHash, setTxHash] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [memoCopied, setMemoCopied] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTxHash("");
      setProofFile(null);
      setPreviewUrl(null);
      setErrorMessage("");
      setSelectedAsset(SUPPORTED_ASSETS[0]);
      setSelectedNetwork(SUPPORTED_ASSETS[0].networks[0]);
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/settings/addresses");
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
        setErrorMessage("File exceeds 5MB size limit.");
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
      setErrorMessage("Please upload a payment proof screenshot or provide a transaction hash.");
      return;
    }

    setSubmitting(true);

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

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process signal deposit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#0f1216",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          padding: "24px",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "rgba(79, 107, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="#4F6BFF" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                Fresh Deposit for Signal
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                Paid separately via direct deposit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Signal Summary Pill */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{signal.title}</div>
            <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 600, marginTop: "2px" }}>
              {signal.strength}% Confidence Strength
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#4F6BFF" }}>
              ${Number(amount || signal.price).toLocaleString()}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
              One-time allocation
            </div>
          </div>
        </div>

        {/* Policy notice */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            backgroundColor: "rgba(52, 211, 153, 0.08)",
            border: "1px solid rgba(52, 211, 153, 0.2)",
            borderRadius: "8px",
            padding: "10px 12px",
            marginBottom: "18px",
            fontSize: "12px",
            color: "#d1fae5",
          }}
        >
          <ShieldCheck size={16} color="#34d399" style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            Signals must be purchased via a <strong>fresh deposit</strong>. This payment is kept independent and will not deduct from your wallet balance.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Asset Selector */}
          <div style={{ marginBottom: "14px" }}>
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
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
                Select Network
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {selectedAsset.networks.map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setSelectedNetwork(net)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: selectedNetwork === net ? "1px solid #4F6BFF" : "1px solid rgba(255, 255, 255, 0.08)",
                      backgroundColor: selectedNetwork === net ? "rgba(79, 107, 255, 0.15)" : "rgba(255, 255, 255, 0.02)",
                      color: selectedNetwork === net ? "#fff" : "rgba(255, 255, 255, 0.6)",
                      fontSize: "11.5px",
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

          {/* Deposit Address Display */}
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                {selectedAsset.symbol} ({selectedNetwork}) Deposit Address
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeAddress?.address || "Contact Support")}
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
                fontSize: "12.5px",
                color: "#fff",
                wordBreak: "break-all",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.04)",
              }}
            >
              {loadingAddresses ? "Loading deposit address..." : activeAddress?.address || "Address available on confirmation"}
            </div>

            {activeAddress?.memo && (
              <div style={{ marginTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>Memo / Destination Tag</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeAddress.memo || "", true)}
                    style={{ background: "transparent", border: "none", color: memoCopied ? "#34d399" : "#4F6BFF", fontSize: "11px", cursor: "pointer" }}
                  >
                    {memoCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#fff", backgroundColor: "rgba(255, 255, 255, 0.03)", padding: "6px 8px", borderRadius: "6px" }}>
                  {activeAddress.memo}
                </div>
              </div>
            )}
          </div>

          {/* TxHash or Proof Screenshot */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
              Transaction Hash / TxID (Optional if uploading screenshot)
            </label>
            <input
              type="text"
              placeholder="e.g. 0x4f8a... or 7f12..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                color: "#fff",
                fontSize: "13px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
              Payment Proof Screenshot
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
                padding: "14px",
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              {previewUrl ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#34d399", fontSize: "13px", fontWeight: 600 }}>
                  <FileCheck size={18} />
                  <span>{proofFile?.name || "Payment screenshot attached"}</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "rgba(255, 255, 255, 0.6)", fontSize: "12.5px" }}>
                  <UploadCloud size={18} />
                  <span>Click to upload payment screenshot (PNG, JPG)</span>
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "14px",
                color: "#fca5a5",
                fontSize: "12.5px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "#1e2229",
                color: "#fff",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2,
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#4F6BFF",
                color: "#fff",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting Deposit...</span>
                </>
              ) : (
                <span>Confirm & Submit Deposit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
