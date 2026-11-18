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
  CandlestickChart,
  ImagePlus,
} from "lucide-react";
import styles from "../page.module.css";
import { AdminExpertCopier, CopyExpertData } from "@/app/api/admin/experts/route";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";
import CustomNotificationBar, { CustomNotificationState } from "@/components/UI/CustomNotificationBar";

const usd = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface CopyTradeDraft {
  expertId: string;
  expertName: string;
  symbol: string;
  type: "BUY" | "SELL";
  amount: number;
  leverage: number;
  pnl: number;
}

export default function ExpertsSection({
  flash,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
}) {
  const [copiers, setCopiers] = useState<AdminExpertCopier[]>([]);
  const [experts, setExperts] = useState<CopyExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"catalog" | "copiers">("catalog");
  const [submitting, setSubmitting] = useState(false);

  // Edit / Add modal
  const [editModal, setEditModal] = useState<Partial<CopyExpertData> | null>(null);
  const [copyTrade, setCopyTrade] = useState<CopyTradeDraft | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Custom Confirm & Notification State
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);
  const [notification, setNotification] = useState<CustomNotificationState | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
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
        if (!silent) flash("error", "Failed to load experts data.");
      }
    } catch {
      if (!silent) flash("error", "Network error while loading experts.");
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
    if (!editModal || !editModal.name || !editModal.picture || imageUploading) return;
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

  const handleExpertImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editModal) return;
    setImageUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/expert-images", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Image upload failed");
      setEditModal((current) => current ? { ...current, picture: data.url } : current);
      setNotification({ type: "success", message: "Expert image uploaded. Save the expert to apply it." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed";
      setNotification({ type: "error", message });
      flash("error", message);
    } finally {
      setImageUploading(false);
    }
  };

  const openCopyTrade = (expert: CopyExpertData) => {
    setCopyTrade({
      expertId: expert.id || expert.ref,
      expertName: expert.name,
      symbol: "BTC",
      type: "BUY",
      amount: Math.max(100, Number(expert.minimumStartUp || 1000)),
      leverage: 1,
      pnl: 0,
    });
  };

  const handlePlaceCopyTrade = async () => {
    if (!copyTrade) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createCopyTrade",
          expertId: copyTrade.expertId,
          symbol: copyTrade.symbol.trim().toUpperCase(),
          type: copyTrade.type,
          amount: Number(copyTrade.amount),
          leverage: Number(copyTrade.leverage),
          pnl: Number(copyTrade.pnl || 0),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to place copied trade");
      setNotification({ type: "success", message: data.message || "Copied trade opened successfully." });
      flash("ok", data.message || "Copied trade opened successfully.");
      setCopyTrade(null);
      await loadData(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to place copied trade";
      setNotification({ type: "error", message });
      flash("error", message);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
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

      {/* Sub-Tabs Switcher */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", borderBottom: "1px solid var(--a-border)", paddingBottom: "12px", width: "100%", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "catalog" ? "var(--a-accent)" : "var(--a-raised)",
            color: activeTab === "catalog" ? "#ffffff" : "var(--a-muted)",
            transition: "all 0.15s ease",
          }}
        >
          <Award size={16} />
          <span>Experts Catalog</span>
          <span style={{ fontSize: "11.5px", padding: "1px 6px", borderRadius: "10px", background: activeTab === "catalog" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}>
            {experts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("copiers")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "copiers" ? "var(--a-accent)" : "var(--a-raised)",
            color: activeTab === "copiers" ? "#ffffff" : "var(--a-muted)",
            transition: "all 0.15s ease",
          }}
        >
          <Users size={16} />
          <span>Active Copiers</span>
          <span style={{ fontSize: "11.5px", padding: "1px 6px", borderRadius: "10px", background: activeTab === "copiers" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}>
            {copiers.length}
          </span>
        </button>
      </div>

      {/* Copiers / Payments Table */}
      {activeTab === "copiers" && (
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

        {/* Desktop View (>= 768px) */}
        <div className={styles.tableWrap} style={{ minHeight: "180px" }}>
          <table className={styles.table} style={{ minWidth: "850px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>User</th>
                <th className={styles.right} style={{ minWidth: "110px" }}>Main Balance</th>
                <th style={{ minWidth: "140px" }}>Copied Expert</th>
                <th className={styles.right} style={{ minWidth: "110px" }}>Min. Startup</th>
                <th className={styles.right} style={{ minWidth: "95px" }}>Profit Share</th>
                <th style={{ minWidth: "90px" }}>Status</th>
                <th style={{ minWidth: "110px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ minWidth: "180px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div className={styles.skeletonCell} style={{ width: 120 }} />
                        <div className={styles.skeletonCell} style={{ width: 80 }} />
                      </div>
                    </td>
                    <td className={styles.right} style={{ minWidth: "110px" }}><div className={styles.skeletonCell} style={{ width: 65, marginLeft: "auto" }} /></td>
                    <td style={{ minWidth: "140px" }}><div className={styles.skeletonCell} style={{ width: 90 }} /></td>
                    <td className={styles.right} style={{ minWidth: "110px" }}><div className={styles.skeletonCell} style={{ width: 55, marginLeft: "auto" }} /></td>
                    <td className={styles.right} style={{ minWidth: "95px" }}><div className={styles.skeletonCell} style={{ width: 40, marginLeft: "auto" }} /></td>
                    <td style={{ minWidth: "90px" }}><div className={styles.skeletonCell} style={{ width: 60 }} /></td>
                    <td style={{ minWidth: "110px", textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 55, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : filteredCopiers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px 24px", color: "var(--a-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Users size={26} style={{ opacity: 0.35 }} />
                      <span>No users currently copying any experts.</span>
                    </div>
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
                        <div style={{ minWidth: 0, overflow: "hidden" }}>
                          <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{copier.userFullName}</div>
                          <div className={styles.faint} style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{copier.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`${styles.right} ${styles.mono}`}>{usd(copier.userBalance)}</td>
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
                    <td className={`${styles.right} ${styles.mono}`}>{usd(copier.minimumStartUp)}</td>
                    <td className={`${styles.right} ${styles.mono}`}>{copier.profitShare}%</td>
                    <td>
                      <span className={`${styles.pill} ${styles.pillGreen}`}>Active Copy</span>
                    </td>
                    <td style={{ textAlign: "right" }} className={styles.stickyActionTd}>
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

        {/* Mobile Phone Card List (< 768px) */}
        <ul className={styles.cardList}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div className={styles.skeletonCell} style={{ width: 130 }} />
                  <div className={styles.skeletonCell} style={{ width: 60 }} />
                </div>
                <div className={styles.skeletonCell} style={{ width: "100%", height: 50 }} />
              </li>
            ))
          ) : filteredCopiers.length === 0 ? (
            <li className={styles.itemCard} style={{ textAlign: "center", padding: "36px 16px", color: "var(--a-muted)" }}>
              <Users size={24} style={{ opacity: 0.35, margin: "0 auto 8px" }} />
              <div>No users currently copying any experts.</div>
            </li>
          ) : (
            filteredCopiers.map((copier) => (
              <li key={copier.id} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>{(copier.userEmail[0] || "U").toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{copier.userFullName}</div>
                      <div className={styles.faint} style={{ fontSize: "11.5px" }}>{copier.userEmail}</div>
                    </div>
                  </div>
                  <span className={`${styles.pill} ${styles.pillGreen}`}>Active</span>
                </div>

                <div className={styles.itemMetaGrid}>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Copied Expert</span>
                    <span className={styles.itemMetaValue}>{copier.expertName}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>User Balance</span>
                    <span className={styles.itemMetaValue}>{usd(copier.userBalance)}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Min. Startup</span>
                    <span className={styles.itemMetaValue}>{usd(copier.minimumStartUp)}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Profit Share</span>
                    <span className={styles.itemMetaValue}>{copier.profitShare}%</span>
                  </div>
                </div>

                <div className={styles.itemBottom}>
                  <button
                    type="button"
                    className={styles.btnDangerSm}
                    onClick={() => handleRemoveCopier(copier.expertId, copier.userId, copier.userEmail)}
                    style={{ marginLeft: "auto", height: "32px", padding: "0 12px" }}
                  >
                    <UserX size={13} /> Remove Copier
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
      )}

      {/* Available Experts Management (Catalog) */}
      {activeTab === "catalog" && (
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2>Experts Catalog</h2>
              <span className={styles.countChip}>{experts.length}</span>
            </div>
            <button
              type="button"
              className={styles.btnPrimarySm}
              style={{ height: "38px" }}
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
        </div>

        {/* Desktop View (>= 768px) */}
        <div className={styles.tableWrap} style={{ minHeight: "220px" }}>
          <table className={styles.table} style={{ minWidth: "820px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>Expert</th>
                <th style={{ minWidth: "90px" }}>Win Rate</th>
                <th style={{ minWidth: "95px" }}>Profit Share</th>
                <th className={styles.right} style={{ minWidth: "110px" }}>Min. Startup</th>
                <th style={{ minWidth: "95px" }}>Followers</th>
                <th style={{ minWidth: "80px" }}>Badge</th>
                <th style={{ minWidth: "220px", width: "220px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ minWidth: "180px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className={styles.skeletonCell} style={{ width: 32, height: 32, borderRadius: "50%" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div className={styles.skeletonCell} style={{ width: 90 }} />
                          <div className={styles.skeletonCell} style={{ width: 60 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ minWidth: "90px" }}><div className={styles.skeletonCell} style={{ width: 40 }} /></td>
                    <td style={{ minWidth: "95px" }}><div className={styles.skeletonCell} style={{ width: 40 }} /></td>
                    <td className={styles.right} style={{ minWidth: "110px" }}><div className={styles.skeletonCell} style={{ width: 60, marginLeft: "auto" }} /></td>
                    <td style={{ minWidth: "95px" }}><div className={styles.skeletonCell} style={{ width: 50 }} /></td>
                    <td style={{ minWidth: "80px" }}><div className={styles.skeletonCell} style={{ width: 45 }} /></td>
                    <td style={{ minWidth: "130px", textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 70, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : experts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px 24px", color: "var(--a-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Award size={26} style={{ opacity: 0.35 }} />
                      <span>No experts in catalog. Click Add Expert to create one.</span>
                    </div>
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
                  <td className={`${styles.right} ${styles.mono}`}>{usd(exp.minimumStartUp)}</td>
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
                        className={styles.btnPrimarySm}
                        onClick={() => openCopyTrade(exp)}
                        title="Place a trade for all active copiers"
                      >
                        <CandlestickChart size={14} /> Trade
                      </button>
                      <button
                        type="button"
                        className={styles.btnGhostSm}
                        onClick={() => setEditModal({ ...exp })}
                        title="Edit Expert"
                      >
                        <Edit2 size={14} /> Edit
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

        {/* Mobile Phone Card List (< 768px) */}
        <ul className={styles.cardList}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div className={styles.skeletonCell} style={{ width: 140 }} />
                  <div className={styles.skeletonCell} style={{ width: 50 }} />
                </div>
                <div className={styles.skeletonCell} style={{ width: "100%", height: 50 }} />
              </li>
            ))
          ) : experts.length === 0 ? (
            <li className={styles.itemCard} style={{ textAlign: "center", padding: "36px 16px", color: "var(--a-muted)" }}>
              <Award size={24} style={{ opacity: 0.35, margin: "0 auto 8px" }} />
              <div>No experts in catalog. Click Add Expert to create one.</div>
            </li>
          ) : (
            experts.map((exp) => (
              <li key={exp.id || exp.ref} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exp.picture || "/assets/copy-trading/albania_support.png"}
                      alt={exp.name}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{exp.name}</div>
                      <div className={styles.faint} style={{ fontSize: "11.5px" }}>@{exp.username || "expert"}</div>
                    </div>
                  </div>
                  <span className={`${styles.pill} ${exp.tickType === "gold" ? styles.pillAmber : styles.pillBlue}`}>
                    {exp.tickType || "none"}
                  </span>
                </div>

                <div className={styles.itemMetaGrid}>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Win Rate</span>
                    <span className={styles.itemMetaValue} style={{ color: "#34d399" }}>{exp.winRate}%</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Profit Share</span>
                    <span className={styles.itemMetaValue}>{exp.profitShare}%</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Min. Startup</span>
                    <span className={styles.itemMetaValue}>{usd(exp.minimumStartUp)}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Followers</span>
                    <span className={styles.itemMetaValue}>{Number(exp.followers || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.itemBottom}>
                  <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                    <button
                      type="button"
                      className={styles.btnPrimarySm}
                      onClick={() => openCopyTrade(exp)}
                      style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}
                    >
                      <CandlestickChart size={13} /> Trade
                    </button>
                    <button
                      type="button"
                      className={styles.btnGhostSm}
                      onClick={() => setEditModal({ ...exp })}
                      style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className={styles.btnDangerSm}
                      onClick={() => handleDeleteExpert(exp.id, exp.name)}
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
      )}

      {/* Edit / Add Modal */}
      {editModal && (
        <div className={`${styles.modalBackdrop} project-edit-modal-overlay`} onClick={() => !submitting && setEditModal(null)}>
          <div
            className={`${styles.modal} project-edit-modal-dialog`}
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
              <div>
                <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 6 }}>
                  Expert Image
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <img
                    src={editModal.picture || "/assets/copy-trading/albania_support.png"}
                    alt="Expert preview"
                    style={{ width: 58, height: 58, borderRadius: 10, objectFit: "cover", border: "1px solid var(--a-border)", flexShrink: 0 }}
                    onError={(event) => { event.currentTarget.src = "/assets/copy-trading/albania_support.png"; }}
                  />
                  <label
                    className={styles.btnGhost}
                    style={{ minHeight: 40, padding: "0 14px", display: "inline-flex", alignItems: "center", gap: 7, cursor: imageUploading ? "wait" : "pointer" }}
                  >
                    {imageUploading ? <Loader2 size={15} className={styles.spin} /> : <ImagePlus size={15} />}
                    {imageUploading ? "Uploading..." : editModal.picture ? "Replace Image" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleExpertImageUpload}
                      disabled={imageUploading}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
                <div className={styles.faint} style={{ fontSize: 11, marginTop: 6 }}>PNG, JPG or WEBP, up to 5 MB.</div>
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
                disabled={submitting || imageUploading}
                style={{ flex: "1 1 100px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnSuccess}
                onClick={handleSaveExpert}
                disabled={submitting || imageUploading || !editModal.picture || !editModal.name?.trim()}
                style={{ flex: "1 1 auto" }}
              >
                {submitting ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                Save Expert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place one expert trade across every active copier account. */}
      {copyTrade && (
        <div className={`${styles.modalBackdrop} project-edit-modal-overlay`} onClick={() => !submitting && setCopyTrade(null)}>
          <div
            className={`${styles.modal} project-edit-modal-dialog`}
            style={{ width: "100%", maxWidth: "520px", maxHeight: "calc(100dvh - 24px)", overflowY: "auto", padding: "20px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <div>
                <h2>Place Copied Trade</h2>
                <div className={styles.faint} style={{ marginTop: 4 }}>Expert: {copyTrade.expertName}</div>
              </div>
              <button type="button" className={styles.iconBtn} onClick={() => setCopyTrade(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
              <div>
                <label className={styles.faint} style={{ fontSize: 12, display: "block", marginBottom: 5 }}>Market symbol</label>
                <input
                  value={copyTrade.symbol}
                  onChange={(event) => setCopyTrade({ ...copyTrade, symbol: event.target.value })}
                  placeholder="BTC"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: 12, display: "block", marginBottom: 5 }}>Side</label>
                  <select
                    value={copyTrade.type}
                    onChange={(event) => setCopyTrade({ ...copyTrade, type: event.target.value as "BUY" | "SELL" })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                  >
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                  </select>
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: 12, display: "block", marginBottom: 5 }}>Notional per copier ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={copyTrade.amount}
                    onChange={(event) => setCopyTrade({ ...copyTrade, amount: Number(event.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: 12, display: "block", marginBottom: 5 }}>Leverage</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={copyTrade.leverage}
                    onChange={(event) => setCopyTrade({ ...copyTrade, leverage: Number(event.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: 12, display: "block", marginBottom: 5 }}>Starting P&amp;L ($)</label>
                  <input
                    type="number"
                    value={copyTrade.pnl}
                    onChange={(event) => setCopyTrade({ ...copyTrade, pnl: Number(event.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                  />
                </div>
              </div>
              <div className={styles.faint} style={{ fontSize: 12, lineHeight: 1.5 }}>
                Required margin per copier: {usd(copyTrade.amount / Math.max(1, copyTrade.leverage))}. The batch is atomic: if any active copier cannot fund the margin, no positions are created.
              </div>
            </div>

            <div className={styles.modalActions} style={{ marginTop: 20 }}>
              <button type="button" className={styles.btnGhost} onClick={() => setCopyTrade(null)} disabled={submitting}>Cancel</button>
              <button type="button" className={styles.btnSuccess} onClick={handlePlaceCopyTrade} disabled={submitting || !copyTrade.symbol || copyTrade.amount <= 0}>
                {submitting ? <Loader2 size={15} className={styles.spin} /> : <CandlestickChart size={15} />}
                Place for all copiers
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
