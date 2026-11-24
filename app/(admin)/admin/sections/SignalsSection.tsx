"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Radio,
  Search,
  Loader2,
  Trash2,
  Edit2,
  Plus,
  DollarSign,
  Zap,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import styles from "../page.module.css";
import { AdminSignalPurchase, AdminSignalItem } from "@/app/api/admin/signals/route";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";

const usd = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SignalsSection({
  flash,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
}) {
  const [purchases, setPurchases] = useState<AdminSignalPurchase[]>([]);
  const [signals, setSignals] = useState<AdminSignalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Edit / Add Signal package modal
  const [editSignal, setEditSignal] = useState<Partial<AdminSignalItem> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);

  // Edit Purchase Strength modal
  const [editingPurchase, setEditingPurchase] = useState<AdminSignalPurchase | null>(null);
  const [editStrengthVal, setEditStrengthVal] = useState<number>(50);
  const [savingStrength, setSavingStrength] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/signals", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases(data.purchases || []);
        setSignals(data.signals || []);
      } else {
        if (!silent) flash("error", "Failed to load signals data.");
      }
    } catch {
      if (!silent) flash("error", "Network error while loading signals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const handleUpdateStatus = async (userId: string, purchaseId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updatePurchaseStatus", userId, purchaseId, newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      flash("ok", "Signal purchase status updated.");
      loadData();
    } catch (e: any) {
      flash("error", e.message || "Failed to update status");
    }
  };

  const handleSavePurchaseStrength = async () => {
    if (!editingPurchase) return;
    setSavingStrength(true);
    try {
      const res = await fetch("/api/admin/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePurchaseStrength",
          purchaseId: editingPurchase.id || editingPurchase.ref,
          strength: editStrengthVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update strength");
      flash("ok", `Signal strength updated to ${editStrengthVal}%.`);
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === editingPurchase.id || p.ref === editingPurchase.ref
            ? { ...p, strength: editStrengthVal }
            : p
        )
      );
      setEditingPurchase(null);
    } catch (err: any) {
      flash("error", err.message || "Failed to update strength");
    } finally {
      setSavingStrength(false);
    }
  };

  const handleDeletePurchase = (userId: string, purchaseId: string) => {
    setConfirmState({
      title: "Delete Signal Purchase?",
      message: "Are you sure you want to delete this signal purchase record?",
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/signals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deletePurchase", userId, purchaseId }),
          });
          if (!res.ok) throw new Error("Delete failed");
          flash("ok", "Signal purchase deleted.");
          loadData();
        } catch (e: any) {
          flash("error", e.message || "Failed to delete");
        } finally {
          setConfirmState(null);
        }
      },
    });
  };

  const handleSaveSignal = async () => {
    if (!editSignal || !editSignal.name) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveSignal",
          signal: {
            ...editSignal,
            title: editSignal.title || editSignal.name,
            price: Number(editSignal.price || 1000),
            strength: Number(editSignal.strength || 50),
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save signal package");
      flash("ok", "Signal package saved.");
      setEditSignal(null);
      loadData();
    } catch (e: any) {
      flash("error", e.message || "Failed to save signal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSignal = (id: string, name: string) => {
    setConfirmState({
      title: `Delete Signal Package "${name}"?`,
      message: `Are you sure you want to delete this signal package?`,
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/signals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteSignal", signalId: id }),
          });
          if (!res.ok) throw new Error("Failed to delete signal package");
          flash("ok", `Signal package "${name}" deleted.`);
          loadData();
        } catch (e: any) {
          flash("error", e.message || "Failed to delete");
        } finally {
          setConfirmState(null);
        }
      },
    });
  };

  const filteredPurchases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter(
      (p) =>
        p.userEmail.toLowerCase().includes(q) ||
        p.userFullName.toLowerCase().includes(q) ||
        p.signalTitle.toLowerCase().includes(q) ||
        p.ref.toLowerCase().includes(q)
    );
  }, [purchases, query]);

  const totalRevenue = useMemo(() => purchases.reduce((a, p) => a + (p.amount || 0), 0), [purchases]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(71, 99, 240, 0.15)", color: "#7a94ff" }}>
            <Radio size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : purchases.length}
          </div>
          <div className={styles.statLabel}>Total Signal Purchases</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <Zap size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : signals.length}
          </div>
          <div className={styles.statLabel}>Available Signal Tiers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(245, 165, 36, 0.15)", color: "#fbbf24" }}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : usd(totalRevenue)}
          </div>
          <div className={styles.statLabel}>Total Signal Revenue</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c4b5fd" }}>
            <CheckCircle2 size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? (
              <span className={styles.skeletonStatVal} />
            ) : (
              purchases.filter((p) => p.status === "active").length
            )}
          </div>
          <div className={styles.statLabel}>Active Signals</div>
        </div>
      </div>

      {/* Signal Purchases Table */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Signal Purchases</h2>
          </div>
          <div className={styles.searchBox}>
            <Search size={15} />
            <input
              type="search"
              placeholder="Filter by user or signal..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop View (>= 768px) */}
        <div className={styles.tableWrap} style={{ minHeight: "220px" }}>
          <table className={styles.table} style={{ minWidth: "980px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "190px" }}>User</th>
                <th style={{ minWidth: "140px" }}>Signal Purchased</th>
                <th style={{ minWidth: "110px" }}>Strength</th>
                <th className={styles.right} style={{ minWidth: "115px" }}>Amount Paid</th>
                <th style={{ minWidth: "110px" }}>Reference</th>
                <th style={{ minWidth: "125px" }}>Purchase Date</th>
                <th style={{ minWidth: "90px" }}>Status</th>
                <th style={{ minWidth: "150px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className={styles.skeletonCell} style={{ width: 34, height: 34, borderRadius: "50%" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div className={styles.skeletonCell} style={{ width: 110 }} />
                          <div className={styles.skeletonCell} style={{ width: 80 }} />
                        </div>
                      </div>
                    </td>
                    <td><div className={styles.skeletonCell} style={{ width: 100 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 50 }} /></td>
                    <td className={styles.right}><div className={styles.skeletonCell} style={{ width: 65, marginLeft: "auto" }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 75 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 85 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 60 }} /></td>
                    <td style={{ textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 65, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px 24px", color: "var(--a-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Radio size={26} style={{ opacity: 0.35 }} />
                      <span>No signal purchases recorded yet.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{(p.userEmail[0] || "U").toUpperCase()}</div>
                        <div style={{ minWidth: 0, overflow: "hidden" }}>
                          <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.userFullName}</div>
                          <div className={styles.faint} style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.signalTitle}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPurchase(p);
                          setEditStrengthVal(p.strength);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          textAlign: "left",
                        }}
                        title="Click to edit signal strength"
                      >
                        <div style={{ width: "40px", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                          <div style={{ width: `${p.strength}%`, height: "100%", background: "#4763f0" }} />
                        </div>
                        <span className={styles.mono} style={{ fontSize: "12px", color: "var(--color-primary, #3861fb)", textDecoration: "underline" }}>
                          {p.strength}%
                        </span>
                        <Edit2 size={11} style={{ opacity: 0.7 }} />
                      </button>
                    </td>
                    <td className={`${styles.right} ${styles.mono}`} style={{ fontWeight: 700, color: "#34d399" }}>
                      {usd(p.amount)}
                    </td>
                    <td className={styles.mono} style={{ fontSize: "12px" }}>{p.ref}</td>
                    <td className={styles.faint} style={{ fontSize: "12px" }}>
                      {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td>
                      <span className={`${styles.pill} ${p.status === "active" ? styles.pillGreen : styles.pillAmber}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className={styles.btnGhostSm}
                          onClick={() => {
                            setEditingPurchase(p);
                            setEditStrengthVal(p.strength);
                          }}
                          title="Edit Strength"
                        >
                          Edit %
                        </button>
                        <button
                          type="button"
                          className={styles.btnGhostSm}
                          onClick={() => handleUpdateStatus(p.userId, p.ref, p.status === "active" ? "completed" : "active")}
                          title="Toggle Status"
                        >
                          {p.status === "active" ? "Complete" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className={styles.btnDangerSm}
                          onClick={() => handleDeletePurchase(p.userId, p.ref)}
                          title="Delete Record"
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

        {/* Mobile Phone Card List (< 768px) */}
        <ul className={styles.cardList}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div className={styles.skeletonCell} style={{ width: 140 }} />
                  <div className={styles.skeletonCell} style={{ width: 60 }} />
                </div>
                <div className={styles.skeletonCell} style={{ width: "100%", height: 50 }} />
              </li>
            ))
          ) : filteredPurchases.length === 0 ? (
            <li className={styles.itemCard} style={{ textAlign: "center", padding: "36px 16px", color: "var(--a-muted)" }}>
              <Radio size={24} style={{ opacity: 0.35, margin: "0 auto 8px" }} />
              <div>No signal purchases recorded yet.</div>
            </li>
          ) : (
            filteredPurchases.map((p) => (
              <li key={p.id} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>{(p.userEmail[0] || "U").toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{p.userFullName}</div>
                      <div className={styles.faint} style={{ fontSize: "11.5px" }}>{p.userEmail}</div>
                    </div>
                  </div>
                  <span className={`${styles.pill} ${p.status === "active" ? styles.pillGreen : styles.pillAmber}`}>
                    {p.status}
                  </span>
                </div>

                <div className={styles.itemMetaGrid}>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Signal Tier</span>
                    <span className={styles.itemMetaValue}>{p.signalTitle}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Amount Paid</span>
                    <span className={styles.itemMetaValue} style={{ color: "#34d399" }}>{usd(p.amount)}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Confidence</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPurchase(p);
                        setEditStrengthVal(p.strength);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        textAlign: "left",
                      }}
                      title="Edit strength"
                    >
                      <span className={styles.itemMetaValue} style={{ color: "#3861fb", textDecoration: "underline" }}>
                        {p.strength}% Strength
                      </span>
                      <Edit2 size={11} color="#3861fb" />
                    </button>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Reference</span>
                    <span className={styles.itemMetaValue} style={{ fontFamily: "monospace" }}>{p.ref}</span>
                  </div>
                </div>

                <div className={styles.itemBottom}>
                  <span className={styles.faint} style={{ fontSize: "11.5px" }}>
                    {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                    <button
                      type="button"
                      className={styles.btnGhostSm}
                      onClick={() => {
                        setEditingPurchase(p);
                        setEditStrengthVal(p.strength);
                      }}
                      style={{ height: "32px", fontSize: "12px" }}
                      title="Edit Signal Strength"
                    >
                      Edit %
                    </button>
                    <button
                      type="button"
                      className={styles.btnGhostSm}
                      onClick={() => handleUpdateStatus(p.userId, p.ref, p.status === "active" ? "completed" : "active")}
                      style={{ height: "32px", fontSize: "12px" }}
                    >
                      {p.status === "active" ? "Complete" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className={styles.btnDangerSm}
                      onClick={() => handleDeletePurchase(p.userId, p.ref)}
                      style={{ height: "32px", width: "32px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Available Signal Packages */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Signal Packages</h2>
          </div>
          <button
            type="button"
            className={styles.btnPrimarySm}
            onClick={() =>
              setEditSignal({
                name: "Alpha Signal",
                title: "Alpha Signal",
                price: 2500,
                strength: 65,
              })
            }
          >
            <Plus size={15} /> Add Signal Tier
          </button>
        </div>

        <div className={styles.tableWrap} style={{ minHeight: "180px" }}>
          <table className={styles.table} style={{ minWidth: "640px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>Signal Name</th>
                <th className={styles.right} style={{ minWidth: "110px" }}>Price</th>
                <th style={{ minWidth: "160px" }}>Accuracy / Strength</th>
                <th style={{ minWidth: "130px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ minWidth: "160px" }}><div className={styles.skeletonCell} style={{ width: 120 }} /></td>
                    <td className={styles.right} style={{ minWidth: "110px" }}><div className={styles.skeletonCell} style={{ width: 65, marginLeft: "auto" }} /></td>
                    <td style={{ minWidth: "160px" }}><div className={styles.skeletonCell} style={{ width: 90 }} /></td>
                    <td style={{ minWidth: "130px", textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 75, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : signals.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "48px 24px", color: "var(--a-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Radio size={26} style={{ opacity: 0.35 }} />
                      <span>No signal packages configured. Click Add Signal Tier to create one.</span>
                    </div>
                  </td>
                </tr>
              ) : signals.map((sig) => (
                <tr key={sig.id}>
                  <td style={{ fontWeight: 600 }}>{sig.title || sig.name}</td>
                  <td className={`${styles.right} ${styles.mono}`} style={{ fontWeight: 700, color: "#34d399" }}>
                    {usd(sig.price)}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "60px", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                        <div style={{ width: `${sig.strength}%`, height: "100%", background: "#4763f0" }} />
                      </div>
                      <span className={styles.mono}>{sig.strength}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        className={styles.btnGhostSm}
                        onClick={() => setEditSignal({ ...sig })}
                        title="Edit Signal"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        className={styles.btnDangerSm}
                        onClick={() => handleDeleteSignal(sig.id, sig.title || sig.name)}
                        title="Delete Signal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Phone Card List (< 768px) */}
        <ul className={styles.cardList}>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <li key={i} className={styles.itemCard}>
                <div className={styles.skeletonCell} style={{ width: 140 }} />
                <div className={styles.skeletonCell} style={{ width: 80 }} />
              </li>
            ))
          ) : signals.length === 0 ? (
            <li className={styles.itemCard} style={{ textAlign: "center", padding: "24px 16px", color: "var(--a-muted)" }}>
              <div>No signal packages configured.</div>
            </li>
          ) : (
            signals.map((sig) => (
              <li key={sig.id} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <span style={{ fontWeight: 700, fontSize: "14px" }}>{sig.title || sig.name}</span>
                  <span style={{ fontWeight: 700, color: "#34d399", fontSize: "14px" }} className={styles.mono}>
                    {usd(sig.price)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 8 }}>
                  <span style={{ fontSize: "12px", color: "var(--a-muted)" }}>Accuracy / Strength:</span>
                  <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ width: `${sig.strength}%`, height: "100%", background: "#4763f0" }} />
                  </div>
                  <span className={styles.mono} style={{ fontSize: "12px", fontWeight: 600 }}>{sig.strength}%</span>
                </div>
                <div className={styles.itemBottom}>
                  <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                    <button
                      type="button"
                      className={styles.btnGhostSm}
                      onClick={() => setEditSignal({ ...sig })}
                      style={{ height: "32px", fontSize: "12px" }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className={styles.btnDangerSm}
                      onClick={() => handleDeleteSignal(sig.id, sig.title || sig.name)}
                      style={{ height: "32px", width: "32px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Edit / Add Signal Package Modal */}
      {editSignal && typeof document !== "undefined"
        ? createPortal(
            <div
              className={`${styles.modalBackdrop} project-edit-modal-overlay`}
              onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) {
                  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement && document.activeElement.matches("input, textarea, select")) {
                    document.activeElement.blur();
                    return;
                  }
                  setEditSignal(null);
                }
              }}
            >
              <div className={`${styles.modal} project-edit-modal-dialog`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>{editSignal.id ? "Edit Signal Package" : "Add New Signal Package"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setEditSignal(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
              <div>
                <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Signal Name / Title
                </label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                  value={editSignal.title || editSignal.name || ""}
                  onChange={(e) => setEditSignal({ ...editSignal, title: e.target.value, name: e.target.value })}
                  placeholder="e.g. VIP Gold Signals"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                    Price ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                    value={editSignal.price ?? 2000}
                    onChange={(e) => setEditSignal({ ...editSignal, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                    Strength (%)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                    value={editSignal.strength ?? 50}
                    onChange={(e) => setEditSignal({ ...editSignal, strength: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalActions} style={{ marginTop: "18px" }}>
              <button type="button" className={styles.btnGhost} onClick={() => setEditSignal(null)} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className={styles.btnSuccess} onClick={handleSaveSignal} disabled={submitting}>
                {submitting ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                Save Package
              </button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}

      {/* Edit Purchase Strength Modal */}
      {editingPurchase && typeof document !== "undefined"
        ? createPortal(
            <div
              className={`${styles.modalBackdrop} project-edit-modal-overlay`}
              onClick={(e) => {
                if (e.target === e.currentTarget && !savingStrength) {
                  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement && document.activeElement.matches("input, textarea, select")) {
                    document.activeElement.blur();
                    return;
                  }
                  setEditingPurchase(null);
                }
              }}
            >
              <div className={`${styles.modal} project-edit-modal-dialog`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Edit Investor Signal Strength</h2>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setEditingPurchase(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gap: "14px", marginTop: "14px" }}>
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 8,
                  border: "1px solid var(--a-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                  {editingPurchase.signalTitle}
                </div>
                <div className={styles.faint} style={{ fontSize: "12px" }}>
                  Investor: {editingPurchase.userFullName} ({editingPurchase.userEmail})
                </div>
                <div className={styles.mono} style={{ fontSize: "11.5px", color: "var(--a-muted)" }}>
                  Ref: {editingPurchase.ref}
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className={styles.faint} style={{ fontSize: "12px" }}>
                    Signal Strength Percentage
                  </label>
                  <span className={styles.mono} style={{ fontSize: "14px", fontWeight: 700, color: "#3861fb" }}>
                    {editStrengthVal}%
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editStrengthVal}
                    onChange={(e) => setEditStrengthVal(Number(e.target.value))}
                    style={{ flex: 1, accentColor: "#3861fb", cursor: "pointer" }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editStrengthVal}
                    onChange={(e) => setEditStrengthVal(Math.min(100, Math.max(0, Number(e.target.value))))}
                    style={{
                      width: "70px",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid var(--a-border)",
                      background: "var(--a-raised)",
                      color: "#fff",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalActions} style={{ marginTop: "20px" }}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setEditingPurchase(null)}
                disabled={savingStrength}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnSuccess}
                onClick={handleSavePurchaseStrength}
                disabled={savingStrength}
              >
                {savingStrength ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                Update Strength
              </button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}

      <CustomConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}
