"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDashboard } from "@/components/DashboardShell";
import { Search, CreditCard, ChevronDown, Clock } from "lucide-react";
import "@/styles/transactions-page.css";

interface WithdrawalItem {
  id: string;
  date: string;
  reference: string;
  method: string;
  type: string;
  amount: string;
  totalUSD: string;
  status: string;
}

export default function WithdrawPage() {
  const { openModal } = useDashboard();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const txs = (data.transactions || [])
          .filter((t: any) => t.type === "WITHDRAWAL")
          .map((t: any) => ({
            id: t.id,
            date: new Date(t.createdAt).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            reference: t.txHash ? t.txHash.substring(0, 16) + "..." : t.id.substring(0, 12),
            method: t.currency || "Crypto",
            type: "Regular",
            amount: `${t.amount} ${t.currency?.split(" ")[0] || "USD"}`,
            totalUSD: `$${Number(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: t.status?.toLowerCase() || "pending",
          }));
        setWithdrawals(txs);
      }
    } catch (e) {
      console.error("Failed to load withdrawals:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(true);

    const handleRefresh = () => fetchWithdrawals(false);
    window.addEventListener("balance-changed", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    const timer = setInterval(() => fetchWithdrawals(false), 10_000);

    return () => {
      window.removeEventListener("balance-changed", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      clearInterval(timer);
    };
  }, []);

  const pendingWithdrawals = useMemo(() => {
    return withdrawals.filter((wd) => wd.status.toLowerCase() === "pending");
  }, [withdrawals]);

  const filteredWithdrawals = withdrawals.filter((wd) => {
    const matchesSearch =
      wd.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wd.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wd.amount.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || wd.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tp-content-container">
      {/* Title Row: "Withdrawals" heading + "Withdraw now" action button */}
      <div className="tp-title-row">
        <button
          type="button"
          className="tp-action-btn"
          onClick={() => openModal("withdraw")}
          id="withdraw-now-btn"
          style={{
            backgroundColor: "#3861fb",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 4px 14px rgba(56, 97, 251, 0.4)",
          }}
        >
          <CreditCard size={18} strokeWidth={1.8} />
          <span>Withdraw now</span>
        </button>
      </div>

      {/* Pending Confirmation Notice Banner */}
      {pendingWithdrawals.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.28)",
            borderRadius: "10px",
            padding: "14px 16px",
            marginTop: "24px",
            marginBottom: "16px",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <Clock size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#fef3c7" }}>
                Withdrawal Pending Confirmation ({pendingWithdrawals.length})
              </span>
              <span
                style={{
                  padding: "3px 9px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: "rgba(245, 158, 11, 0.2)",
                  color: "#fbbf24",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Pending Confirmation
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.55", color: "#fde68a" }}>
              {pendingWithdrawals.length === 1 ? (
                <>
                  Your withdrawal of <strong>{pendingWithdrawals[0].amount}</strong> ({pendingWithdrawals[0].totalUSD}) submitted on {pendingWithdrawals[0].date} is currently awaiting confirmation. Funds are held securely until approved.
                </>
              ) : (
                <>
                  You have {pendingWithdrawals.length} withdrawals currently awaiting confirmation. They will be processed once verified.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Filter / Search Row */}
      <div className="tp-filter-bar">
        {/* Search Input Box */}
        <div className="tp-search-box">
          <Search size={17} color="rgba(255, 255, 255, 0.45)" />
          <input
            type="text"
            placeholder="Search for withdrawals"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tp-search-input"
          />
        </div>

        {/* Status Dropdown Box */}
        <div className="tp-dropdown-box">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="tp-select"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown size={14} className="tp-dropdown-arrow" />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="tp-table-wrapper">
        <table className="tp-table">
          <thead className="tp-thead">
            <tr>
              <th>Date</th>
              <th>Reference</th>
              <th>Method</th>
              <th className="tp-desktop-col">Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="tp-desktop-col">Total (USD)</th>
            </tr>
          </thead>
          <tbody className="tp-tbody">
            {loading ? (
              <tr>
                <td colSpan={7} className="tp-empty-row" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Loading withdrawals...
                </td>
              </tr>
            ) : filteredWithdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="tp-empty-row">
                  You have not made any withdrawals yet,{" "}
                  <a
                    className="tp-link-action"
                    onClick={() => openModal("withdraw")}
                  >
                    click here to make a withdrawal.
                  </a>
                </td>
              </tr>
            ) : (
              filteredWithdrawals.map((wd) => (
                <tr key={wd.id}>
                  <td>{wd.date}</td>
                  <td style={{ fontFamily: "monospace", color: "#38bdf8" }}>
                    {wd.reference}
                  </td>
                  <td>{wd.method}</td>
                  <td className="tp-desktop-col">{wd.type}</td>
                  <td style={{ fontWeight: 600 }}>
                    {wd.amount}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        whiteSpace: "nowrap",
                        backgroundColor:
                          wd.status === "approved"
                            ? "rgba(16, 185, 129, 0.15)"
                            : wd.status === "rejected"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(245, 158, 11, 0.18)",
                        color:
                          wd.status === "approved"
                            ? "#10b981"
                            : wd.status === "rejected"
                            ? "#ef4444"
                            : "#fbbf24",
                      }}
                    >
                      {wd.status === "pending" && <Clock size={11} />}
                      {wd.status === "pending"
                        ? "Pending Confirmation"
                        : wd.status.charAt(0).toUpperCase() + wd.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="tp-desktop-col" style={{ fontWeight: 600 }}>
                    {wd.totalUSD}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
