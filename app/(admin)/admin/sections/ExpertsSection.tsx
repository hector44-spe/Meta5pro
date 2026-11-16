"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserX,
  Plus,
  Edit2,
  Trash2,
  Award,
  DollarSign,
  TrendingUp,
  X,
  Save,
} from "lucide-react";
import styles from "../page.module.css";
import { AdminExpertCopier, CopyExpertData } from "@/app/api/admin/experts/route";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";
import CustomNotificationBar, { CustomNotificationState } from "@/components/UI/CustomNotificationBar";

const usd = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ExpertsSection({
  flash,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
}) {
  const [copiers, setCopiers] = useState<AdminExpertCopier[]>([]);
  const [experts, setExperts] = useState<CopyExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit / Add modal
  const [editModal, setEditModal] = useState<Partial<CopyExpertData> | null>(null);

  // Custom Confirm & Notification State
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);
  const [notification, setNotification] = useState<CustomNotificationState | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/experts", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCopiers(data.copiers || []);
        setExperts(data.experts || []);
      } else {
        flash("error", "Failed to load experts data.");
      }
    } catch {
      flash("error", "Network error while loading experts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const handleRemoveCopier = (expertId: string, userId: string, userEmail: string) => {
    setConfirmState({
      title: "Remove Copying Subscription",
      message: `Unlink user ${userEmail} from this expert trader?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/experts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "removeSubscriber", expertId, userId }),
          });
          if (!res.ok) throw new Error("Failed to remove copier");
          setNotification({ type: "success", message: `User ${userEmail} unlinked from expert.` });
          flash("ok", `User ${userEmail} unlinked from expert.`);
          loadData();
        } catch (e: any) {
          setNotification({ type: "error", message: e.message || "Action failed" });
          flash("error", e.message || "Action failed");
        }
      },
    });
  };

  const handleSaveExpert = async () => {
    if (!editModal || !editModal.name) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/experts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveExpert", expert: editModal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setNotification({ type: "success", message: `Expert "${editModal.name}" saved.` });
      flash("ok", `Expert "${editModal.name}" saved.`);
      setEditModal(null);
      loadData();
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Failed to save expert" });
      flash("error", e.message || "Failed to save expert");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpert = (id: string, name: string) => {
    setConfirmState({
      title: "Delete Trading Expert",
      message: `Permanently delete expert "${name}" from the catalog? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/experts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteExpert", expertId: id }),
          });
          if (!res.ok) throw new Error("Delete failed");
          setNotification({ type: "success", message: `Expert "${name}" deleted.` });
          flash("ok", `Expert "${name}" deleted.`);
          loadData();
        } catch (e: any) {
          setNotification({ type: "error", message: e.message || "Failed to delete" });
          flash("error", e.message || "Failed to delete");
        }
      },
    });
  };

  const filteredCopiers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return copiers;
    return copiers.filter(
      (c) =>
        c.userEmail.toLowerCase().includes(q) ||
        c.userFullName.toLowerCase().includes(q) ||
        c.expertName.toLowerCase().includes(q)
    );
  }, [copiers, query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(71, 99, 240, 0.15)", color: "#7a94ff" }}>
            <Users size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : copiers.length}
          </div>
          <div className={styles.statLabel}>Active Copiers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <Award size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : experts.length}
          </div>
          <div className={styles.statLabel}>Trading Experts</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(245, 165, 36, 0.15)", color: "#fbbf24" }}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? (
              <span className={styles.skeletonStatVal} />
            ) : (
              usd(copiers.reduce((acc, c) => acc + (c.userBalance || 0), 0))
            )}
          </div>
          <div className={styles.statLabel}>Total Copier Balance</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c4b5fd" }}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? (
              <span className={styles.skeletonStatVal} />
            ) : (
              experts.reduce((acc, e) => acc + (Number(e.followers) || 0), 0).toLocaleString()
            )}
          </div>
          <div className={styles.statLabel}>Total Followers</div>
        </div>
      </div>

      {/* Copiers / Payments Table */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Users Copying Experts</h2>
          </div>
          <div className={styles.searchBox}>
            <Search size={15} />
            <input
              type="search"
              placeholder="Filter by user or expert..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Main Balance</th>
                <th>Copied Expert</th>
                <th>Min. Startup</th>
                <th>Profit Share</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div className={styles.skeletonCell} style={{ width: 130 }} />
                        <div className={styles.skeletonCell} style={{ width: 90 }} />
                      </div>
                    </td>
                    <td><div className={styles.skeletonCell} style={{ width: 70 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 100 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 60 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 45 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 75 }} /></td>
                    <td style={{ textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 65, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : filteredCopiers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "var(--a-muted)" }}>
                    No users currently copying any experts.
                  </td>
                </tr>
              ) : (
                filteredCopiers.map((copier) => (
                  <tr key={copier.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {(copier.userEmail[0] || "U").toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{copier.userFullName}</div>
                          <div className={styles.faint}>{copier.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.mono}>{usd(copier.userBalance)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {copier.expertPicture && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={copier.expertPicture}
                            alt={copier.expertName}
                            style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                          />
                        )}
                        <span style={{ fontWeight: 500 }}>{copier.expertName}</span>
                      </div>
                    </td>
                    <td className={styles.mono}>{usd(copier.minimumStartUp)}</td>
                    <td className={styles.mono}>{copier.profitShare}%</td>
                    <td>
                      <span className={`${styles.pill} ${styles.pillGreen}`}>Active Copy</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className={styles.btnDangerSm}
                        onClick={() => handleRemoveCopier(copier.expertId, copier.userId, copier.userEmail)}
                        title="Remove Copying Subscription"
                      >
                        <UserX size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Available Experts Management */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Experts Catalog</h2>
          </div>
          <button
            type="button"
            className={styles.btnPrimarySm}
            onClick={() =>
              setEditModal({
                name: "",
                username: "",
                bio: "",
                winRate: 85,
                profitShare: 15,
                minimumStartUp: 1000,
                followers: 1000,
                tickType: "gold",
              })
            }
          >
            <Plus size={15} /> Add Expert
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Expert</th>
                <th>Win Rate</th>
                <th>Profit Share</th>
                <th>Min. Startup</th>
                <th>Followers</th>
                <th>Badge</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className={styles.skeletonCell} style={{ width: 32, height: 32, borderRadius: "50%" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div className={styles.skeletonCell} style={{ width: 110 }} />
                          <div className={styles.skeletonCell} style={{ width: 70 }} />
                        </div>
                      </div>
                    </td>
                    <td><div className={styles.skeletonCell} style={{ width: 45 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 45 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 65 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 55 }} /></td>
                    <td><div className={styles.skeletonCell} style={{ width: 50 }} /></td>
                    <td style={{ textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 75, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : experts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "var(--a-muted)" }}>
                    No experts in catalog. Click Add Expert to create one.
                  </td>
                </tr>
              ) : experts.map((exp) => (
                <tr key={exp.id || exp.ref}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={exp.picture || "/assets/copy-trading/albania_support.png"}
                        alt={exp.name}
                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{exp.name}</div>
                        <div className={styles.faint}>@{exp.username || "expert"}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.mono} style={{ color: "#34d399", fontWeight: 600 }}>
                    {exp.winRate}%
                  </td>
                  <td className={styles.mono}>{exp.profitShare}%</td>
                  <td className={styles.mono}>{usd(exp.minimumStartUp)}</td>
                  <td>{Number(exp.followers || 0).toLocaleString()}</td>
                  <td>
                    <span className={`${styles.pill} ${exp.tickType === "gold" ? styles.pillAmber : styles.pillBlue}`}>
                      {exp.tickType || "none"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        className={styles.btnGhostSm}
                        onClick={() => setEditModal({ ...exp })}
                        title="Edit Expert"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.btnDangerSm}
                        onClick={() => handleDeleteExpert(exp.id, exp.name)}
                        title="Delete Expert"
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
      </section>

      {/* Edit / Add Modal */}
      {editModal && (
        <div className={styles.modalBackdrop} onClick={() => !submitting && setEditModal(null)}>
          <div
            className={styles.modal}
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "min(92vh, calc(100dvh - 24px))",
              overflowY: "auto",
              boxSizing: "border-box",
              padding: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <h2>{editModal.id ? "Edit Expert" : "New Trading Expert"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setEditModal(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "14px", marginTop: "12px", width: "100%" }}>
              <div>
                <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                  Expert Name
                </label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                  value={editModal.name || ""}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  placeholder="e.g. Albania fx"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Username
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editModal.username || ""}
                    onChange={(e) => setEditModal({ ...editModal, username: e.target.value })}
                    placeholder="e.g. Support"
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Badge
                  </label>
                  <select
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editModal.tickType || "gold"}
                    onChange={(e) => setEditModal({ ...editModal, tickType: e.target.value as any })}
                  >
                    <option value="gold">Gold</option>
                    <option value="blue">Blue</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Win Rate (%)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editModal.winRate ?? 90}
                    onChange={(e) => setEditModal({ ...editModal, winRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Profit Share (%)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editModal.profitShare ?? 15}
                    onChange={(e) => setEditModal({ ...editModal, profitShare: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Min. Startup ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", boxSizing: "border-box" }}
                    value={editModal.minimumStartUp ?? 1000}
                    onChange={(e) => setEditModal({ ...editModal, minimumStartUp: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                  Bio / Strategy
                </label>
                <textarea
                  rows={2}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff", resize: "none", boxSizing: "border-box" }}
                  value={editModal.bio || ""}
                  onChange={(e) => setEditModal({ ...editModal, bio: e.target.value })}
                />
              </div>
            </div>
            <div
              className={styles.modalActions}
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setEditModal(null)}
                disabled={submitting}
                style={{ flex: "1 1 100px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnSuccess}
                onClick={handleSaveExpert}
                disabled={submitting}
                style={{ flex: "1 1 auto" }}
              >
                {submitting ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                Save Expert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Confirmation Dialog & Toast Bar */}
      <CustomConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
        loading={submitting}
      />
      <CustomNotificationBar
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
