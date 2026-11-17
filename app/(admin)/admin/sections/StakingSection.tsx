"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Layers, Search, CheckCircle2 } from "lucide-react";
import styles from "../page.module.css";
import { StakingPool, UserStakeRecord } from "@/lib/stakingData";

export default function StakingSection() {
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [stakes, setStakes] = useState<UserStakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit / Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<StakingPool | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    min: 1,
    max: 1000,
    cycle: "Daily",
    roi: 84,
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staking");
      const data = await res.json();
      if (data.pools) setPools(data.pools);
      if (data.stakes) setStakes(data.stakes);
    } catch (e) {
      console.error("Failed to load admin staking:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPool(null);
    setFormData({ name: "", symbol: "", min: 1, max: 1000, cycle: "Daily", roi: 84 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pool: StakingPool) => {
    setEditingPool(pool);
    setFormData({
      name: pool.name,
      symbol: pool.symbol,
      min: pool.min,
      max: pool.max,
      cycle: pool.cycle,
      roi: pool.roi,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/staking", {
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
    if (!confirm("Are you sure you want to delete this pool?")) return;
    try {
      const res = await fetch("/api/admin/staking", {
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

  const filteredPools = pools.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <section className={styles.card} style={{ marginBottom: "24px" }}>
        <div className={styles.cardHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2><Layers size={17} /> Staking Pools Management</h2>
            <span className={styles.countChip}>{pools.length}</span>
          </div>
          <button type="button" className={styles.btnPrimarySm} onClick={handleOpenAdd}>
            <Plus size={15} /> Add Pool
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: "750px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>Pool Name</th>
                <th style={{ minWidth: "100px" }}>Symbol</th>
                <th style={{ minWidth: "120px" }}>Min Deposit</th>
                <th style={{ minWidth: "120px" }}>Max Deposit</th>
                <th style={{ minWidth: "100px" }}>Cycle</th>
                <th style={{ minWidth: "100px" }}>ROI (%)</th>
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
                    No pools configured.
                  </td>
                </tr>
              ) : (
                filteredPools.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className={styles.mono}>{p.symbol}</td>
                    <td>{p.min} {p.symbol}</td>
                    <td>{p.max} {p.symbol}</td>
                    <td>{p.cycle}</td>
                    <td style={{ color: "#34d399", fontWeight: 600 }}>+{p.roi}%</td>
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

      {/* User Stakes Table */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2>User Active & Closed Stakes</h2>
          <span className={styles.countChip}>{stakes.length}</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: "850px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>User</th>
                <th style={{ minWidth: "140px" }}>Pool</th>
                <th style={{ minWidth: "120px" }}>Amount</th>
                <th style={{ minWidth: "100px" }}>ROI</th>
                <th style={{ minWidth: "100px" }}>Duration</th>
                <th style={{ minWidth: "110px" }}>Status</th>
                <th style={{ minWidth: "130px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stakes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--a-muted)" }}>
                    No user stakes recorded yet.
                  </td>
                </tr>
              ) : (
                stakes.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.userCell}>
                        <small>{s.userEmail || s.userId}</small>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.poolName}</td>
                    <td>{s.amount} {s.symbol}</td>
                    <td style={{ color: "#34d399", fontWeight: 600 }}>+{s.roi}%</td>
                    <td>{s.durationDays} days</td>
                    <td>
                      <span className={`${styles.pill} ${s.status === "ACTIVE" ? styles.pillGreen : styles.pillAmber}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className={styles.muted}>{new Date(s.startDate).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className={styles.modalHead}>
              <h2>{editingPool ? "Edit Pool" : "Add Pool"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className={styles.label}>Pool Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className={styles.label}>Min</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.min}
                      onChange={(e) => setFormData({ ...formData, min: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Max</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.max}
                      onChange={(e) => setFormData({ ...formData, max: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className={styles.label}>Cycle</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData.cycle}
                      onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>ROI (%)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.roi}
                      onChange={(e) => setFormData({ ...formData, roi: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button type="button" className={styles.btnSecondary} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="button" className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Pool"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
