"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  Search,
  Loader2,
  Trash2,
  Edit2,
  Plus,
  DollarSign,
  Layers,
  CheckCircle2,
  XCircle,
  X,
  Save,
} from "lucide-react";
import styles from "../page.module.css";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";
import CustomNotificationBar, { CustomNotificationState } from "@/components/UI/CustomNotificationBar";

const usd = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface AdminTrade {
  id: string;
  userId: string;
  userEmail: string | null;
  userFullName: string | null;
  username: string | null;
  symbol: string;
  type: string;
  amount: number;
  entryPrice: number;
  leverage: number;
  status: string;
  pnl: number;
  closedAt: string | null;
  createdAt: string;
  duration?: string;
  closeAt?: string | null;
  customPnl?: number | null;
  isCustomPnl?: boolean;
}

export default function TradesSection({
  users,
  flash,
}: {
  users: Array<{ id: string; email: string; fullName: string | null }>;
  flash: (kind: "ok" | "error", text: string) => void;
}) {
  const [trades, setTrades] = useState<AdminTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");

  // Edit / Add modal
  const [editTrade, setEditTrade] = useState<Partial<AdminTrade> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Custom UI modals & notifications (No native alert or confirm)
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);
  const [notification, setNotification] = useState<CustomNotificationState | null>(null);

  const loadTrades = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/trades", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTrades(data.positions || []);
      } else {
        if (!silent) flash("error", "Failed to load trades.");
      }
    } catch {
      if (!silent) flash("error", "Network error while loading trades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadTrades(true);
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const handleSaveTrade = async () => {
    if (!editTrade) return;
    setSubmitting(true);
    try {
      if (editTrade.id) {
        // Update trade
        const res = await fetch("/api/admin/trades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            positionId: editTrade.id,
            pnl: Number(editTrade.pnl || 0),
            status: editTrade.status,
          }),
        });
        if (!res.ok) throw new Error("Failed to update trade");
        flash("ok", "Trade position updated.");
      } else {
        // Create trade
        if (!editTrade.userId || !editTrade.symbol || !editTrade.amount) {
          throw new Error("Please fill in User, Symbol, and Amount");
        }
        const res = await fetch("/api/admin/trades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            userId: editTrade.userId,
            symbol: editTrade.symbol,
            type: editTrade.type || "BUY",
            amount: Number(editTrade.amount),
            entryPrice: Number(editTrade.entryPrice || 1),
            leverage: Number(editTrade.leverage || 1),
            status: editTrade.status || "OPEN",
            pnl: Number(editTrade.pnl || 0),
          }),
        });
        if (!res.ok) throw new Error("Failed to create trade");
        flash("ok", "Trade position created.");
      }
      setEditTrade(null);
      loadTrades();
    } catch (e: any) {
      flash("error", e.message || "Failed to save trade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectClose = (trade: AdminTrade) => {
    setConfirmState({
      title: "Close Position & Settle Funds",
      message: `Close position on ${trade.symbol} for ${trade.userEmail || "user"} now?\nLocked margin + PnL of ${usd(
        trade.pnl
      )} will be settled directly to user's wallet.`,
      confirmText: "Close Position",
      cancelText: "Cancel",
      danger: true,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await fetch("/api/admin/trades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "close",
              positionId: trade.id,
              pnl: trade.pnl,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Failed to close trade");
          setNotification({ type: "success", message: "Trade closed successfully & funds returned to user wallet." });
          flash("ok", "Trade closed successfully & funds returned to user wallet.");
          loadTrades();
        } catch (e: any) {
          setNotification({ type: "error", message: e.message || "Failed to close trade" });
          flash("error", e.message || "Failed to close trade");
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleCloseFromModal = () => {
    if (!editTrade || !editTrade.id) return;
    const finalProfit = Number(editTrade.pnl || 0);
    setConfirmState({
      title: "Close Trade with Adjusted Profit",
      message: `Immediately close trade #${editTrade.id.slice(0, 8)} with profit/loss of ${usd(
        finalProfit
      )}?\nThis will return the invested margin plus ${usd(finalProfit)} to the investor's balance.`,
      confirmText: "Close & Settle Now",
      cancelText: "Keep Open",
      danger: true,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await fetch("/api/admin/trades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "close",
              positionId: editTrade.id,
              pnl: finalProfit,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Failed to close trade");
          setNotification({ type: "success", message: "Trade closed and settled to user wallet." });
          flash("ok", "Trade closed and settled to user wallet.");
          setEditTrade(null);
          loadTrades();
        } catch (e: any) {
          setNotification({ type: "error", message: e.message || "Failed to close trade" });
          flash("error", e.message || "Failed to close trade");
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleDeleteTrade = (id: string) => {
    setConfirmState({
      title: "Delete Trade Position",
      message: "Are you sure you want to delete this trade position record? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/trades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", positionId: id }),
          });
          if (!res.ok) throw new Error("Delete failed");
          setNotification({ type: "success", message: "Trade position deleted." });
          flash("ok", "Trade position deleted.");
          loadTrades();
        } catch (e: any) {
          setNotification({ type: "error", message: e.message || "Failed to delete" });
          flash("error", e.message || "Failed to delete");
        }
      },
    });
  };

  const filteredTrades = useMemo(() => {
    let list = trades;
    if (filterStatus !== "ALL") {
      list = list.filter((t) => t.status === filterStatus);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          (t.userEmail && t.userEmail.toLowerCase().includes(q)) ||
          (t.userFullName && t.userFullName.toLowerCase().includes(q)) ||
          t.symbol.toLowerCase().includes(q)
      );
    }
    return list;
  }, [trades, filterStatus, query]);

  const totalVolume = useMemo(() => trades.reduce((a, t) => a + (t.amount || 0), 0), [trades]);
  const totalPnL = useMemo(() => trades.reduce((a, t) => a + (t.pnl || 0), 0), [trades]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(71, 99, 240, 0.15)", color: "#7a94ff" }}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : trades.length}
          </div>
          <div className={styles.statLabel}>Total Trades</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CheckCircle2 size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : trades.filter((t) => t.status === "OPEN").length}
          </div>
          <div className={styles.statLabel}>Open Positions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(245, 165, 36, 0.15)", color: "#fbbf24" }}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : usd(totalVolume)}
          </div>
          <div className={styles.statLabel}>Total Trading Volume</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c4b5fd" }}>
            <Layers size={18} />
          </div>
          <div className={styles.statValue} style={{ color: totalPnL >= 0 ? "#34d399" : "#ff7a87" }}>
            {loading ? (
              <span className={styles.skeletonStatVal} />
            ) : totalPnL >= 0 ? (
              `+${usd(totalPnL)}`
            ) : (
              `-${usd(Math.abs(totalPnL))}`
            )}
          </div>
          <div className={styles.statLabel}>Net User PnL</div>
        </div>
      </div>

      {/* Trades Table */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Trades & Orders</h2>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", width: "100%", maxWidth: "560px" }}>
            <div className={styles.searchBox} style={{ flex: "1 1 200px" }}>
              <Search size={15} />
              <input
                type="search"
                placeholder="Filter by user or symbol..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--a-border)",
                background: "var(--a-raised)",
                color: "#fff",
                fontSize: "13px",
                flex: "0 1 auto",
                boxSizing: "border-box",
              }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open Only</option>
              <option value="CLOSED">Closed Only</option>
            </select>
            <button
              type="button"
              className={styles.btnPrimarySm}
              style={{ height: "40px", flexShrink: 0 }}
              onClick={() =>
                setEditTrade({
                  userId: users[0]?.id || "",
                  symbol: "BTC/USDT",
                  type: "BUY",
                  amount: 1000,
                  entryPrice: 90000,
                  leverage: 10,
                  status: "OPEN",
                  pnl: 0,
                })
              }
            >
              <Plus size={15} /> Add Trade
            </button>
          </div>
        </div>

        <div className={styles.tableWrap} style={{ minHeight: "220px" }}>
          <table className={styles.table} style={{ minWidth: "920px", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ width: "160px" }}>User</th>
                <th style={{ width: "90px" }}>Symbol</th>
                <th style={{ width: "65px" }}>Type</th>
                <th className={styles.right} style={{ width: "100px" }}>Invested Amount</th>
                <th className={styles.right} style={{ width: "90px" }}>Entry Price</th>
                <th className={styles.right} style={{ width: "50px" }}>Lev.</th>
                <th className={styles.right} style={{ width: "90px" }}>PnL</th>
                <th style={{ width: "75px" }}>Status</th>
                <th style={{ width: "100px" }}>Date</th>
                <th style={{ width: "100px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ width: "160px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div className={styles.skeletonCell} style={{ width: 110 }} />
                        <div className={styles.skeletonCell} style={{ width: 75 }} />
                      </div>
                    </td>
                    <td style={{ width: "90px" }}><div className={styles.skeletonCell} style={{ width: 55 }} /></td>
                    <td style={{ width: "65px" }}><div className={styles.skeletonCell} style={{ width: 40 }} /></td>
                    <td className={styles.right} style={{ width: "100px" }}><div className={styles.skeletonCell} style={{ width: 60, marginLeft: "auto" }} /></td>
                    <td className={styles.right} style={{ width: "90px" }}><div className={styles.skeletonCell} style={{ width: 60, marginLeft: "auto" }} /></td>
                    <td className={styles.right} style={{ width: "50px" }}><div className={styles.skeletonCell} style={{ width: 30, marginLeft: "auto" }} /></td>
                    <td className={styles.right} style={{ width: "90px" }}><div className={styles.skeletonCell} style={{ width: 55, marginLeft: "auto" }} /></td>
                    <td style={{ width: "75px" }}><div className={styles.skeletonCell} style={{ width: 45 }} /></td>
                    <td style={{ width: "100px" }}><div className={styles.skeletonCell} style={{ width: 65 }} /></td>
                    <td style={{ width: "100px", textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 65, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "48px 24px", color: "var(--a-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <TrendingUp size={26} style={{ opacity: 0.35 }} />
                      <span>No trades found matching criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{(t.userEmail?.[0] || "U").toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{t.userFullName || t.username || "Investor"}</div>
                          <div className={styles.faint}>{t.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {t.symbol}
                      {t.duration && (
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 500,
                            color: "var(--a-muted)",
                            marginLeft: "6px",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(255,255,255,0.06)",
                          }}
                        >
                          {t.duration}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.pill} ${t.type === "BUY" ? styles.pillGreen : styles.pillRed}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`${styles.right} ${styles.mono}`}>{usd(t.amount)}</td>
                    <td className={`${styles.right} ${styles.mono}`}>{usd(t.entryPrice)}</td>
                    <td className={`${styles.right} ${styles.mono}`}>{t.leverage}x</td>
                    <td className={`${styles.right} ${styles.mono}`} style={{ color: t.pnl >= 0 ? "#34d399" : "#ff7a87", fontWeight: 700 }}>
                      {t.pnl >= 0 ? `+${usd(t.pnl)}` : `-${usd(Math.abs(t.pnl))}`}
                      {t.isCustomPnl && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "9.5px",
                            color: "#c4b5fd",
                            fontWeight: 500,
                          }}
                        >
                          custom set
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.pill} ${t.status === "OPEN" ? styles.pillGreen : styles.pillAmber}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className={styles.faint} style={{ fontSize: "12px" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        {t.status === "OPEN" && (
                          <button
                            type="button"
                            onClick={() => handleDirectClose(t)}
                            disabled={submitting}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#f87171",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                            title="Close Trade & Settle User Funds"
                          >
                            Close
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.btnGhostSm}
                          onClick={() => setEditTrade({ ...t })}
                          title="Edit PnL & Status"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className={styles.btnDangerSm}
                          onClick={() => handleDeleteTrade(t.id)}
                          title="Delete Trade"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit / Add Trade Modal */}
      {editTrade && (
        <div className={styles.modalBackdrop} onClick={() => !submitting && setEditTrade(null)}>
          <div
            className={styles.modal}
            style={{ width: "100%", maxWidth: "520px", boxSizing: "border-box", padding: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <h2>{editTrade.id ? "Edit Position PnL & Status" : "Create New Trade Position"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setEditTrade(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "14px", marginTop: "12px", width: "100%" }}>
              {!editTrade.id && (
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Select User
                  </label>
                  <select
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editTrade.userId || ""}
                    onChange={(e) => setEditTrade({ ...editTrade, userId: e.target.value })}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} ({u.fullName || "User"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Symbol
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editTrade.symbol || ""}
                    disabled={!!editTrade.id}
                    onChange={(e) => setEditTrade({ ...editTrade, symbol: e.target.value })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Type
                  </label>
                  <select
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editTrade.type || "BUY"}
                    disabled={!!editTrade.id}
                    onChange={(e) => setEditTrade({ ...editTrade, type: e.target.value })}
                  >
                    <option value="BUY">BUY (Long)</option>
                    <option value="SELL">SELL (Short)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editTrade.amount ?? 1000}
                    disabled={!!editTrade.id}
                    onChange={(e) => setEditTrade({ ...editTrade, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    PnL ($ Profit / Loss)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editTrade.pnl ?? 0}
                    onChange={(e) => setEditTrade({ ...editTrade, pnl: Number(e.target.value) })}
                    placeholder="e.g. 250 or -50"
                  />
                  {/* Preset quick buttons */}
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6, width: "100%" }}>
                    {[50, 100, 250, 500, 1000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEditTrade({ ...editTrade, pnl: v })}
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          borderRadius: "4px",
                          border: "1px solid rgba(52, 211, 153, 0.3)",
                          background: "rgba(52, 211, 153, 0.12)",
                          color: "#34d399",
                          cursor: "pointer",
                        }}
                      >
                        +${v}
                      </button>
                    ))}
                    {[-50, -100, -250, -500].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEditTrade({ ...editTrade, pnl: v })}
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          borderRadius: "4px",
                          border: "1px solid rgba(248, 113, 113, 0.3)",
                          background: "rgba(248, 113, 113, 0.12)",
                          color: "#f87171",
                          cursor: "pointer",
                        }}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {editTrade.duration && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 6,
                    background: "rgba(71, 99, 240, 0.08)",
                    border: "1px solid rgba(71, 99, 240, 0.2)",
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.8)",
                    boxSizing: "border-box",
                  }}
                >
                  <strong>Duration:</strong> {editTrade.duration}{" "}
                  {editTrade.closeAt && (
                    <span style={{ color: "var(--a-muted)", marginLeft: 6 }}>
                      (Auto-closes at: {new Date(editTrade.closeAt).toLocaleTimeString()})
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                  Status
                </label>
                <select
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                  value={editTrade.status || "OPEN"}
                  onChange={(e) => setEditTrade({ ...editTrade, status: e.target.value })}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div
              className={styles.modalActions}
              style={{
                marginTop: "20px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                width: "100%",
              }}
            >
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setEditTrade(null)}
                disabled={submitting}
                style={{ flex: "1 1 100px" }}
              >
                Cancel
              </button>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: "2 1 240px", justifyContent: "flex-end" }}>
                {editTrade.id && editTrade.status === "OPEN" && (
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 6,
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#f87171",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      flex: "1 1 auto",
                    }}
                    onClick={handleCloseFromModal}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={15} className={styles.spin} /> : <XCircle size={15} />}
                    Close Trade Now
                  </button>
                )}
                <button
                  type="button"
                  className={styles.btnSuccess}
                  onClick={handleSaveTrade}
                  disabled={submitting}
                  style={{ flex: "1 1 auto" }}
                >
                  {submitting ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                  {editTrade.id ? "Save Profit (Keep Open)" : "Create Trade"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal (No native confirm) */}
      <CustomConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
        loading={submitting}
      />

      {/* Custom Notification Bar */}
      <CustomNotificationBar
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
