"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Star } from "lucide-react";
import rawAssetsData from "@/data/assetsData.json";
import { usePrices } from "@/lib/usePrices";
import { useHoldings } from "@/lib/useHoldings";
import "@/styles/markets-page.css";

interface MarketAsset {
  id: number;
  name: string;
  symbol: string;
  type: string;
  price: string;
  walletAmount: string;
  walletValue: string;
  icon?: string;
}

export default function DashboardMarketsPage() {
  const router = useRouter();
  const { prices } = usePrices();
  const { holdings } = useHoldings();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All assets");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  const assets: MarketAsset[] = useMemo(() => {
    return rawAssetsData as MarketAsset[];
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Category filter
      if (selectedType !== "All assets") {
        if (selectedType.toLowerCase() === "crypto" && asset.type.toLowerCase() !== "crypto") return false;
        if (selectedType.toLowerCase() === "stocks" && asset.type.toLowerCase() !== "stocks") return false;
        if (selectedType.toLowerCase() === "commodities" && asset.type.toLowerCase() !== "commodities") return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSymbol = asset.symbol.toLowerCase().includes(query);
        const matchesName = asset.name.toLowerCase().includes(query);
        return matchesSymbol || matchesName;
      }
      return true;
    });
  }, [assets, selectedType, searchQuery]);

  const handleTrade = (asset: MarketAsset) => {
    router.push(`/trade?symbol=${encodeURIComponent(asset.symbol)}&type=${encodeURIComponent(asset.type)}`);
  };

  const getLivePriceDisplay = (asset: MarketAsset) => {
    const sym = asset.symbol.toUpperCase();
    const live = prices[sym];
    if (live !== undefined && live > 0) {
      const formatted = live < 1 ? live.toFixed(4) : live.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `$${formatted}/${asset.symbol}`;
    }
    return asset.price;
  };

  const getWalletAmountDisplay = (asset: MarketAsset) => {
    const sym = asset.symbol.toUpperCase();
    const holding = holdings.find((h) => h.symbol.toUpperCase() === sym);
    if (holding && holding.units > 0) {
      return `${holding.units.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${asset.symbol}`;
    }
    return asset.walletAmount || `0.00 ${asset.symbol}`;
  };

  return (
    <div className="markets-page-container">
      {/* Top Header Bar */}
      <div className="markets-header-row">
        <h1 className="markets-title">Markets</h1>

        <div className="markets-controls-wrapper">
          {/* Search Box */}
          <div className="markets-search-box">
            <Search size={16} color="rgba(255, 255, 255, 0.4)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search for assets"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="markets-search-input"
            />
          </div>

          {/* Type Dropdown Filter */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="markets-filter-btn"
            >
              <span>{selectedType}</span>
              <ChevronDown
                size={14}
                color="rgba(255, 255, 255, 0.5)"
                style={{
                  transform: isTypeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                  flexShrink: 0,
                }}
              />
            </button>

            {isTypeDropdownOpen && (
              <div className="markets-dropdown-menu">
                {["All assets", "Crypto", "Stocks", "Commodities"].map((cat) => (
                  <div
                    key={cat}
                    onClick={() => {
                      setSelectedType(cat);
                      setIsTypeDropdownOpen(false);
                    }}
                    style={{
                      padding: "10px 14px",
                      color: selectedType === cat ? "#4763f0" : "#ffffff",
                      fontSize: "13px",
                      fontWeight: selectedType === cat ? 600 : 400,
                      cursor: "pointer",
                      backgroundColor: selectedType === cat ? "rgba(71, 99, 240, 0.12)" : "transparent",
                      transition: "background-color 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedType !== cat) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (selectedType !== cat) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assets Table (Image 3) */}
      <div className="markets-card">
        <div className="markets-table-scroll">
          <table className="markets-table">
            <thead>
              <tr>
                <th>★ Asset</th>
                <th className="markets-col-type">Type</th>
                <th>Current price (USD)</th>
                <th className="markets-col-wallet">In your wallet</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "36px 16px",
                      textAlign: "center",
                      color: "rgba(255, 255, 255, 0.4)",
                      fontSize: "13px",
                    }}
                  >
                    No assets found matching &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredAssets.slice(0, 100).map((asset) => {
                  const isFav = !!favorites[asset.symbol];
                  return (
                    <tr
                      key={asset.id}
                      style={{
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {/* ★ Asset */}
                      <td>
                        <div
                          className="markets-asset-meta"
                          style={{ display: "flex", alignItems: "center", gap: "12px" }}
                        >
                          <button
                            onClick={(e) => toggleFavorite(asset.symbol, e)}
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              color: isFav ? "#eab308" : "rgba(255, 255, 255, 0.35)",
                              flexShrink: 0,
                            }}
                          >
                            <Star
                              size={15}
                              fill={isFav ? "#eab308" : "none"}
                              strokeWidth={1.5}
                            />
                          </button>

                          <div
                            className="markets-asset-icon"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 255, 255, 0.06)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {asset.icon ? (
                              <img
                                src={asset.icon}
                                alt={asset.symbol}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>
                                {asset.symbol.slice(0, 3)}
                              </span>
                            )}
                          </div>

                          <span className="markets-asset-symbol" style={{ fontWeight: 600, color: "#ffffff" }}>
                            {asset.symbol}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="markets-col-type" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                        {asset.type}
                      </td>

                      {/* Current price (USD) */}
                      <td className="markets-price-cell" style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>
                        {getLivePriceDisplay(asset)}
                      </td>

                      {/* In your wallet */}
                      <td className="markets-col-wallet" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                        {getWalletAmountDisplay(asset)}
                      </td>

                      {/* Action: Trade Button */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleTrade(asset)}
                          className="markets-trade-btn"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
