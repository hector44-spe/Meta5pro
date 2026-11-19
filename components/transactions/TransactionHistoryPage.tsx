"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, CreditCard, ChevronDown, Clock } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import "@/styles/transactions-page.css";

type TransactionKind = "DEPOSIT" | "WITHDRAWAL";

interface TransactionItem {
  id: string;
  date: string;
  reference: string;
  method: string;
  type: string;
  amount: string;
  totalUSD: string;
  status: string;
}

interface WalletTransaction {
  id: string;
  createdAt: string;
  txHash?: string | null;
  currency?: string | null;
  amount: number | string;
  status?: string | null;
  type: string;
}

const formatTransaction = (transaction: WalletTransaction): TransactionItem => ({
  id: transaction.id,
  date: new Date(transaction.createdAt).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  reference: transaction.txHash ? `${transaction.txHash.substring(0, 16)}...` : transaction.id.substring(0, 12),
  method: transaction.currency || "Crypto",
  type: "Regular",
  amount: `${transaction.amount} ${transaction.currency?.split(" ")[0] || "USD"}`,
  totalUSD: `$${Number(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  status: transaction.status?.toLowerCase() || "pending",
});

export default function TransactionHistoryPage({ kind }: { kind: TransactionKind }) {
  const { openModal } = useDashboard();
  const isDeposit = kind === "DEPOSIT";
  const modal = isDeposit ? "deposit" : "withdraw";
  const noun = isDeposit ? "deposit" : "withdrawal";
  const plural = isDeposit ? "deposits" : "withdrawals";
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch("/api/wallet", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setTransactions(((data.transactions || []) as WalletTransaction[])
          .filter((transaction) => transaction.type === kind)
          .map(formatTransaction));
      }
    } catch (error) {
      console.error(`Failed to load ${plural}:`, error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [kind, plural]);

  useEffect(() => {
    fetchTransactions(true);
    const handleRefresh = (event?: Event) => {
      if (isDeposit && event instanceof CustomEvent && event.detail?.transaction) {
        const raw = event.detail.transaction as WalletTransaction;
        const optimistic = formatTransaction({
          ...raw,
          id: raw.id || `dep_${Date.now()}`,
          createdAt: raw.createdAt || new Date().toISOString(),
          type: "DEPOSIT",
          status: "pending",
        });
        setTransactions((current) => [optimistic, ...current.filter((item) => item.id !== optimistic.id)]);
      }
      fetchTransactions(false);
    };
    const eventName = isDeposit ? "deposit-submitted" : "balance-changed";
    window.addEventListener(eventName, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    const timer = window.setInterval(() => fetchTransactions(false), 10_000);
    return () => {
      window.removeEventListener(eventName, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      window.clearInterval(timer);
    };
  }, [fetchTransactions, isDeposit]);

  const pending = useMemo(
    () => transactions.filter((transaction) => transaction.status.toLowerCase() === "pending"),
    [transactions],
  );
  const filtered = transactions.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = transaction.reference.toLowerCase().includes(query)
      || transaction.method.toLowerCase().includes(query)
      || transaction.amount.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || transaction.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tp-content-container">
      <div className="tp-title-row">
        <button type="button" className="tp-action-btn" onClick={() => openModal(modal)} id={`${modal}-now-btn`} style={{ backgroundColor: "#3861fb", color: "#ffffff", border: "none", boxShadow: "0 4px 14px rgba(56, 97, 251, 0.4)" }}>
          <CreditCard size={18} strokeWidth={1.8} />
          <span>{isDeposit ? "Deposit" : "Withdraw"} now</span>
        </button>
      </div>

      {pending.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", backgroundColor: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.28)", borderRadius: "10px", padding: "14px 16px", marginTop: "24px", marginBottom: "16px", boxSizing: "border-box", width: "100%" }}>
          <Clock size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#fef3c7" }}>
                {isDeposit ? "Deposit" : "Withdrawal"} Pending Confirmation ({pending.length})
              </span>
              <span style={{ padding: "3px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", whiteSpace: "nowrap", flexShrink: 0 }}>Pending Confirmation</span>
            </div>
            <p style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.55", color: "#fde68a" }}>
              {pending.length === 1 ? <>
                Your {noun} of <strong>{pending[0].amount}</strong> ({pending[0].totalUSD}) submitted on {pending[0].date} is currently awaiting confirmation. {isDeposit ? "Funds will reflect in your balance and assets once approved." : "Funds are held securely until approved."}
              </> : <>
                You have {pending.length} {plural} currently awaiting confirmation. {isDeposit ? "They will reflect in your balance and assets once approved by the system." : "They will be processed once verified."}
              </>}
            </p>
          </div>
        </div>
      )}

      <div className="tp-filter-bar">
        <div className="tp-search-box">
          <Search size={17} color="rgba(255, 255, 255, 0.45)" />
          <input type="text" placeholder={`Search for ${plural}`} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="tp-search-input" />
        </div>
        <div className="tp-dropdown-box">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="tp-select">
            <option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
          <ChevronDown size={14} className="tp-dropdown-arrow" />
        </div>
      </div>

      <div className="tp-table-wrapper">
        <table className="tp-table">
          <thead className="tp-thead"><tr><th>Date</th><th>Reference</th><th>Method</th><th className="tp-desktop-col">Type</th><th>Amount</th><th>Status</th><th className="tp-desktop-col">Total (USD)</th></tr></thead>
          <tbody className="tp-tbody">
            {loading ? <tr><td colSpan={7} className="tp-empty-row" style={{ color: "rgba(255,255,255,0.4)" }}>Loading {plural}...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7} className="tp-empty-row">You have not made any {plural} yet,{" "}<a className="tp-link-action" onClick={() => openModal(modal)}>click here to make a {noun}.</a></td></tr>
                : filtered.map((transaction) => <tr key={transaction.id}>
                  <td>{transaction.date}</td><td style={{ fontFamily: "monospace", color: "#38bdf8" }}>{transaction.reference}</td><td>{transaction.method}</td><td className="tp-desktop-col">{transaction.type}</td><td style={{ fontWeight: 600 }}>{transaction.amount}</td>
                  <td><span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", backgroundColor: transaction.status === "approved" ? "rgba(16, 185, 129, 0.15)" : transaction.status === "rejected" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.18)", color: transaction.status === "approved" ? "#10b981" : transaction.status === "rejected" ? "#ef4444" : "#fbbf24" }}>
                    {transaction.status === "pending" && <Clock size={11} />}{transaction.status === "pending" ? "Pending Confirmation" : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).toLowerCase()}
                  </span></td>
                  <td className="tp-desktop-col" style={{ fontWeight: 600 }}>{transaction.totalUSD}</td>
                </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
