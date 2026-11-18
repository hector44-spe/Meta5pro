"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Cpu } from "lucide-react";
import styles from "../page.module.css";
import { MiningPool, UserMiningRecord } from "@/lib/miningData";

export default function MiningSection() {
  const [pools, setPools] = useState<MiningPool[]>([]);
  const [minings, setMinings] = useState<UserMiningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<MiningPool | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "BTC",
    badge: "BTC Pool",
    min: 1,
    max: 10,
    roi: 100,
    cycle: "Daily",
    hashrate: "18,036,473 GH/s",
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
      min: 1,
      max: 10,
      roi: 100,
      cycle: "Daily",
      hashrate: "18,036,473 GH/s",
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

  return (
    <div>
      <section className={styles.card} style={{ marginBottom: "24px" }}>
        <div className={styles.cardHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2><Cpu size={17} /> Cloud Mining Pools Management</h2>
            <span className={styles.countChip}>{pools.length}</span>
          </div>
          <button type="button" className={styles.btnPrimarySm} onClick={handleOpenAdd}>
            <Plus size={15} /> Add Mining Pool
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: "750px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>Miner Name</th>
                <th style={{ minWidth: "110px" }}>Badge</th>
                <th style={{ minWidth: "120px" }}>Min</th>
                <th style={{ minWidth: "120px" }}>Max</th>
                <th style={{ minWidth: "100px" }}>ROI (%)</th>
                <th style={{ minWidth: "150px" }}>Hashrate</th>
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
              ) : pools.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--a-muted)" }}>
                    No mining pools configured.
                  </td>
                </tr>
              ) : (
                pools.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className={styles.mono}>{p.badge}</td>
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
          <h2>User Active Mining Contracts</h2>
          <span className={styles.countChip}>{minings.length}</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: "850px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>User</th>
                <th style={{ minWidth: "150px" }}>Pool</th>
                <th style={{ minWidth: "120px" }}>Invested</th>
                <th style={{ minWidth: "100px" }}>ROI</th>
                <th style={{ minWidth: "110px" }}>Status</th>
                <th style={{ minWidth: "130px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {minings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--a-muted)" }}>
                    No active mining contracts found.
                  </td>
                </tr>
              ) : (
                minings.map((m) => (
                  <tr key={m.id}>
                    <td><small>{m.userEmail || m.userId}</small></td>
                    <td style={{ fontWeight: 600 }}>{m.poolName}</td>
                    <td>{m.amount} {m.symbol}</td>
                    <td style={{ color: "#34d399", fontWeight: 600 }}>+{m.roi}%</td>
                    <td>
                      <span className={`${styles.pill} ${m.status === "ACTIVE" ? styles.pillGreen : styles.pillAmber}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className={styles.muted}>{new Date(m.startDate).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className={`${styles.modalBackdrop} project-edit-modal-overlay`} onClick={() => setIsModalOpen(false)}>
          <div className={`${styles.modal} project-edit-modal-dialog`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className={styles.modalHead}>
              <h2>{editingPool ? "Edit Mining Pool" : "Add Mining Pool"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setIsModalOpen(false)}>✕</button>
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
                <div>
                  <label className={styles.label}>Badge</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className={styles.label}>Min (BTC)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.min}
                      onChange={(e) => setFormData({ ...formData, min: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Max (BTC)</label>
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
                    <label className={styles.label}>ROI (%)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.roi}
                      onChange={(e) => setFormData({ ...formData, roi: Number(e.target.value) })}
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
