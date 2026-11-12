"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import coldStorageAssetsData from "@/data/coldStorageAssetsData.json";
import "@/styles/cold-storage-page.css";

interface ColdAsset {
  id: number;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  formattedPrice: string;
  inWallet: number;
  currentValue: number;
}

interface StoredAsset {
  symbol: string;
  name: string;
  icon: string;
  amount: number;
  price: number;
}

const COLD_STORAGE_QUESTIONS = [
  {
    id: 1,
    title: "What is cold storage?",
    content:
      "Cold storage is an offline wallet used for storing cryptocurrencies. Unlike regular hot wallets, cold storage is not connected to the internet, providing enhanced security against online threats, hacking, and unauthorized access.",
  },
  {
    id: 2,
    title: "How does cold storage work?",
    content:
      "When you move your assets into cold storage, they are transferred to secure offline vaults. You can deposit your crypto assets from your trading wallet into cold storage at any time for long-term safekeeping, and withdraw them back to your trading balance whenever you wish to trade.",
  },
  {
    id: 3,
    title: "Benefits of cold storage",
    content:
      "Enhanced security with offline private keys protection, immunity from online cyberattacks and exchange vulnerabilities, peace of mind for long-term holdings, and complete control over your crypto assets.",
  },
  {
    id: 4,
    title: "Important notes",
    content:
      "Cold storage assets do not generate trading margin and cannot be used simultaneously in active trades. Withdrawals from cold storage to your trading wallet may require internal confirmation and security verification.",
  },
];

// Helper to format currency values ($0 when zero)
function formatCurrency(val: number): string {
  if (!val || val === 0) return "$0";
  return `$${val.toLocaleString("en-US", {
    minimumFractionDigits: val < 1 && val > 0 ? 2 : 2,
    maximumFractionDigits: val < 1 && val > 0 ? 6 : 2,
  })}`;
}

// Helper to format crypto quantities (0 SYMBOL when zero)
function formatCryptoAmount(val: number, symbol: string): string {
  if (!val || val === 0) return `0 ${symbol}`;
  return `${val.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${symbol}`;
}

export default function ColdStoragePage() {
  const { currentBalance, hideBalance, setHideBalance } = useDashboard();

  // Tab Switching ("Assets" and "How it works")
  const [activeTab, setActiveTab] = useState<"assets" | "how_it_works">("assets");
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({
    left: "3px",
    width: "72px",
  });

  const assetsTabRef = useRef<HTMLButtonElement>(null);
  const howItWorksTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTab === "assets" && assetsTabRef.current) {
      setTabIndicatorStyle({
        left: `${assetsTabRef.current.offsetLeft}px`,
        width: `${assetsTabRef.current.offsetWidth}px`,
      });
    } else if (activeTab === "how_it_works" && howItWorksTabRef.current) {
      setTabIndicatorStyle({
        left: `${howItWorksTabRef.current.offsetLeft}px`,
        width: `${howItWorksTabRef.current.offsetWidth}px`,
      });
    }
  }, [activeTab]);

  // How it works accordion
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  // User's cold storage assets list (default empty array matching original)
  const [userColdAssets, setUserColdAssets] = useState<StoredAsset[]>([]);

  // Calculate total cold storage portfolio value
  const totalColdStorageValue = useMemo(() => {
    return userColdAssets.reduce((sum, item) => sum + item.amount * item.price, 0);
  }, [userColdAssets]);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<"select" | "asset" | "deposit" | "withdraw">("select");
  const [selectedAsset, setSelectedAsset] = useState<ColdAsset | null>(null);
  const [openedFromAddButton, setOpenedFromAddButton] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Deposit / Withdraw wizard state
  const [step, setStep] = useState<1 | 2>(1);
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    action: "deposit" | "withdraw";
    amount: number;
    symbol: string;
    usdValue: number;
  } | null>(null);

  // Filtered asset catalog for "Select asset" drawer
  const availableAssets = useMemo(() => {
    return (coldStorageAssetsData as ColdAsset[])
      .filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery]);

  // Open "Select asset" drawer
  const handleOpenAddAsset = () => {
    setOpenedFromAddButton(true);
    setSearchQuery("");
    setDrawerView("select");
    setDrawerOpen(true);
  };

  const handleSelectAsset = (asset: ColdAsset) => {
    setSelectedAsset(asset);
    setDrawerView("asset");
  };

  const handleRowClick = (stored: StoredAsset) => {
    const fullAsset = (coldStorageAssetsData as ColdAsset[]).find(
      (a) => a.symbol === stored.symbol
    );
    if (fullAsset) {
      setSelectedAsset(fullAsset);
      setOpenedFromAddButton(false);
      setDrawerView("asset");
      setDrawerOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setStep(1);
    setAmountInput("");
    setAmountError(null);
  };

  const handleBackDrawer = () => {
    if (drawerView === "deposit" || drawerView === "withdraw") {
      if (step === 2) {
        setStep(1);
      } else {
        setDrawerView("asset");
      }
    } else if (drawerView === "asset") {
      if (openedFromAddButton) {
        setDrawerView("select");
      } else {
        handleCloseDrawer();
      }
    } else if (drawerView === "select") {
      handleCloseDrawer();
    }
  };

  // Find user's stored balance for the selected asset
  const selectedStoredBalance = useMemo(() => {
    if (!selectedAsset) return 0;
    const found = userColdAssets.find((a) => a.symbol === selectedAsset.symbol);
    return found ? found.amount : 0;
  }, [selectedAsset, userColdAssets]);

  // Available trading wallet balance
  const availableTradingBalance = useMemo(() => {
    if (!selectedAsset || selectedAsset.price <= 0) return 0;
    return currentBalance / selectedAsset.price;
  }, [selectedAsset, currentBalance]);

  // Validations for deposit/withdraw amount
  const handleAmountChange = (val: string) => {
    setAmountInput(val);
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }
    if (drawerView === "deposit") {
      if (num > availableTradingBalance && availableTradingBalance > 0) {
        setAmountError("Insufficient balance in trading wallet");
        return;
      }
    } else if (drawerView === "withdraw") {
      if (num > selectedStoredBalance) {
        setAmountError("Insufficient balance in cold storage");
        return;
      }
    }
    setAmountError(null);
  };

  // Calculated USD value for input amount ($0 when 0)
  const calculatedUsdValue = useMemo(() => {
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0 || !selectedAsset) return 0;
    return num * selectedAsset.price;
  }, [amountInput, selectedAsset]);

  // Confirm Deposit
  const handleConfirmDeposit = async () => {
    if (!selectedAsset) return;
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setUserColdAssets((prev) => {
        const existing = prev.find((a) => a.symbol === selectedAsset.symbol);
        if (existing) {
          return prev.map((a) =>
            a.symbol === selectedAsset.symbol
              ? { ...a, amount: a.amount + num }
              : a
          );
        } else {
          return [
            ...prev,
            {
              symbol: selectedAsset.symbol,
              name: selectedAsset.name,
              icon: selectedAsset.icon,
              amount: num,
              price: selectedAsset.price,
            },
          ];
        }
      });

      setIsSubmitting(false);
      setDrawerOpen(false);
      setSuccessDetails({
        action: "deposit",
        amount: num,
        symbol: selectedAsset.symbol,
        usdValue: num * selectedAsset.price,
      });
      setShowSuccessModal(true);
      setStep(1);
      setAmountInput("");
    }, 1200);
  };

  // Confirm Withdrawal
  const handleConfirmWithdraw = async () => {
    if (!selectedAsset) return;
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setUserColdAssets((prev) => {
        return prev
          .map((a) => {
            if (a.symbol === selectedAsset.symbol) {
              const remaining = a.amount - num;
              return remaining > 0 ? { ...a, amount: remaining } : null;
            }
            return a;
          })
          .filter(Boolean) as StoredAsset[];
      });

      setIsSubmitting(false);
      setDrawerOpen(false);
      setSuccessDetails({
        action: "withdraw",
        amount: num,
        symbol: selectedAsset.symbol,
        usdValue: num * selectedAsset.price,
      });
      setShowSuccessModal(true);
      setStep(1);
      setAmountInput("");
    }, 1200);
  };

  // TradingView Mini Chart
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (drawerView !== "asset" || !selectedAsset || !drawerOpen) return;
    const container = chartRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: `BINANCE:${selectedAsset.symbol}USDT`,
      width: "100%",
      height: 330,
      locale: "en",
      dateRange: "1M",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
      chartOnly: true,
      noTimeScale: false,
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [drawerView, selectedAsset, drawerOpen]);

  return (
    <div className="cold-storage-page-wrapper">
      <div className="cold-storage-content-card scrollbar-hide">
        {/* Top Header */}
        <div className="cold-storage-top">
          <span style={{ display: "flex", gap: "12px", alignItems: "center", whiteSpace: "nowrap" }}>
            <p className="cold-storage-top-title">Cold storage</p>
          </span>
        </div>

        <div className="cold-storage-bottom">
          {/* Switcher Wrapper */}
          <div className="cold-storage-switcher">
            <div className="switcher_wrapper_inner">
              <button
                ref={assetsTabRef}
                className={`switcher_item ${activeTab === "assets" ? "active" : ""}`}
                onClick={() => setActiveTab("assets")}
              >
                Assets
              </button>
              <button
                ref={howItWorksTabRef}
                className={`switcher_item ${activeTab === "how_it_works" ? "active" : ""}`}
                onClick={() => setActiveTab("how_it_works")}
              >
                How it works
              </button>
              <div
                className="switcher_indicator"
                style={{
                  left: tabIndicatorStyle.left,
                  width: tabIndicatorStyle.width,
                }}
              />
            </div>
          </div>

          {/* ===================== TAB 1: ASSETS ===================== */}
          {activeTab === "assets" && (
            <div className="cold-storage-assets-view">
              {/* Cold storage value box ($0 instead of $0.00) */}
              <div className="cold-storage-balance-box">
                <div>
                  <span className="balance_label_wrapper">
                    <p className="balance_label">Cold storage value</p>
                    <button
                      className="eyes_button"
                      onClick={() => setHideBalance((prev) => !prev)}
                      title={hideBalance ? "Show balance" : "Hide balance"}
                      aria-label="Toggle balance visibility"
                    >
                      {hideBalance ? (
                        <EyeOff size={14} strokeWidth={1.5} />
                      ) : (
                        <Eye size={14} strokeWidth={1.5} />
                      )}
                    </button>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {hideBalance ? (
                      <h3 className="user_balance hidden">
                        <i>*</i>
                        <i>*</i>
                        <i>*</i>
                        <i>*</i>
                        <i>*</i>
                        <i>*</i>
                      </h3>
                    ) : (
                      <span className="user_balance">
                        {formatCurrency(totalColdStorageValue)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* "Your assets" Bar */}
              <div className="cold-storage-assets-header">
                <span className="titles">
                  <p className="title">Your assets</p>
                  {userColdAssets.length > 0 && (
                    <p className="count">({userColdAssets.length})</p>
                  )}
                </span>
                <button className="cold-storage-add-btn" onClick={handleOpenAddAsset}>
                  <p>Add asset</p>
                </button>
              </div>

              {/* DESKTOP TABLE VIEW (> 1000px) */}
              <div className="cold-storage-desktop-view">
                <div className="cold-storage-table-wrapper">
                  <table className="cold-storage-table">
                    <thead>
                      <tr>
                        <th className="id">Asset</th>
                        <th className="amount_small">Current price</th>
                        <th className="amount_small">In wallet</th>
                        <th className="amount_small">Current value</th>
                        <th className="actions"></th>
                      </tr>
                    </thead>
                    <tbody className="scrollbar-hide">
                      {userColdAssets.length === 0 ? (
                        <tr className="empty-row" style={{ background: "transparent", backgroundColor: "transparent", border: "none" }}>
                          <td colSpan={5} className="empty-cell" style={{ padding: "56px 0", background: "transparent", backgroundColor: "transparent", border: "none", textAlign: "center" }}>
                            <div className="empty_state" style={{ background: "transparent", backgroundColor: "transparent", border: "none" }}>
                              <p style={{ margin: 0, color: "var(--color-text-secondary, rgba(255, 255, 255, 0.5))", fontSize: "14px", fontWeight: 500 }}>
                                No cold storage assets found
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        userColdAssets.map((asset) => {
                          const totalVal = asset.amount * asset.price;
                          return (
                            <tr key={asset.symbol} onClick={() => handleRowClick(asset)}>
                              <td className="id-cell">
                                <img
                                  src={asset.icon}
                                  alt={asset.symbol}
                                  width={22}
                                  height={22}
                                  style={{ borderRadius: "50%" }}
                                />
                                <div>
                                  <span style={{ fontWeight: 600, color: "#ffffff" }}>
                                    {asset.name}
                                  </span>{" "}
                                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "12px" }}>
                                    {asset.symbol}
                                  </span>
                                </div>
                              </td>
                              <td className="amount_small">
                                $
                                {asset.price.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 4,
                                })}
                              </td>
                              <td className="amount_small">
                                {formatCryptoAmount(asset.amount, asset.symbol)}
                              </td>
                              <td className="amount_small" style={{ fontWeight: 600 }}>
                                {formatCurrency(totalVal)}
                              </td>
                              <td className="actions">
                                <ChevronRight size={16} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARDS VIEW (<= 1000px) - Exact AssetsMobile from MetaGold 5 */}
              <div className="cold-storage-mobile-view">
                <div className="cold-storage-mobile-wrapper">
                  <div className="content_wrapper">
                    {userColdAssets.length === 0 ? (
                      <div className="empty_state" style={{ background: "transparent", backgroundColor: "transparent", border: "none" }}>
                        <p style={{ margin: 0, color: "var(--color-text-secondary, rgba(255, 255, 255, 0.5))", fontSize: "13px" }}>
                          No cold storage assets found
                        </p>
                      </div>
                    ) : (
                      userColdAssets.map((asset) => {
                        const totalVal = asset.amount * asset.price;
                        return (
                          <div
                            key={asset.symbol}
                            className="asset"
                            onClick={() => handleRowClick(asset)}
                          >
                            <div className="asset_left">
                              <img src={asset.icon} alt={asset.symbol} />
                              <span>
                                <p className="asset_name">{asset.name}</p>
                                <div className="asset_value">
                                  <p>{formatCryptoAmount(asset.amount, asset.symbol)}</p>
                                  <p>•</p>
                                  <p>{formatCurrency(totalVal)}</p>
                                </div>
                              </span>
                            </div>
                            <div className="asset_right">
                              <span>
                                <p className="current_price">
                                  $
                                  {asset.price.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 4,
                                  })}{" "}
                                  / {asset.symbol}
                                </p>
                              </span>
                              <div className="chevron_right_wrapper">
                                <ChevronRight size={16} />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: HOW IT WORKS ===================== */}
          {activeTab === "how_it_works" && (
            <div className="how-it-works-wrapper">
              <div className="how_it_works_header">
                <p>How it works</p>
              </div>

              <div className="how-it-works-questions">
                {COLD_STORAGE_QUESTIONS.map((item) => {
                  const isOpen = openQuestionId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`question ${isOpen ? "open" : ""}`}
                      onClick={() => setOpenQuestionId(isOpen ? null : item.id)}
                    >
                      <div className="wrapper">
                        <div className="left_section">
                          <div
                            className="question_number"
                            style={{
                              backgroundColor: isOpen
                                ? "var(--color-primary, #4763f0)"
                                : "var(--color-control-inactive, rgba(255, 255, 255, 0.05))",
                              color: isOpen ? "#ffffff" : "var(--color-text, #ffffff)",
                            }}
                          >
                            <p style={{ margin: 0 }}>{item.id}</p>
                          </div>
                          <p className="question_title">{item.title}</p>
                        </div>
                        <ChevronDown
                          size={15}
                          color="var(--color-primary, #4763f0)"
                          strokeWidth={1.5}
                          style={{
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease-in-out",
                          }}
                        />
                      </div>
                      {isOpen && (
                        <div style={{ marginTop: "10px", paddingLeft: "32px" }}>
                          <p className="question_answer">{item.content}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== SLIDE-IN DRAWER OVERLAY ===================== */}
      <div
        className={`cold-storage-overlay ${drawerOpen ? "open" : ""}`}
        onClick={handleCloseDrawer}
      />

      {/* ===================== SLIDE-IN DRAWER CONTAINER ===================== */}
      <div className={`cold-storage-drawer ${drawerOpen ? "open" : ""}`}>
        {/* VIEW 1: SELECT ASSET */}
        {drawerView === "select" && (
          <>
            <div className="drawer-top">
              <button className="drawer-top-left" onClick={handleCloseDrawer}>
                <ChevronLeft size={16} strokeWidth={1.5} />
                <p className="drawer-top-title">Select asset</p>
              </button>
              <button className="drawer-close-btn" onClick={handleCloseDrawer}>
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="drawer-content scrollbar-hide">
              <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", fontWeight: 500 }}>
                Assets
              </span>

              <div className="cold-storage-search-box">
                <Search size={16} strokeWidth={1.5} color="rgba(255, 255, 255, 0.5)" />
                <input
                  type="text"
                  placeholder="Search for assets"
                  className="cold-storage-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="cold-storage-asset-list scrollbar-hide">
                {availableAssets.map((asset) => {
                  const stored = userColdAssets.find((a) => a.symbol === asset.symbol);
                  const storedAmount = stored ? stored.amount : 0;
                  return (
                    <div
                      key={asset.symbol}
                      className="cold-storage-asset-item"
                      onClick={() => handleSelectAsset(asset)}
                    >
                      <span className="left">
                        <img
                          src={asset.icon}
                          alt={asset.symbol}
                          className="asset-icon"
                          width={22}
                          height={22}
                        />
                        <span className="name">
                          {asset.name}{" "}
                          <span className="symbol">
                            {formatCryptoAmount(storedAmount, asset.symbol)}
                          </span>
                        </span>
                      </span>
                      <span className="right">
                        <ChevronRight size={16} strokeWidth={1.5} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: ASSET DETAILS VIEW */}
        {drawerView === "asset" && selectedAsset && (
          <>
            <div className="drawer-top">
              <button className="drawer-top-left" onClick={handleBackDrawer}>
                <ChevronLeft size={16} strokeWidth={1.5} />
                <p className="drawer-top-title">Back to assets</p>
              </button>
              <button className="drawer-close-btn" onClick={handleCloseDrawer}>
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="drawer-content scrollbar-hide">
              <div className="asset-details-container">
                <div className="asset-details-profile">
                  <div className="asset-details-icon-wrapper">
                    <img
                      src={selectedAsset.icon}
                      alt={selectedAsset.symbol}
                      width={44}
                      height={44}
                      style={{ borderRadius: "50%" }}
                    />
                  </div>

                  <div className="asset-details-name-row">
                    <span className="asset-name">{selectedAsset.name}</span>
                  </div>

                  <div className="asset-details-price-row">
                    <span className="price">
                      $
                      {selectedAsset.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </span>
                    <strong className="unit">/ {selectedAsset.symbol}</strong>
                  </div>
                </div>

                <div className="asset-details-balance-box">
                  <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px" }}>
                    Your balance:
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff" }}>
                    {formatCryptoAmount(selectedStoredBalance, selectedAsset.symbol)}
                  </span>
                  <span className="estimated">
                    ~{formatCurrency(selectedStoredBalance * selectedAsset.price)}
                  </span>
                </div>

                {/* TradingView Mini Chart */}
                <div
                  ref={chartRef}
                  className="asset-details-chart-container"
                  style={{ width: "100%", height: "330px" }}
                />

                <div className="asset-details-actions">
                  <button
                    className="asset-details-btn-primary"
                    onClick={() => {
                      setDrawerView("deposit");
                      setStep(1);
                      setAmountInput("");
                      setAmountError(null);
                    }}
                  >
                    Deposit
                  </button>
                  <button
                    className="asset-details-btn-secondary"
                    onClick={() => {
                      setDrawerView("withdraw");
                      setStep(1);
                      setAmountInput("");
                      setAmountError(null);
                    }}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 3: DEPOSIT TO COLD STORAGE */}
        {drawerView === "deposit" && selectedAsset && (
          <>
            <div className="drawer-top">
              <button className="drawer-top-left" onClick={handleBackDrawer}>
                <ChevronLeft size={16} strokeWidth={1.5} />
                <span style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <p className="drawer-top-title">
                    {step === 1
                      ? `Deposit to cold storage (${selectedAsset.symbol})`
                      : "Confirmation"}
                  </p>
                  <strong className="drawer-step-badge">Step {step}/2</strong>
                </span>
              </button>
              <button className="drawer-close-btn" onClick={handleCloseDrawer}>
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="cold-storage-divider">
              <div
                className="cold-storage-divider-bar"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>

            <div className="drawer-content scrollbar-hide">
              {step === 1 ? (
                <>
                  <div className="transaction-content-prompt">
                    <p>
                      How much {selectedAsset.name} would you like to deposit into cold
                      storage?
                    </p>
                  </div>

                  <div className={`amount-input-card ${amountError ? "error" : ""}`}>
                    <div className="amountbox_wrapper">
                      <input
                        type="number"
                        step="any"
                        placeholder={`Enter ${selectedAsset.symbol} amount`}
                        value={amountInput}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="no-zoom-14px"
                      />
                      <span className="amount_select">
                        <p style={{ margin: 0 }}>{selectedAsset.symbol}</p>
                      </span>
                    </div>

                    <div className="captions">
                      {amountError && <p className="error-text">{amountError}</p>}
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span>
                          Available trading balance:{" "}
                          {formatCryptoAmount(availableTradingBalance, selectedAsset.symbol)}
                        </span>
                        {calculatedUsdValue > 0 && (
                          <span>
                            Approximate value: {formatCurrency(calculatedUsdValue)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className={`drawer-action-btn ${
                      !amountInput || !!amountError || calculatedUsdValue <= 0
                        ? "disabled"
                        : ""
                    }`}
                    disabled={!amountInput || !!amountError || calculatedUsdValue <= 0}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="transaction-content-prompt">
                    <p>Review your transaction</p>
                  </div>

                  <div className="review-transaction-box">
                    <div className="top">
                      <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                        You are depositing:
                      </span>
                      <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <img
                          src={selectedAsset.icon}
                          alt={selectedAsset.symbol}
                          width={18}
                          height={18}
                          style={{ borderRadius: "50%" }}
                        />
                        <strong style={{ color: "#4763f0", fontSize: "14px" }}>
                          {selectedAsset.name} ({selectedAsset.symbol})
                        </strong>
                      </span>
                    </div>

                    <div className="bottom">
                      <div className="summary-row">
                        <span className="label">Amount:</span>
                        <span className="value">
                          {formatCryptoAmount(parseFloat(amountInput), selectedAsset.symbol)}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="label">Price per unit:</span>
                        <span className="value">
                          $
                          {selectedAsset.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="label">Total:</span>
                        <span className="value">
                          {formatCurrency(calculatedUsdValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="drawer-action-btn"
                    disabled={isSubmitting}
                    onClick={handleConfirmDeposit}
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Confirm deposit"
                    )}
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* VIEW 4: WITHDRAW FROM COLD STORAGE */}
        {drawerView === "withdraw" && selectedAsset && (
          <>
            <div className="drawer-top">
              <button className="drawer-top-left" onClick={handleBackDrawer}>
                <ChevronLeft size={16} strokeWidth={1.5} />
                <span style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <p className="drawer-top-title">
                    {step === 1
                      ? `Withdraw from cold storage (${selectedAsset.symbol})`
                      : "Confirmation"}
                  </p>
                  <strong className="drawer-step-badge">Step {step}/2</strong>
                </span>
              </button>
              <button className="drawer-close-btn" onClick={handleCloseDrawer}>
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="cold-storage-divider">
              <div
                className="cold-storage-divider-bar"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>

            <div className="drawer-content scrollbar-hide">
              {step === 1 ? (
                <>
                  <div className="transaction-content-prompt">
                    <p>
                      How much {selectedAsset.name} would you like to withdraw from cold
                      storage?
                    </p>
                  </div>

                  <div className={`amount-input-card ${amountError ? "error" : ""}`}>
                    <div className="amountbox_wrapper">
                      <input
                        type="number"
                        step="any"
                        placeholder={`Enter ${selectedAsset.symbol} amount`}
                        value={amountInput}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="no-zoom-14px"
                      />
                      <span className="amount_select">
                        <p style={{ margin: 0 }}>{selectedAsset.symbol}</p>
                      </span>
                    </div>

                    <div className="captions">
                      {amountError && <p className="error-text">{amountError}</p>}
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span>
                          Available cold storage balance:{" "}
                          {formatCryptoAmount(selectedStoredBalance, selectedAsset.symbol)}
                        </span>
                        {calculatedUsdValue > 0 && (
                          <span>
                            You will receive: {formatCurrency(calculatedUsdValue)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className={`drawer-action-btn ${
                      !amountInput || !!amountError || calculatedUsdValue <= 0
                        ? "disabled"
                        : ""
                    }`}
                    disabled={!amountInput || !!amountError || calculatedUsdValue <= 0}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="transaction-content-prompt">
                    <p>Review your transaction</p>
                  </div>

                  <div className="review-transaction-box">
                    <div className="top">
                      <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                        You are withdrawing:
                      </span>
                      <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <img
                          src={selectedAsset.icon}
                          alt={selectedAsset.symbol}
                          width={18}
                          height={18}
                          style={{ borderRadius: "50%" }}
                        />
                        <strong style={{ color: "#f7495b", fontSize: "14px" }}>
                          {selectedAsset.name} ({selectedAsset.symbol})
                        </strong>
                      </span>
                    </div>

                    <div className="bottom">
                      <div className="summary-row">
                        <span className="label">Amount:</span>
                        <span className="value">
                          {formatCryptoAmount(parseFloat(amountInput), selectedAsset.symbol)}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="label">Price per unit:</span>
                        <span className="value">
                          $
                          {selectedAsset.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="label">Total:</span>
                        <span className="value">
                          {formatCurrency(calculatedUsdValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="drawer-action-btn"
                    disabled={isSubmitting}
                    onClick={handleConfirmWithdraw}
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Confirm withdrawal"
                    )}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ===================== SUCCESS MODAL (ColdStorageModalContent) ===================== */}
      {showSuccessModal && successDetails && (
        <div
          className="cold-storage-success-overlay"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="cold-storage-success-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="cold-storage-success-close"
              onClick={() => setShowSuccessModal(false)}
            >
              <X size={18} />
            </button>

            {/* Illustration Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                display: "grid",
                placeContent: "center",
                marginTop: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <img
                src={`/cold_storage_files/${successDetails.symbol}.svg`}
                alt={successDetails.symbol}
                width={36}
                height={36}
              />
            </div>

            <div
              className={`cold-storage-success-badge ${
                successDetails.action === "deposit" ? "deposit" : "withdraw"
              }`}
            >
              <p>
                {successDetails.amount.toFixed(6)} {successDetails.symbol}
              </p>
            </div>

            <div className="cold-storage-success-texts">
              <p className="title">
                {successDetails.action === "deposit"
                  ? "Deposit successful"
                  : "Withdrawal successful"}
              </p>
              <p className="subtitle">
                {successDetails.action === "deposit"
                  ? "Your assets have been successfully transferred to cold storage. Your balance has been updated."
                  : "Your assets have been successfully transferred from cold storage. Your balance has been updated."}
              </p>
            </div>

            <button
              className="cold-storage-success-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Sounds good
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
