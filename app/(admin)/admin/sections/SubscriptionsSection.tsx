"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  Loader2,
  Trash2,
  Edit2,
  Plus,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  X,
  Save,
  Clock,
  Calendar,
} from "lucide-react";
import styles from "../page.module.css";
import { AdminSubscriptionPlan } from "@/app/api/admin/subscriptions/route";

const usd = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface AdminInvestment {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  planName: string;
  amount: number;
  accruedProfit: number;
  daysRemaining: number;
  status: string;
  createdAt: string;
}

export default function SubscriptionsSection({
  flash,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
}) {
  const [investments, setInvestments] = useState<AdminInvestment[]>([]);
  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Edit / Add plan modal
  const [editPlan, setEditPlan] = useState<Partial<AdminSubscriptionPlan> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setInvestments(data.investments || []);
        setPlans(data.plans || []);
      } else {
        flash("error", "Failed to load subscription data.");
      }
    } catch {
      flash("error", "Network error while loading subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (investmentId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateInvestmentStatus", investmentId, newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      flash("ok", `Subscription status set to ${newStatus}.`);
      loadData();
    } catch (e: any) {
      flash("error", e.message || "Failed to update status");
    }
  };

  const handleSavePlan = async () => {
    if (!editPlan || !editPlan.name) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "savePlan",
          plan: {
            ...editPlan,
            id: editPlan.id || `${editPlan.name}1234`,
            title: editPlan.title || `${editPlan.name} plan`,
            minimum: Number(editPlan.minimum || 1000),
            maximum: Number(editPlan.maximum || 10000),
            duration: Number(editPlan.duration || 3),
            roi: Number(editPlan.roi || 100),
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save plan");
      flash("ok", `Plan "${editPlan.name}" saved.`);
      setEditPlan(null);
      loadData();
    } catch (e: any) {
      flash("error", e.message || "Failed to save plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: string, name: string) => {
    if (!confirm(`Delete plan "${name}"?`)) return;
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deletePlan", planId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      flash("ok", `Plan "${name}" deleted.`);
      loadData();
    } catch (e: any) {
      flash("error", e.message || "Failed to delete plan");
    }
  };

  const filteredInvestments = useMemo(() => {
    let list = investments;
    if (filterStatus !== "ALL") {
      list = list.filter((inv) => inv.status === filterStatus);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (inv) =>
          inv.userEmail.toLowerCase().includes(q) ||
          inv.userFullName.toLowerCase().includes(q) ||
          inv.planName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [investments, filterStatus, query]);

  const totalInvested = useMemo(() => investments.reduce((a, inv) => a + (inv.amount || 0), 0), [investments]);
  const totalAccruedProfit = useMemo(() => investments.reduce((a, inv) => a + (inv.accruedProfit || 0), 0), [investments]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(71, 99, 240, 0.15)", color: "#7a94ff" }}>
            <Sparkles size={18} />
          </div>
          <div className={styles.statValue}>{investments.length}</div>
          <div className={styles.statLabel}>Total Subscriptions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CheckCircle2 size={18} />
          </div>
          <div className={styles.statValue}>{investments.filter((i) => i.status === "RUNNING").length}</div>
          <div className={styles.statLabel}>Active Running Plans</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(245, 165, 36, 0.15)", color: "#fbbf24" }}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statValue}>{usd(totalInvested)}</div>
          <div className={styles.statLabel}>Subscribed Capital</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c4b5fd" }}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.statValue}>{usd(totalAccruedProfit)}</div>
          <div className={styles.statLabel}>Total Accrued Profits</div>
        </div>
      </div>

      {/* User Subscriptions Table */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Users with Active Subscriptions</h2>
            <p>Users who paid and subscribed to investment plans.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className={styles.searchBox}>
              <Search size={15} />
              <input
                type="search"
                placeholder="Filter by user or plan..."
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
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="RUNNING">Running</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Subscribed Plan</th>
                <th>Amount Subscribed</th>
                <th>Accrued Profit</th>
                <th>Days Remaining</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--a-muted)" }}>
                    <Loader2 size={20} className={styles.spin} style={{ display: "inline-block", marginRight: 8 }} />
                    Loading subscriptions...
                  </td>
                </tr>
              ) : filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "36px", color: "var(--a-muted)" }}>
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filteredInvestments.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{(inv.userEmail[0] || "U").toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{inv.userFullName}</div>
                          <div className={styles.faint}>{inv.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{inv.planName}</td>
                    <td className={styles.mono} style={{ color: "#34d399", fontWeight: 700 }}>
                      {usd(inv.amount)}
                    </td>
                    <td className={styles.mono} style={{ color: "#34d399", fontWeight: 600 }}>
                      +{usd(inv.accruedProfit)}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={14} color="var(--a-muted)" />
                        <span className={styles.mono}>{inv.daysRemaining} days</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.pill} ${inv.status === "RUNNING" ? styles.pillGreen : styles.pillAmber}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className={styles.faint} style={{ fontSize: "12px" }}>
                      {new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className={styles.btnGhostSm}
                          onClick={() => handleUpdateStatus(inv.id, inv.status === "RUNNING" ? "COMPLETED" : "RUNNING")}
                          title="Toggle Completion"
                        >
                          {inv.status === "RUNNING" ? "Mark Complete" : "Resume"}
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

      {/* Available Plans */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Investment Subscription Plans</h2>
            <p>Investment tiers available for users to subscribe to.</p>
          </div>
          <button
            type="button"
            className={styles.btnPrimarySm}
            onClick={() =>
              setEditPlan({
                name: "Elite",
                title: "Elite plan",
                minimum: 250000,
                maximum: 2000000,
                duration: 3,
                roi: 500,
              })
            }
          >
            <Plus size={15} /> Add Plan Tier
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Min. Deposit</th>
                <th>Max. Deposit</th>
                <th>Duration</th>
                <th>Target ROI</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.title || p.name}</td>
                  <td className={styles.mono}>{usd(p.minimum)}</td>
                  <td className={styles.mono}>{usd(p.maximum)}</td>
                  <td className={styles.mono}>{p.duration} days</td>
                  <td className={styles.mono} style={{ color: "#34d399", fontWeight: 700 }}>
                    {p.roi}%
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        className={styles.btnGhostSm}
                        onClick={() => setEditPlan({ ...p })}
                        title="Edit Plan"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.btnDangerSm}
                        onClick={() => handleDeletePlan(p.id, p.title || p.name)}
                        title="Delete Plan"
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
      {editPlan && (
        <div className={styles.modalBackdrop} onClick={() => !submitting && setEditPlan(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>{editPlan.id ? "Edit Subscription Plan" : "Add Subscription Plan"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setEditPlan(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Plan Name
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editPlan.name || ""}
                    onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })}
                    placeholder="e.g. Starter"
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Display Title
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editPlan.title || ""}
                    onChange={(e) => setEditPlan({ ...editPlan, title: e.target.value })}
                    placeholder="e.g. Starter plan"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Minimum ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editPlan.minimum ?? 1000}
                    onChange={(e) => setEditPlan({ ...editPlan, minimum: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Maximum ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editPlan.maximum ?? 20000}
                    onChange={(e) => setEditPlan({ ...editPlan, maximum: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editPlan.duration ?? 3}
                    onChange={(e) => setEditPlan({ ...editPlan, duration: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Target ROI (%)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editPlan.roi ?? 150}
                    onChange={(e) => setEditPlan({ ...editPlan, roi: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalActions} style={{ marginTop: "18px" }}>
              <button type="button" className={styles.btnGhost} onClick={() => setEditPlan(null)} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className={styles.btnSuccess} onClick={handleSavePlan} disabled={submitting}>
                {submitting ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
