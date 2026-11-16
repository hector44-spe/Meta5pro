"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Star } from "lucide-react";
import rawAssetsData from "@/data/assetsData.json";
import { usePrices } from "@/lib/usePrices";
import { useHoldings } from "@/lib/useHoldings";

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
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px 20px 48px",
        boxSizing: "border-box",
        minHeight: "100vh",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Markets
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "8px 14px",
              width: "280px",
            }}
          >
            <Search size={16} color="rgba(255, 255, 255, 0.4)" />
            <input
              type="text"
              placeholder="Search for assets"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontSize: "13.5px",
                width: "100%",
              }}
            />
          </div>

          {/* Type Dropdown Filter */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px 14px",
                color: "#ffffff",
                fontSize: "13.5px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <span>{selectedType}</span>
              <ChevronDown
                size={15}
                color="rgba(255, 255, 255, 0.5)"
                style={{
                  transform: isTypeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>

            {isTypeDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 0,
                  backgroundColor: "#16181d",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                  zIndex: 50,
                  minWidth: "140px",
                  overflow: "hidden",
                }}
              >
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
      <div
        style={{
          backgroundColor: "var(--color-card-background, rgba(255, 255, 255, 0.02))",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "13.5px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                color: "rgba(255, 255, 255, 0.45)",
                fontSize: "12.5px",
                fontWeight: 500,
              }}
            >
              <th style={{ padding: "14px 20px" }}>★ Asset</th>
              <th style={{ padding: "14px 20px" }}>Type</th>
              <th style={{ padding: "14px 20px" }}>Current price (USD)</th>
              <th style={{ padding: "14px 20px" }}>In your wallet</th>
              <th style={{ padding: "14px 20px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "36px 20px",
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
                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
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
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
                          }}
                        >
                          <Star
                            size={16}
                            fill={isFav ? "#eab308" : "none"}
                            strokeWidth={1.5}
                          />
                        </button>

                        <div
                          style={{
                            width: "32px",
                            height: "32px",
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
                                // fallback to monogram
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>
                              {asset.symbol.slice(0, 3)}
                            </span>
                          )}
                        </div>

                        <span style={{ fontWeight: 600, color: "#ffffff" }}>
                          {asset.symbol}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: "14px 20px", color: "rgba(255, 255, 255, 0.65)" }}>
                      {asset.type}
                    </td>

                    {/* Current price (USD) */}
                    <td style={{ padding: "14px 20px", color: "rgba(255, 255, 255, 0.85)", fontWeight: 500 }}>
                      {getLivePriceDisplay(asset)}
                    </td>

                    {/* In your wallet */}
                    <td style={{ padding: "14px 20px", color: "rgba(255, 255, 255, 0.65)" }}>
                      {getWalletAmountDisplay(asset)}
                    </td>

                    {/* Action: Trade Button */}
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <button
                        onClick={() => handleTrade(asset)}
                        style={{
                          padding: "6px 16px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                        }}
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
  );
}
