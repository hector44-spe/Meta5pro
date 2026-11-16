"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDashboard } from "@/components/DashboardShell";
import { Search, CreditCard, ChevronDown, Clock } from "lucide-react";
import "@/styles/transactions-page.css";

interface DepositItem {
  id: string;
  date: string;
  reference: string;
  method: string;
  type: string;
  amount: string;
  totalUSD: string;
  status: string;
}

export default function DepositPage() {
  const { openModal } = useDashboard();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const txs = (data.transactions || [])
          .filter((t: any) => t.type === "DEPOSIT")
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
        setDeposits(txs);
      }
    } catch (e) {
      console.error("Failed to load deposits:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits(true);

    const handleDepositSubmitted = (e: any) => {
      // Optimistically insert the newly submitted deposit immediately
      if (e?.detail?.transaction) {
        const t = e.detail.transaction;
        const optimisticDeposit: DepositItem = {
          id: t.id || `dep_${Date.now()}`,
          date: new Date(t.createdAt || Date.now()).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          reference: t.txHash ? t.txHash.substring(0, 16) + "..." : (t.id ? t.id.substring(0, 12) : "SUBMITTED"),
          method: t.currency || "Crypto",
          type: "Regular",
          amount: `${t.amount} ${t.currency?.split(" ")[0] || "USD"}`,
          totalUSD: `$${Number(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          status: "pending",
        };
        setDeposits((prev) => [optimisticDeposit, ...prev.filter((d) => d.id !== optimisticDeposit.id)]);
      }
      // Re-fetch from server to synchronize
      fetchDeposits(false);
    };

    window.addEventListener("deposit-submitted", handleDepositSubmitted);
    window.addEventListener("focus", () => fetchDeposits(false));

    // Poll periodically to catch admin approvals immediately
    const timer = setInterval(() => fetchDeposits(false), 10_000);

    return () => {
      window.removeEventListener("deposit-submitted", handleDepositSubmitted);
      window.removeEventListener("focus", () => fetchDeposits(false));
      clearInterval(timer);
    };
  }, []);

  const pendingDeposits = useMemo(() => {
    return deposits.filter((dep) => dep.status.toLowerCase() === "pending");
  }, [deposits]);

  const filteredDeposits = deposits.filter((dep) => {
    const matchesSearch =
      dep.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.amount.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || dep.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tp-content-container">
      {/* Title Row: "Deposits" heading + "Deposit now" action button */}
      <div className="tp-title-row">
        <button
          type="button"
          className="tp-action-btn"
          onClick={() => openModal("deposit")}
          id="deposit-now-btn"
        >
          <CreditCard size={18} strokeWidth={1.8} />
          <span>Deposit now</span>
        </button>
      </div>

      {/* Pending Confirmation Notice Banner */}
      {pendingDeposits.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.28)",
            borderRadius: "10px",
            padding: "14px 16px",
            marginBottom: "16px",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <Clock size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fef3c7", marginBottom: "4px" }}>
              Deposit Pending Confirmation ({pendingDeposits.length})
            </div>
            <p style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.5", color: "#fde68a" }}>
              {pendingDeposits.length === 1 ? (
                <>
                  Your deposit of <strong>{pendingDeposits[0].amount}</strong> ({pendingDeposits[0].totalUSD}) submitted on {pendingDeposits[0].date} is currently awaiting confirmation. Funds will reflect in your balance and assets once approved.
                </>
              ) : (
                <>
                  You have {pendingDeposits.length} deposits currently awaiting confirmation. They will reflect in your balance and assets once approved by the system.
                </>
              )}
            </p>
          </div>
          <span
            style={{
              padding: "4px 10px",
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
      )}

      {/* Filter / Search Row */}
      <div className="tp-filter-bar">
        {/* Search Input Box */}
        <div className="tp-search-box">
          <Search size={17} color="rgba(255, 255, 255, 0.45)" />
          <input
            type="text"
            placeholder="Search for deposits"
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
                  Loading deposits...
                </td>
              </tr>
            ) : filteredDeposits.length === 0 ? (
              <tr>
                <td colSpan={7} className="tp-empty-row">
                  You have not made any deposits yet,{" "}
                  <a
                    className="tp-link-action"
                    onClick={() => openModal("deposit")}
                  >
                    click here to make a deposit.
                  </a>
                </td>
              </tr>
            ) : (
              filteredDeposits.map((dep) => (
                <tr key={dep.id}>
                  <td>{dep.date}</td>
                  <td style={{ fontFamily: "monospace", color: "#38bdf8" }}>
                    {dep.reference}
                  </td>
                  <td>{dep.method}</td>
                  <td className="tp-desktop-col">{dep.type}</td>
                  <td style={{ fontWeight: 600 }}>
                    {dep.amount}
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
                          dep.status === "approved"
                            ? "rgba(16, 185, 129, 0.15)"
                            : dep.status === "rejected"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(245, 158, 11, 0.18)",
                        color:
                          dep.status === "approved"
                            ? "#10b981"
                            : dep.status === "rejected"
                            ? "#ef4444"
                            : "#fbbf24",
                      }}
                    >
                      {dep.status === "pending" && <Clock size={11} />}
                      {dep.status === "pending"
                        ? "Pending Confirmation"
                        : dep.status.charAt(0).toUpperCase() + dep.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="tp-desktop-col" style={{ fontWeight: 600 }}>
                    {dep.totalUSD}
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
