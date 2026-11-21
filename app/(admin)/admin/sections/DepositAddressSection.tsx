"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { X, Loader2, Save, Trash2 } from "lucide-react";
import "@/styles/deposit-addresses.css";
import { FullAddressItem } from "@/app/api/admin/settings/addresses/route";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";

export const COIN_OPTIONS = [
  { symbol: "BTC", name: "Bitcoin", defaultNetwork: "Default" },
  { symbol: "ETH", name: "Ethereum", defaultNetwork: "ERC-20" },
  { symbol: "USDT", name: "Tether USDT", defaultNetwork: "ERC-20" },
  { symbol: "SOL", name: "Solana", defaultNetwork: "Default" },
  { symbol: "XRP", name: "Ripple XRP", defaultNetwork: "Default" },
  { symbol: "USDC", name: "USD Coin", defaultNetwork: "USDC" },
  { symbol: "DOGE", name: "Dogecoin", defaultNetwork: "Default" },
  { symbol: "BNB", name: "Binance Coin", defaultNetwork: "BEP-20" },
  { symbol: "LTC", name: "Litecoin", defaultNetwork: "Default" },
  { symbol: "TRX", name: "Tron", defaultNetwork: "TRC-20" },
  { symbol: "ADA", name: "Cardano", defaultNetwork: "Default" },
  { symbol: "AVAX", name: "Avalanche", defaultNetwork: "Default" },
  { symbol: "DOT", name: "Polkadot", defaultNetwork: "Default" },
  { symbol: "LINK", name: "Chainlink", defaultNetwork: "ERC-20" },
  { symbol: "MATIC", name: "Polygon", defaultNetwork: "Polygon" },
  { symbol: "SHIB", name: "Shiba Inu", defaultNetwork: "ERC-20" },
  { symbol: "TON", name: "Toncoin", defaultNetwork: "Default" },
];

export const NETWORK_OPTIONS = [
  "Default",
  "ERC-20",
  "TRC-20",
  "BEP-20",
  "Solana",
  "Polygon",
  "Arbitrum",
  "USDC",
];

const COIN_ICON_PATHS: Record<string, string> = {
  BTC: "/dashboard_files/BTC.svg",
  BITCOIN: "/dashboard_files/BTC.svg",
  ETH: "/dashboard_files/ETH.svg",
  ETHEREUM: "/dashboard_files/ETH.svg",
  USDT: "/dashboard_files/USDT.svg",
  TETHER: "/dashboard_files/USDT.svg",
  SOL: "/dashboard_files/SOL.svg",
  SOLANA: "/dashboard_files/SOL.svg",
  XRP: "/dashboard_files/XRP.svg",
  RIPPLE: "/dashboard_files/XRP.svg",
  USDC: "/dashboard_files/USDC.svg",
  DOGE: "/dashboard_files/DOGE.svg",
  DOGECOIN: "/dashboard_files/DOGE.svg",
  BNB: "/dashboard_files/binance.svg",
  BINANCE: "/dashboard_files/binance.svg",
  LTC: "/dashboard_files/LTC.svg",
  LITECOIN: "/dashboard_files/LTC.svg",
  TRX: "/dashboard_files/TRX.svg",
  TRON: "/dashboard_files/TRX.svg",
  ADA: "/dashboard_files/ADA.svg",
  CARDANO: "/dashboard_files/ADA.svg",
  AVAX: "/dashboard_files/AVAX.svg",
  AVALANCHE: "/dashboard_files/AVAX.svg",
  BCH: "/dashboard_files/BCH.svg",
  DOT: "/dashboard_files/DOT.svg",
  POLKADOT: "/dashboard_files/DOT.svg",
  LINK: "/dashboard_files/LINK.svg",
  MATIC: "/dashboard_files/MATIC.svg",
  POLYGON: "/dashboard_files/MATIC.svg",
  SHIB: "/dashboard_files/SHIB.svg",
  SHIBA: "/dashboard_files/SHIB.svg",
  TON: "/dashboard_files/TON.svg",
  UNI: "/dashboard_files/UNI.svg",
  UNISWAP: "/dashboard_files/UNI.svg",
  XLM: "/dashboard_files/XLM.svg",
  STELLAR: "/dashboard_files/XLM.svg",
  XMR: "/dashboard_files/XMR.svg",
  MONERO: "/dashboard_files/XMR.svg",
  DASH: "/dashboard_files/DASH.svg",
  ETC: "/dashboard_files/ETC.svg",
  ZEC: "/dashboard_files/ZEC.svg",
};

export function CoinIcon({ symbol }: { symbol: string }) {
  const s = symbol.toUpperCase();
  const iconPath = COIN_ICON_PATHS[s];
  if (iconPath) {
    return <Image src={iconPath} alt={`${s} logo`} width={32} height={32} unoptimized />;
  }
  if (s === "BTC" || s === "BITCOIN") {
    return (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" fill="#f7931a" />
        <path
          d="M21.5 13.5c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.7-1.7-.4-.7 2.7c-.4-.1-.7-.2-1.1-.3l-2.3-.6-.5 1.8s1.2.3 1.2.3c.7.2.8.7.8 1.1l-.8 3.2c.1 0 .1 0 .2.1-.1 0-.1 0-.2-.1l-1.1 4.5c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.9 1.7.4.7-2.8c.5.1.9.2 1.4.3l-.7 2.8 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1.1 2.1-2.7zm-3.8 5.7c-.5 2.1-4 1-5.1.7l.9-3.7c1.1.3 4.8.8 4.2 3zm.5-5.8c-.5 1.9-3.4.9-4.3.7l.8-3.3c.9.2 4 .7 3.5 2.6z"
          fill="#ffffff"
        />
      </svg>
    );
  }
  if (s === "ETH" || s === "ETHEREUM") {
    return (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" fill="#627eea" />
        <path d="M16 4l-.2.7v15.7l.2.2 7.3-4.3z" fill="#ffffff" fillOpacity="0.6" />
        <path d="M16 4L8.7 16.3l7.3 4.3V4z" fill="#ffffff" />
        <path d="M16 21.9l-.1.1v6.2l.1.3 7.3-10.2z" fill="#ffffff" fillOpacity="0.6" />
        <path d="M16 28.5v-6.6l-7.3-3.6z" fill="#ffffff" />
        <path d="M16 20.6l7.3-4.3-7.3-3.3z" fill="#ffffff" fillOpacity="0.2" />
        <path d="M8.7 16.3l7.3 4.3v-7.6z" fill="#ffffff" fillOpacity="0.6" />
      </svg>
    );
  }
  if (s === "USDT" || s === "TETHER") {
    return (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" fill="#26a17b" />
        <path
          d="M17.9 14.8v-1.7h5.1V9.9H9V13h5.1v1.8C9.7 15 6.5 16 6.5 17.2c0 1.2 3.2 2.2 7.6 2.4v5.5h3.8v-5.5c4.4-.2 7.6-1.2 7.6-2.4 0-1.2-3.2-2.2-7.6-2.4zm0 3.7c-2.4.1-4.7 0-6.1-.4.9-.5 2.5-.8 4.2-.8s3.4.3 4.2.8c-1.4.4-3.7.5-6.1.4h3.8z"
          fill="#ffffff"
        />
      </svg>
    );
  }
  if (s === "SOL" || s === "SOLANA") {
    return (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <defs>
          <linearGradient id="solGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#solGrad)" />
        <path
          d="M9.8 19.8c.2-.2.5-.3.8-.3h12.1c.5 0 .8.5.5.9l-1.9 2c-.2.2-.5.3-.8.3H8.4c-.5 0-.8-.5-.5-.9l1.9-2zm0-8c.2-.2.5-.3.8-.3h12.1c.5 0 .8.5.5.9l-1.9 2c-.2.2-.5.3-.8.3H8.4c-.5 0-.8-.5-.5-.9l1.9-2zm12.4 4c-.2-.2-.5-.3-.8-.3H9.3c-.5 0-.8.5-.5.9l1.9 2c.2.2.5.3.8.3h12.1c.5 0 .8-.5.5-.9l1.9-2z"
          fill="#ffffff"
        />
      </svg>
    );
  }
  if (s === "XRP" || s === "RIPPLE") {
    return (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" fill="#000000" />
        <path
          d="M23.1 9h2.3l-5.6 5.5-3.8-3.7-6 5.9h-2.3l8.3-8.1 3.8 3.7L23.1 9zm-14.2 14h-2.3l5.6-5.5 3.8 3.7 6-5.9h2.3l-8.3 8.1-3.8-3.7-3.3 3.3z"
          fill="#ffffff"
        />
      </svg>
    );
  }
  if (s === "USDC") {
    return (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" fill="#2775ca" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#ffffff"
          fontFamily="system-ui"
        >
          $
        </text>
      </svg>
    );
  }
  // Generic coin fallback
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="16" fill="#4763f0" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill="#ffffff"
        fontFamily="monospace"
      >
        {s.slice(0, 3)}
      </text>
    </svg>
  );
}

export default function DepositAddressSection({
  flash,
  isDrawerMode = false,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
  isDrawerMode?: boolean;
}) {
  const [addresses, setAddresses] = useState<FullAddressItem[]>([]);
  const [signalAddresses, setSignalAddresses] = useState<FullAddressItem[]>([]);
  const [useSameAddress, setUseSameAddress] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State (Image 3)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditingSignal, setIsEditingSignal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState(COIN_OPTIONS[0]);
  const [network, setNetwork] = useState("Default");
  const [addressInput, setAddressInput] = useState("");
  const [memoInput, setMemoInput] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/addresses", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
        setSignalAddresses(data.signalAddresses || []);
        setUseSameAddress(!!data.useSameAddressForSignals);
      } else {
        if (!silent) flash("error", "Failed to load deposit addresses.");
      }
    } catch {
      if (!silent) flash("error", "Network error while loading addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const handleToggleSameAddress = async () => {
    const nextVal = !useSameAddress;
    setUseSameAddress(nextVal);
    try {
      const res = await fetch("/api/admin/settings/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleSameAddress", useSameAddress: nextVal }),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      flash("ok", `Signal deposit address set to ${nextVal ? "same as regular" : "custom"}.`);
    } catch (e: any) {
      flash("error", e.message || "Failed to update toggle");
      setUseSameAddress(!nextVal);
    }
  };

  const openAddModal = (forSignal: boolean) => {
    setIsEditingSignal(forSignal);
    setEditId(null);
    setSelectedCoin(COIN_OPTIONS[0]);
    setNetwork("Default");
    setAddressInput("");
    setMemoInput("");
    setQrCodeUrl(null);
    setModalOpen(true);
  };

  const openEditModal = (item: FullAddressItem, forSignal: boolean) => {
    setIsEditingSignal(forSignal);
    setEditId(item.id);
    const coin = COIN_OPTIONS.find((c) => c.symbol === item.symbol) || {
      symbol: item.symbol,
      name: item.token || item.symbol,
      defaultNetwork: item.network,
    };
    setSelectedCoin(coin);
    setNetwork(item.network || "Default");
    setAddressInput(item.address || "");
    setMemoInput(item.memo || "");
    setQrCodeUrl(item.qrCode || null);
    setModalOpen(true);
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setQrCodeUrl(data.url);
      flash("ok", "QR code uploaded successfully.");
    } catch (err: any) {
      flash("error", err.message || "Failed to upload QR code");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async () => {
    if (!addressInput.trim()) {
      flash("error", "Please provide a deposit address.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveAddress",
          isSignal: isEditingSignal,
          addressData: {
            id: editId,
            token: selectedCoin.name,
            symbol: selectedCoin.symbol,
            network: network || "Default",
            address: addressInput.trim(),
            memo: memoInput.trim() || null,
            qrCode: qrCodeUrl,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      flash("ok", `${selectedCoin.name} address saved.`);
      setModalOpen(false);
      loadData();
    } catch (e: any) {
      flash("error", e.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editId) return;
    setConfirmState({
      title: `Delete ${selectedCoin.name} Address?`,
      message: `Are you sure you want to delete this deposit address? Users will no longer be able to deposit to it.`,
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        setSaving(true);
        try {
          const res = await fetch("/api/admin/settings/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "deleteAddress",
              addressId: editId,
              isSignal: isEditingSignal,
            }),
          });
          if (!res.ok) throw new Error("Delete failed");
          flash("ok", "Address deleted.");
          setModalOpen(false);
          loadData();
        } catch (e: any) {
          flash("error", e.message || "Failed to delete");
        } finally {
          setSaving(false);
          setConfirmState(null);
        }
      },
    });
  };

  const handleDirectDelete = (item: FullAddressItem, forSignal: boolean) => {
    const label = item.token || item.symbol;
    setConfirmState({
      title: `Delete ${label} Address?`,
      message: `Are you sure you want to delete this ${label} address (${item.network})?`,
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/settings/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "deleteAddress",
              addressId: item.id,
              isSignal: forSignal,
            }),
          });
          if (!res.ok) throw new Error("Delete failed");
          flash("ok", `${label} address deleted.`);
          loadData();
        } catch (e: any) {
          flash("error", e.message || "Failed to delete address");
        } finally {
          setConfirmState(null);
        }
      },
    });
  };

  return (
    <div className="dep_container" style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* Regular Deposit Addresses (Image 1) */}
      <div>
        {!isDrawerMode && (
          <div className="dep_section_title">
            Deposit Addresses
          </div>
        )}
        <div className="dep_list">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="dep_row" style={{ opacity: 0.7 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ flex: 1, height: 16, borderRadius: 4, background: "rgba(255,255,255,0.08)" }} />
                <div style={{ width: 70, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
              </div>
            ))
          ) : addresses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "rgba(255,255,255,0.4)" }}>
              No deposit addresses configured. Add one below.
            </div>
          ) : (
            addresses.map((item) => (
              <div key={item.id} className="dep_row">
                <div className="dep_coin_icon">
                  <CoinIcon symbol={item.symbol} />
                </div>
                <div className="dep_addr_code" title={item.address}>
                  {item.address}
                </div>
                <span className="dep_badge">
                  {item.network.toUpperCase() === "DEFAULT" ? "DEFAULT" : item.network}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    className="dep_edit_btn"
                    onClick={() => openEditModal(item, false)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="dep_delete_btn"
                    title="Delete address"
                    onClick={() => handleDirectDelete(item, false)}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            className="dep_add_btn"
            onClick={() => openAddModal(false)}
          >
            Add new wallet address
          </button>
        </div>
      </div>

      {/* Signal / Subscription Deposit Addresses (Image 2) */}
      <div style={{ marginTop: "12px" }}>
        <div className="dep_section_title">
          Deposit <span className="dep_section_subtitle">(Signal/Subscription deposit)</span>
        </div>

        <div className="dep_toggle_card">
          <span className="dep_toggle_label">Use the same address as regular deposit</span>
          <button
            type="button"
            role="switch"
            aria-checked={useSameAddress}
            className="app-switch"
            data-on={useSameAddress ? "true" : "false"}
            onClick={handleToggleSameAddress}
          >
            <span />
          </button>
        </div>

        {!useSameAddress && (
          <div style={{ marginTop: "16px" }}>
            <div className="dep_subheading">Addresses:</div>
            <div className="dep_list" style={{ marginTop: "8px" }}>
              {signalAddresses.map((item) => (
                <div key={item.id} className="dep_row">
                  <div className="dep_coin_icon">
                    <CoinIcon symbol={item.symbol} />
                  </div>
                  <div className="dep_addr_code" title={item.address}>
                    {item.address}
                  </div>
                  <span className="dep_badge">
                    {item.network.toUpperCase() === "DEFAULT" ? "DEFAULT" : item.network}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      className="dep_edit_btn"
                      onClick={() => openEditModal(item, true)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="dep_delete_btn"
                      title="Delete address"
                      onClick={() => handleDirectDelete(item, true)}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="dep_add_btn"
                onClick={() => openAddModal(true)}
              >
                Add new wallet address
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Deposit Address Modal (Image 3) */}
      {modalOpen && (
        <div className="dep_modal_backdrop" onClick={() => !saving && setModalOpen(false)}>
          <div className="dep_modal" role="dialog" aria-modal="true" aria-labelledby="deposit-address-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="dep_modal_head">
              <h3 id="deposit-address-modal-title">{editId ? "Edit Deposit Address" : "Add Deposit Address"}</h3>
              <button
                type="button"
                className="dep_modal_close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="dep_modal_body">
              {/* Type / Coin dropdown */}
              <div className="dep_field">
                <label className="dep_field_label">Type:</label>
                <div className="dep_select_wrap" style={{ display: "flex", alignItems: "center", paddingLeft: 12 }}>
                  <CoinIcon symbol={selectedCoin.symbol} />
                  <select
                    className="dep_select"
                    value={selectedCoin.symbol}
                    onChange={(e) => {
                      const c = COIN_OPTIONS.find((opt) => opt.symbol === e.target.value);
                      if (c) {
                        setSelectedCoin(c);
                        setNetwork(c.defaultNetwork);
                      }
                    }}
                  >
                    {COIN_OPTIONS.map((c) => (
                      <option key={c.symbol} value={c.symbol}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Network dropdown */}
              <div className="dep_field">
                <label className="dep_field_label">Network:</label>
                <div className="dep_select_wrap">
                  <select
                    className="dep_select"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                  >
                    {NETWORK_OPTIONS.map((net) => (
                      <option key={net} value={net}>
                        {net}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address input */}
              <div className="dep_field">
                <label className="dep_field_label">Address:</label>
                <input
                  type="text"
                  className="dep_input"
                  placeholder="Your deposit address"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  style={{ fontFamily: "monospace" }}
                />
              </div>

              {/* Memo (optional) input */}
              <div className="dep_field">
                <label className="dep_field_label">Memo (optional):</label>
                <input
                  type="text"
                  className="dep_input"
                  placeholder="3748329"
                  value={memoInput}
                  onChange={(e) => setMemoInput(e.target.value)}
                />
              </div>

              {/* QR Code Upload Box (Image 3) */}
              <div className="dep_field">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleQrUpload}
                />
                <div
                  className="dep_qr_box"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingQr ? (
                    <div style={{ color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 8 }}>
                      <Loader2 size={18} className="spin" /> Uploading QR code...
                    </div>
                  ) : qrCodeUrl ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCodeUrl} alt="QR Code" className="dep_qr_preview" />
                      <button
                        type="button"
                        className="dep_qr_remove"
                        onClick={() => setQrCodeUrl(null)}
                      >
                        Remove QR Code
                      </button>
                    </div>
                  ) : (
                    <p className="dep_qr_text">
                      Tap here to add or change QR code. Leave empty to save address without QR code.
                    </p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                className={`dep_modal_save ${addressInput.trim() ? "active" : ""}`}
                onClick={handleSave}
                disabled={saving || !addressInput.trim()}
              >
                {saving ? <Loader2 size={16} className="spin" /> : null}
                Save
              </button>

              {/* Delete link if editing */}
              {editId && (
                <button
                  type="button"
                  className="dep_delete_link"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Delete this address
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <CustomConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}
