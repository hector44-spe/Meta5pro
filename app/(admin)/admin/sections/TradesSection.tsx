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

  const loadTrades = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trades");
      if (res.ok) {
        const data = await res.json();
        setTrades(data.positions || []);
      } else {
        flash("error", "Failed to load trades.");
      }
    } catch {
      flash("error", "Network error while loading trades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
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

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade position?")) return;
    try {
      const res = await fetch("/api/admin/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", positionId: id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      flash("ok", "Trade position deleted.");
      loadTrades();
    } catch (e: any) {
      flash("error", e.message || "Failed to delete");
    }
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(71, 99, 240, 0.15)", color: "#7a94ff" }}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.statValue}>{trades.length}</div>
          <div className={styles.statLabel}>Total Trades</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CheckCircle2 size={18} />
          </div>
          <div className={styles.statValue}>{trades.filter((t) => t.status === "OPEN").length}</div>
          <div className={styles.statLabel}>Open Positions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(245, 165, 36, 0.15)", color: "#fbbf24" }}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statValue}>{usd(totalVolume)}</div>
          <div className={styles.statLabel}>Total Trading Volume</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c4b5fd" }}>
            <Layers size={18} />
          </div>
          <div className={styles.statValue} style={{ color: totalPnL >= 0 ? "#34d399" : "#ff7a87" }}>
            {totalPnL >= 0 ? `+${usd(totalPnL)}` : `-${usd(Math.abs(totalPnL))}`}
          </div>
          <div className={styles.statLabel}>Net User PnL</div>
        </div>
      </div>

      {/* Trades Table */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>User Trades & Orders</h2>
            <p>Live trading orders and positions funded by platform users.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className={styles.searchBox}>
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
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--a-border)",
                background: "var(--a-raised)",
                color: "#fff",
                fontSize: "13px",
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

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Invested Amount</th>
                <th>Entry Price</th>
                <th>Lev.</th>
                <th>PnL</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "32px", color: "var(--a-muted)" }}>
                    <Loader2 size={20} className={styles.spin} style={{ display: "inline-block", marginRight: 8 }} />
                    Loading trades...
                  </td>
                </tr>
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "36px", color: "var(--a-muted)" }}>
                    No trades found matching criteria.
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
                    <td style={{ fontWeight: 700 }}>{t.symbol}</td>
                    <td>
                      <span className={`${styles.pill} ${t.type === "BUY" ? styles.pillGreen : styles.pillRed}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={styles.mono}>{usd(t.amount)}</td>
                    <td className={styles.mono}>{usd(t.entryPrice)}</td>
                    <td className={styles.mono}>{t.leverage}x</td>
                    <td className={styles.mono} style={{ color: t.pnl >= 0 ? "#34d399" : "#ff7a87", fontWeight: 700 }}>
                      {t.pnl >= 0 ? `+${usd(t.pnl)}` : `-${usd(Math.abs(t.pnl))}`}
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
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className={styles.btnGhostSm}
                          onClick={() => setEditTrade({ ...t })}
                          title="Edit PnL & Status"
                        >
                          <Edit2 size={14} />
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>{editTrade.id ? "Edit Position PnL & Status" : "Create New Trade Position"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setEditTrade(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
              {!editTrade.id && (
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Select User
                  </label>
                  <select
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Symbol
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
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
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editTrade.type || "BUY"}
                    disabled={!!editTrade.id}
                    onChange={(e) => setEditTrade({ ...editTrade, type: e.target.value })}
                  >
                    <option value="BUY">BUY (Long)</option>
                    <option value="SELL">SELL (Short)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editTrade.amount ?? 1000}
                    disabled={!!editTrade.id}
                    onChange={(e) => setEditTrade({ ...editTrade, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    PnL ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editTrade.pnl ?? 0}
                    onChange={(e) => setEditTrade({ ...editTrade, pnl: Number(e.target.value) })}
                    placeholder="e.g. 250 or -50"
                  />
                </div>
              </div>

              <div>
                <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                  Status
                </label>
                <select
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                  value={editTrade.status || "OPEN"}
                  onChange={(e) => setEditTrade({ ...editTrade, status: e.target.value })}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions} style={{ marginTop: "18px" }}>
              <button type="button" className={styles.btnGhost} onClick={() => setEditTrade(null)} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className={styles.btnSuccess} onClick={handleSaveTrade} disabled={submitting}>
                {submitting ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                Save Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
