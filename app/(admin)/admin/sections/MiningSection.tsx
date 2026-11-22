"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Edit2, Trash2, Loader2, Cpu, Search, CheckCircle2, RefreshCw, XCircle, Zap, X } from "lucide-react";
import styles from "../page.module.css";
import { MiningPool, UserMiningRecord } from "@/lib/miningData";

export default function MiningSection() {
  const [pools, setPools] = useState<MiningPool[]>([]);
  const [minings, setMinings] = useState<UserMiningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [accruing, setAccruing] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  // Edit / Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<MiningPool | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "BTC",
    badge: "BTC Pool",
    min: 0.01,
    max: 10,
    roi: 100,
    cycle: "Daily",
    hashrate: "18,036,473 GH/s",
    hardwareImage: "/assets/coins/l9.png",
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/mining");
      const data = await res.json();
      if (data.pools) setPools(data.pools);
      if (data.minings) setMinings(data.minings);
    } catch (e) {
      console.error("Failed to load admin mining:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPool(null);
    setFormData({
      name: "",
      symbol: "BTC",
      badge: "BTC Pool",
      min: 0.01,
      max: 10,
      roi: 100,
      cycle: "Daily",
      hashrate: "18,036,473 GH/s",
      hardwareImage: "/assets/coins/l9.png",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pool: MiningPool) => {
    setEditingPool(pool);
    setFormData({
      name: pool.name,
      symbol: pool.symbol,
      badge: pool.badge,
      min: pool.min,
      max: pool.max,
      roi: pool.roi,
      cycle: pool.cycle,
      hashrate: pool.hashrate,
      hardwareImage: pool.hardwareImage || "/assets/coins/l9.png",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/mining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_pool",
          pool: {
            id: editingPool ? editingPool.id : undefined,
            ...formData,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save pool");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (poolId: string) => {
    if (!confirm("Are you sure you want to delete this mining pool?")) return;
    try {
      const res = await fetch("/api/admin/mining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_pool", poolId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCompleteMining = async (miningId: string) => {
    if (!confirm("Complete this mining contract now? This will payout the principal plus accrued return directly to the user's cash balance.")) return;
    setActionBusy(miningId);
    try {
      const res = await fetch("/api/admin/mining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete_mining", miningId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete mining contract");
      alert(data.message || "Mining contract completed and paid out successfully.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to complete mining contract");
    } finally {
      setActionBusy(null);
    }
  };

  const handleCancelMining = async (miningId: string) => {
    if (!confirm("Cancel this mining contract and refund the user's principal? Accrued yield will be forfeited.")) return;
    setActionBusy(miningId);
    try {
      const res = await fetch("/api/admin/mining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel_mining", miningId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel mining contract");
      alert(data.message || "Mining contract cancelled and refunded successfully.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel mining contract");
    } finally {
      setActionBusy(null);
    }
  };

  const handleTriggerAccrual = async () => {
    setAccruing(true);
    try {
      const res = await fetch("/api/mining/accrue", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Accrual failed");
      alert(`Accrual Complete!\nProcessed: ${data.processed} contracts\nAccrued Hash Profit: $${data.totalAccruedProfitUsd?.toFixed(2)}\nMatured & Settled: ${data.settled}`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Accrual failed");
    } finally {
      setAccruing(false);
    }
  };

  const filteredPools = pools.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMinings = minings.filter(
    (m) =>
      m.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.poolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <section className={styles.card} style={{ marginBottom: "24px" }}>
        <div className={styles.cardHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2><Cpu size={17} /> Mining Pools Management</h2>
            <span className={styles.countChip}>{pools.length}</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className={styles.btnSecondarySm}
              onClick={handleTriggerAccrual}
              disabled={accruing}
              title="Calculate and credit daily cloud mining profits for all active users"
            >
              {accruing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>Run Daily Accrual</span>
            </button>
            <button type="button" className={styles.btnPrimarySm} onClick={handleOpenAdd}>
              <Plus size={15} /> Add Pool
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: "750px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>Pool Name</th>
                <th style={{ minWidth: "120px" }}>Badge / Asset</th>
                <th style={{ minWidth: "120px" }}>Min Deposit</th>
                <th style={{ minWidth: "120px" }}>Max Deposit</th>
                <th style={{ minWidth: "100px" }}>ROI (%)</th>
                <th style={{ minWidth: "140px" }}>Hashrate</th>
                <th style={{ minWidth: "120px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px" }}>
                    <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto" }} />
                  </td>
                </tr>
              ) : filteredPools.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--a-muted)" }}>
                    No mining pools configured.
                  </td>
                </tr>
              ) : (
                filteredPools.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className={styles.mono}>{p.badge} ({p.symbol})</td>
                    <td>{p.min} {p.symbol}</td>
                    <td>{p.max} {p.symbol}</td>
                    <td style={{ color: "#34d399", fontWeight: 600 }}>+{p.roi}%</td>
                    <td>{p.hashrate}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button type="button" className={styles.btnGhostSm} onClick={() => handleOpenEdit(p)}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button type="button" className={styles.btnDangerSm} onClick={() => handleDelete(p.id)}>
                          <Trash2 size={13} />
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

      {/* User Mining Contracts */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>User Active & Closed Mining Contracts</h2>
            <div style={{ fontSize: "12.5px", color: "var(--a-muted)", marginTop: "2px" }}>
              Settlement returns original principal plus accrued yield to user wallet upon maturity or manual settlement.
            </div>
          </div>
          <span className={styles.countChip}>{minings.length}</span>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--a-line)" }}>
          <div style={{ position: "relative", maxWidth: "320px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--a-muted)" }} />
            <input
              type="text"
              placeholder="Search user email or pool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.input}
              style={{ paddingLeft: "30px", height: "34px", fontSize: "12.5px" }}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: "980px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "170px" }}>User</th>
                <th style={{ minWidth: "140px" }}>Pool / Miner</th>
                <th style={{ minWidth: "130px" }}>Invested (USD)</th>
                <th style={{ minWidth: "100px" }}>ROI</th>
                <th style={{ minWidth: "130px" }}>Expected Return</th>
                <th style={{ minWidth: "130px" }}>Accrued Profit</th>
                <th style={{ minWidth: "110px" }}>Duration</th>
                <th style={{ minWidth: "100px" }}>Status</th>
                <th style={{ minWidth: "180px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {minings.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "var(--a-muted)" }}>
                    No active mining contracts found.
                  </td>
                </tr>
              ) : (
                filteredMinings.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div style={{ fontWeight: 600 }}>{m.userFullName || m.userEmail?.split("@")[0] || "User"}</div>
                        <small>{m.userEmail || m.userId}</small>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.poolName}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>${m.usdValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <small style={{ color: "var(--a-muted)" }}>{m.amount} {m.symbol}</small>
                    </td>
                    <td style={{ color: "#34d399", fontWeight: 600 }}>+{m.roi}%</td>
                    <td>
                      <div style={{ color: "#34d399", fontWeight: 600 }}>
                        ${m.expectedReturnUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <small style={{ color: "var(--a-muted)" }}>Principal + Yield</small>
                    </td>
                    <td>
                      <div style={{ color: "#34d399", fontWeight: 600 }}>
                        +${m.accruedProfitUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <small style={{ color: "var(--a-muted)" }}>Accrued to date</small>
                    </td>
                    <td>
                      <div>{m.durationDays}d</div>
                      <small style={{ color: m.daysRemaining <= 0 ? "#34d399" : "var(--a-muted)" }}>
                        {m.daysRemaining}d left
                      </small>
                    </td>
                    <td>
                      <span
                        className={`${styles.pill} ${
                          m.status === "ACTIVE"
                            ? styles.pillGreen
                            : m.status === "COMPLETED"
                            ? styles.pillCyan
                            : styles.pillAmber
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {m.status === "ACTIVE" ? (
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className={styles.btnSuccessSm}
                            onClick={() => handleCompleteMining(m.id)}
                            disabled={actionBusy === m.id}
                            title="Complete and payout full return"
                          >
                            {actionBusy === m.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            <span>Complete</span>
                          </button>
                          <button
                            type="button"
                            className={styles.btnDangerSm}
                            onClick={() => handleCancelMining(m.id)}
                            disabled={actionBusy === m.id}
                            title="Cancel contract and refund principal"
                          >
                            <XCircle size={12} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--a-muted)" }}>
                          {m.status === "COMPLETED" ? "Paid Out" : "Refunded"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && typeof document !== "undefined"
        ? createPortal(
            <div className={`${styles.modalBackdrop} project-edit-modal-overlay`} onClick={() => setIsModalOpen(false)}>
              <div className={`${styles.modal} project-edit-modal-dialog`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
                <div className={styles.modalHead}>
                  <h2>{editingPool ? "Edit Mining Pool" : "Add Mining Pool"}</h2>
                  <button type="button" className={styles.iconBtn} onClick={() => setIsModalOpen(false)} aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
            <div className={styles.modalBody}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className={styles.label}>Miner Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className={styles.label}>Badge</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Symbol</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Hardware Image URL</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.hardwareImage}
                    onChange={(e) => setFormData({ ...formData, hardwareImage: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className={styles.label}>Min Deposit</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.min}
                      onChange={(e) => setFormData({ ...formData, min: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Max Deposit</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.max}
                      onChange={(e) => setFormData({ ...formData, max: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className={styles.label}>Annual ROI (%)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.roi}
                      onChange={(e) => setFormData({ ...formData, roi: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Hashrate</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData.hashrate}
                      onChange={(e) => setFormData({ ...formData, hashrate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button type="button" className={styles.btnGhost} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="button" className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Pool"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
