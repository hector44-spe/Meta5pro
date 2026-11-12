"use client";

import React, { useState, useMemo } from "react";
import {
  Eye,
  EyeOff,
  GripHorizontal,
  Search,
  ChevronDown,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import assetsData from "@/data/assetsData.json";
import "@/styles/assets-page.css";

interface AssetItem {
  id: number;
  name: string;
  symbol: string;
  type: string;
  price: string;
  walletAmount: string;
  walletValue: string;
  icon: string;
}

export default function AssetsPage() {
  const { currentBalance, hideBalance, setHideBalance, openModal } = useDashboard();

  // Search & Type Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string | null>(null);

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    return (assetsData as AssetItem[]).filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === "all" ||
        asset.type.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType]);

  const handleDepositClick = (symbol: string) => {
    setSelectedAssetSymbol(symbol);
    openModal("deposit");
  };

  const handleWithdrawClick = (symbol: string) => {
    setSelectedAssetSymbol(symbol);
    openModal("withdraw");
  };

  const formattedBalance =
    currentBalance === 0
      ? "$0"
      : `$${currentBalance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  return (
    <div className="assets-page-container">
      {/* ================= TOP SPLIT: BALANCE CARD + RECENT ACTIVITY ================= */}
      <div className="assets-top-grid">
        {/* Balance Card */}
        <div className="assets-balance-card">
          <div>
            <div className="assets-balance-label-row">
              <span className="assets-balance-label">Total balance</span>
              <button
                type="button"
                className="assets-eye-btn"
                onClick={() => setHideBalance((prev) => !prev)}
                title={hideBalance ? "Show balance" : "Hide balance"}
                aria-label="Toggle balance visibility"
              >
                {hideBalance ? (
                  <EyeOff size={15} strokeWidth={1.75} />
                ) : (
                  <Eye size={15} strokeWidth={1.75} />
                )}
              </button>
            </div>
            <div className="assets-balance-amount">
              {hideBalance ? "******" : formattedBalance}
            </div>
          </div>

          <div className="assets-balance-bars-wrapper">
            <div className="assets-balance-bar">
              <div
                style={{
                  width: currentBalance > 0 ? "100%" : "0%",
                  background: "#4763f0",
                  height: "100%",
                  borderRadius: "2px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="assets-activity-card">
          <div className="assets-activity-title">Recent activity</div>
          <div className="assets-activity-list">
            <div className="assets-activity-item">
              <span className="assets-activity-item-text">
                Welcome to Meta Gold 5!
              </span>
              <span className="assets-activity-item-date">10/11/2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RESIZABLE GRIP HANDLE ================= */}
      <div className="assets-grip-handle" title="Panel separator">
        <GripHorizontal size={22} strokeWidth={2} />
      </div>

      {/* ================= ALL YOUR ASSETS TABLE ================= */}
      <div className="assets-table-section">
        {/* Top filter toolbar */}
        <div className="assets-table-top">
          <h2 className="assets-table-top-title">All your assets</h2>

          <div className="assets-table-utils">
            {/* Search Box */}
            <div className="assets-search-wrapper">
              <Search size={16} strokeWidth={1.75} color="rgba(255, 255, 255, 0.45)" />
              <input
                type="text"
                placeholder="Search for assets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="assets-search-input"
              />
            </div>

            {/* Category Dropdown */}
            <div className="assets-select-wrapper">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="assets-select"
              >
                <option value="all">All assets</option>
                <option value="Crypto">Crypto assets</option>
                <option value="Fiat">Fiat assets</option>
                <option value="Stocks">Stocks assets</option>
              </select>
              <ChevronDown size={14} className="assets-select-arrow" />
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="assets-table-scroll scrollbar-hide">
          <table className="assets-table">
            <thead>
              <tr>
                <th className="col-asset">Asset</th>
                <th className="col-symbol">Symbol</th>
                <th className="col-type">Type</th>
                <th className="col-price">Current price (USD)</th>
                <th className="col-wallet">In your wallet</th>
                <th className="col-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "rgba(255, 255, 255, 0.4)" }}>
                    No assets found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    {/* Asset (Icon + Name + Mobile Symbol) */}
                    <td className="col-asset">
                      <div className="cell-asset">
                        <img
                          src={asset.icon}
                          alt={asset.name}
                          className="cell-asset-icon"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback if SVG fails to load
                            (e.currentTarget as HTMLImageElement).src =
                              "/dashboard_files/starter.svg";
                          }}
                        />
                        <div className="cell-asset-meta">
                          <span className="cell-asset-name">{asset.name}</span>
                          <span className="cell-asset-symbol-mobile">
                            {asset.symbol}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Symbol */}
                    <td className="col-symbol">
                      <div className="cell-symbol">{asset.symbol}</div>
                    </td>

                    {/* Type */}
                    <td className="col-type">
                      <div className="cell-type">
                        <span className="type-pill">{asset.type}</span>
                      </div>
                    </td>

                    {/* Current Price */}
                    <td className="col-price">
                      <div className="cell-price">{asset.price}</div>
                    </td>

                    {/* In your wallet */}
                    <td className="col-wallet">
                      <div className="cell-wallet">
                        <div className="wallet-amount-row">
                          <span className="wallet-amount-crypto">
                            {hideBalance ? "******" : asset.walletAmount}
                          </span>
                          <span className="wallet-amount-usd">
                            {hideBalance ? "******" : asset.walletValue}
                          </span>
                        </div>

                        {/* Mobile action buttons when desktop actions column is hidden */}
                        <div className="wallet-mobile-actions">
                          <button
                            type="button"
                            className="asset-action-btn"
                            onClick={() => handleDepositClick(asset.symbol)}
                          >
                            Deposit
                          </button>
                          <button
                            type="button"
                            className="asset-action-btn"
                            onClick={() => handleWithdrawClick(asset.symbol)}
                          >
                            Withdraw
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Actions (Desktop) */}
                    <td className="col-action">
                      <div className="cell-actions">
                        <div className="action-buttons-wrapper">
                          <button
                            type="button"
                            className="asset-action-btn"
                            onClick={() => handleDepositClick(asset.symbol)}
                          >
                            Deposit
                          </button>
                          <button
                            type="button"
                            className="asset-action-btn"
                            onClick={() => handleWithdrawClick(asset.symbol)}
                          >
                            Withdraw
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
