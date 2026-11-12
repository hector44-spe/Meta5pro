"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  X,
  Search,
  Wallet,
  Link as LinkIcon,
  Info,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { DEFAULT_WALLETS, WalletItem } from "@/components/ConnectWalletDrawer";

export default function WalletPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [connectedWallets, setConnectedWallets] = useState<{
    [walletName: string]: { name: string; phrase?: string };
  }>({});
  const [activeModalWallet, setActiveModalWallet] = useState<{
    name: string;
    phrase?: string;
    isNew?: boolean;
  } | null>(null);

  // Modal input state
  const [walletNameInput, setWalletNameInput] = useState("");
  const [seedPhraseInput, setSeedPhraseInput] = useState("");
  const [phraseError, setPhraseError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load connected wallets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("metagold_connected_wallets");
      if (stored) {
        setConnectedWallets(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveWallets = (updated: {
    [walletName: string]: { name: string; phrase?: string };
  }) => {
    setConnectedWallets(updated);
    try {
      localStorage.setItem("metagold_connected_wallets", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeModalWallet) {
        setActiveModalWallet(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalWallet]);

  // Combined wallet list including custom wallets
  const allWallets = useMemo(() => {
    const customWallets = Object.keys(connectedWallets)
      .filter((name) => !DEFAULT_WALLETS.some((w) => w.name.toLowerCase() === name.toLowerCase()))
      .map((name) => ({
        name,
        icon: "",
        isCustom: true,
      }));

    const combined = [...DEFAULT_WALLETS, ...customWallets];

    // Filter by search
    const filtered = combined.filter((w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    // Sort: connected wallets first, then alphabetically
    return filtered.sort((a, b) => {
      const aConnected = !!connectedWallets[a.name];
      const bConnected = !!connectedWallets[b.name];
      if (aConnected && !bConnected) return -1;
      if (!aConnected && bConnected) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [connectedWallets, searchTerm]);

  const handleOpenWalletModal = (walletName: string, isNew = false) => {
    if (isNew) {
      const initialName = searchTerm.trim() ? searchTerm.trim() : "";
      setActiveModalWallet({ name: "new", phrase: "", isNew: true });
      setWalletNameInput(initialName);
      setSeedPhraseInput("");
    } else {
      const existing = connectedWallets[walletName];
      setActiveModalWallet({
        name: walletName,
        phrase: existing?.phrase || "",
        isNew: false,
      });
      setWalletNameInput(walletName);
      setSeedPhraseInput(existing?.phrase || "");
    }
    setPhraseError(false);
  };

  const handleSaveWallet = async () => {
    if (!walletNameInput.trim()) return;

    // Validate 12 or 24 words
    const words = seedPhraseInput.trim().split(/\s+/).filter(Boolean);
    if (words.length < 12) {
      setPhraseError(true);
      return;
    }

    setPhraseError(false);
    setIsSaving(true);

    setTimeout(() => {
      const updated = {
        ...connectedWallets,
        [walletNameInput.trim()]: {
          name: walletNameInput.trim(),
          phrase: seedPhraseInput.trim(),
        },
      };
      saveWallets(updated);
      setIsSaving(false);
      setActiveModalWallet(null);
      showToast("Wallet connected successfully");
    }, 600);
  };

  const handleDisconnectWallet = async () => {
    if (!activeModalWallet || activeModalWallet.isNew) return;

    setIsDisconnecting(true);
    setTimeout(() => {
      const updated = { ...connectedWallets };
      delete updated[activeModalWallet.name];
      saveWallets(updated);
      setIsDisconnecting(false);
      setActiveModalWallet(null);
      showToast("Wallet disconnected successfully");
    }, 600);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "560px",
        margin: "0 auto",
        padding: "24px 16px 80px 16px",
        boxSizing: "border-box",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "rgba(22, 25, 30, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(71, 99, 240, 0.35)",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            zIndex: 100000,
            fontSize: "13.5px",
            fontWeight: 500,
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <CheckCircle2 size={18} color="#4763f0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Link
          href="/assets"
          style={{
            color: "var(--color-text, #ffffff)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "18px",
          }}
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          <span>Connect wallet</span>
        </Link>
      </div>

      {/* Section Content */}
      <div
        style={{
          backgroundColor: "var(--color-modal-background, #14171a)",
          backdropFilter: "blur(120px)",
          border: "1px solid var(--color-box-border, rgba(255, 255, 255, 0.05))",
          borderRadius: "14px",
          padding: "24px 20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Section Titles */}
        <div>
          <div
            style={{
              fontSize: "15px",
              lineHeight: "20px",
              fontWeight: 600,
              color: "var(--color-primary-text, #ffffff)",
              marginBottom: "6px",
            }}
          >
            Connect your wallet
          </div>
          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 400,
              lineHeight: "18px",
              color: "var(--color-text-secondary, #8c95a0)",
            }}
          >
            Connect your wallet to enjoy advanced features. Meta Gold 5 supports 500+ exchanges &
            wallets, NFTs, 10,000+ cryptocurrencies, and 20,000+ DeFi smart contracts.
          </div>
        </div>

        {/* Search Box */}
        <div
          style={{
            height: "42px",
            padding: "0 12px 0 15px",
            backgroundColor: "var(--color-control, rgba(255, 255, 255, 0.03))",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <Search size={16} strokeWidth={1.5} color="#8c95a0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for your wallet"
            style={{
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-text, #ffffff)",
              fontSize: "13.5px",
              fontWeight: 500,
              width: "100%",
            }}
          />
        </div>

        {/* Wallet List */}
        <div
          className="scrollbar-hide"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            maxHeight: "560px",
            overflowY: "auto",
            paddingRight: "2px",
          }}
        >
          {allWallets.map((wallet) => {
            const isConnected = !!connectedWallets[wallet.name];
            return (
              <div
                key={wallet.name}
                onClick={() => handleOpenWalletModal(wallet.name)}
                style={{
                  height: "44px",
                  padding: "0 12px 0 16px",
                  backgroundColor: "var(--color-control, rgba(255, 255, 255, 0.03))",
                  borderRadius: "8px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  transition: "all 150ms ease-in",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-control-hover, rgba(255, 255, 255, 0.06))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-control, rgba(255, 255, 255, 0.03))";
                }}
              >
                {/* Left Label */}
                <label
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "13px",
                    lineHeight: "16px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary, #b7c9e2)",
                  }}
                >
                  {wallet.icon ? (
                    <img
                      src={wallet.icon}
                      alt=""
                      style={{
                        width: "22px",
                        height: "22px",
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Wallet size={20} strokeWidth={1.5} color="#8c95a0" />
                  )}
                  <p style={{ fontWeight: 500, color: "#fff", margin: 0 }}>{wallet.name}</p>
                </label>

                {/* Switch Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenWalletModal(wallet.name);
                  }}
                  style={{
                    border: "1px solid var(--color-card-background-3, rgba(255, 255, 255, 0.08))",
                    outline: "none",
                    position: "relative",
                    minHeight: "26px",
                    minWidth: "44px",
                    backgroundColor: "var(--color-outline, rgba(255, 255, 255, 0.05))",
                    transition: "background-color 0.3s, border-color 0.3s",
                    borderRadius: "5px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      position: "absolute",
                      top: "50%",
                      left: "3px",
                      transform: isConnected
                        ? "translate(18px, -50%)"
                        : "translate(0px, -50%)",
                      backgroundColor: isConnected
                        ? "var(--color-primary, #4763f0)"
                        : "var(--color-control-inactive, #8c95a0)",
                      minWidth: "20px",
                      minHeight: "20px",
                      borderRadius: "4px",
                      transition: "transform 0.3s ease-out, background-color 0.3s",
                    }}
                  />
                </button>
              </div>
            );
          })}

          {/* Add New Wallet Button */}
          <div
            onClick={() => handleOpenWalletModal("new", true)}
            style={{
              height: "44px",
              padding: "0 12px 0 16px",
              backgroundColor: "var(--color-control-active, rgba(255, 255, 255, 0.075))",
              borderRadius: "8px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box",
              cursor: "pointer",
              transition: "all 150ms ease-in",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-control-hover, rgba(255, 255, 255, 0.1))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-control-active, rgba(255, 255, 255, 0.075))";
            }}
          >
            <label
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <LinkIcon size={16} strokeWidth={1.5} color="#8c95a0" />
              <p style={{ fontWeight: 500, color: "#fff", margin: 0, fontSize: "12.5px" }}>
                {searchTerm && allWallets.length === 0
                  ? `Add "${searchTerm}"`
                  : "Add new wallet"}
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* Connect Wallet Modal Dialog */}
      {activeModalWallet && (
        <div
          onClick={() => setActiveModalWallet(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",
              backgroundColor: "var(--color-modal-background, #16181d)",
              backdropFilter: "blur(120px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxSizing: "border-box",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
              animation: "fadeSlideIn 0.3s ease-out forwards",
            }}
          >
            {/* Modal Top */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: "18px",
                  fontWeight: 600,
                  color: "var(--color-text, #ffffff)",
                  margin: 0,
                }}
              >
                Connect wallet
              </p>
              <button
                onClick={() => setActiveModalWallet(null)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-secondary, #8c95a0)",
                  cursor: "pointer",
                  display: "grid",
                  placeContent: "center",
                  width: "24px",
                  height: "24px",
                  borderRadius: "4px",
                  padding: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Description */}
            <p
              style={{
                fontSize: "13px",
                lineHeight: "17px",
                fontWeight: 500,
                color: "var(--color-text-secondary, #8c95a0)",
                margin: 0,
              }}
            >
              Connect your wallet to start trading, investing and earning.
            </p>

            {/* Wallet Name Field */}
            <div style={{ display: "grid", gap: "6px" }}>
              <label
                style={{
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 500,
                  color: "var(--color-text-secondary, #8c95a0)",
                }}
              >
                {activeModalWallet.isNew ? "Name of wallet:" : "Wallet:"}
              </label>
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px 12px",
                  backgroundColor: "var(--color-input, rgba(255, 255, 255, 0.03))",
                  border: "1px solid var(--color-input-border, rgba(255, 255, 255, 0.06))",
                }}
              >
                <input
                  type="text"
                  value={walletNameInput}
                  onChange={(e) => setWalletNameInput(e.target.value)}
                  placeholder={
                    activeModalWallet.isNew ? "Your wallet name" : activeModalWallet.name
                  }
                  readOnly={!activeModalWallet.isNew}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>

            {/* Seed Phrase Field */}
            <div style={{ display: "grid", gap: "6px" }}>
              <label
                style={{
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 500,
                  color: "var(--color-text-secondary, #8c95a0)",
                }}
              >
                Seed phrase:
              </label>
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px 12px",
                  backgroundColor: "var(--color-input, rgba(255, 255, 255, 0.03))",
                  border: phraseError
                    ? "1px solid #ff3344"
                    : "1px solid var(--color-input-border, rgba(255, 255, 255, 0.06))",
                  transition: "border 150ms ease-in-out",
                }}
              >
                <textarea
                  rows={5}
                  value={seedPhraseInput}
                  onChange={(e) => {
                    setSeedPhraseInput(e.target.value);
                    if (phraseError) setPhraseError(false);
                  }}
                  placeholder={`Your ${
                    activeModalWallet.isNew ? "wallet" : activeModalWallet.name
                  } seed phrase`}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: "13px",
                    resize: "none",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                  }}
                />
              </div>

              {/* Error Message */}
              {phraseError && (
                <div
                  style={{
                    color: "#ff3344",
                    fontSize: "12px",
                    lineHeight: "16px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "2px",
                  }}
                >
                  <Info size={12} color="#ff3344" />
                  <span>Please enter a valid 12 or 24-word seed phrase</span>
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={handleDisconnectWallet}
                disabled={
                  isDisconnecting ||
                  activeModalWallet.isNew ||
                  !connectedWallets[activeModalWallet.name]
                }
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 51, 68, 0.08)",
                  border: "1px solid rgba(255, 51, 68, 0.25)",
                  color: "#ff3344",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor:
                    isDisconnecting ||
                    activeModalWallet.isNew ||
                    !connectedWallets[activeModalWallet.name]
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isDisconnecting ||
                    activeModalWallet.isNew ||
                    !connectedWallets[activeModalWallet.name]
                      ? 0.4
                      : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "100px",
                }}
              >
                {isDisconnecting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>Disconnect</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveWallet}
                disabled={isSaving || !walletNameInput.trim() || !seedPhraseInput.trim()}
                style={{
                  padding: "8px 22px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-primary, #4763f0)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor:
                    isSaving || !walletNameInput.trim() || !seedPhraseInput.trim()
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isSaving || !walletNameInput.trim() || !seedPhraseInput.trim()
                      ? 0.5
                      : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "90px",
                }}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
