"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Layers,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  X,
  Save,
  CreditCard,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import styles from "../page.module.css";
import { CardOption } from "@/app/api/admin/cards/route";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";

const usd = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CardsSection({
  flash,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
}) {
  const [cardOptions, setCardOptions] = useState<CardOption[]>([]);
  const [totalCardsIssued, setTotalCardsIssued] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal
  const [editOption, setEditOption] = useState<Partial<CardOption> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/cards", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCardOptions(data.cardOptions || []);
        setTotalCardsIssued((data.cards || []).length);
      } else {
        if (!silent) flash("error", "Failed to load card configurations.");
      }
    } catch {
      if (!silent) flash("error", "Network error while loading cards.");
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

  const handleSaveOption = async () => {
    if (!editOption || !editOption.name) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveCardOption",
          cardOption: {
            ...editOption,
            id: editOption.id || `opt_${editOption.name.toLowerCase()}`,
            title: editOption.title || `${editOption.name} Card`,
            issuanceFee: Number(editOption.issuanceFee || 1000),
            depositTotalMinimum: editOption.depositTotalMinimum ? Number(editOption.depositTotalMinimum) : null,
            kycRequired: !!editOption.kycRequired,
            enabled: editOption.enabled !== false,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save card option");
      flash("ok", `Card type "${editOption.name}" saved.`);
      setEditOption(null);
      loadData();
    } catch (e: any) {
      flash("error", e.message || "Failed to save card option");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOption = (optionId: string, name: string) => {
    setConfirmState({
      title: `Delete Card Option "${name}"?`,
      message: `Are you sure you want to delete this card configuration?`,
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteCardOption", optionId }),
          });
          if (!res.ok) throw new Error("Delete failed");
          flash("ok", `Card option "${name}" deleted.`);
          loadData();
        } catch (e: any) {
          flash("error", e.message || "Failed to delete");
        } finally {
          setConfirmState(null);
        }
      },
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(71, 99, 240, 0.15)", color: "#7a94ff" }}>
            <Layers size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : cardOptions.length}
          </div>
          <div className={styles.statLabel}>Available Card Tiers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CreditCard size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : totalCardsIssued}
          </div>
          <div className={styles.statLabel}>Total Cards Issued</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(245, 165, 36, 0.15)", color: "#fbbf24" }}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statValue}>$1,000.00</div>
          <div className={styles.statLabel}>Standard Issuance Fee</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c4b5fd" }}>
            <ShieldCheck size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? (
              <span className={styles.skeletonStatVal} />
            ) : (
              cardOptions.filter((c) => c.kycRequired).length
            )}
          </div>
          <div className={styles.statLabel}>KYC Protected Tiers</div>
        </div>
      </div>

      {/* Card Options Table */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Card Tiers & Settings</h2>
            <p>Configure card issuance fees, deposit minimums, and KYC verification rules.</p>
          </div>
          <button
            type="button"
            className={styles.btnPrimarySm}
            onClick={() =>
              setEditOption({
                name: "Black VIP",
                title: "Black VIP Card",
                issuanceFee: 2500,
                depositTotalMinimum: 100000,
                kycRequired: true,
                enabled: true,
              })
            }
          >
            <Plus size={15} /> Add Card Tier
          </button>
        </div>

        {/* Desktop View (>= 768px) */}
        <div className={styles.tableWrap} style={{ minHeight: "200px" }}>
          <table className={styles.table} style={{ minWidth: "750px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>Tier Name</th>
                <th className={styles.right} style={{ minWidth: "120px" }}>Issuance Fee</th>
                <th className={styles.right} style={{ minWidth: "140px" }}>Deposit Minimum</th>
                <th style={{ minWidth: "130px" }}>KYC Verification</th>
                <th style={{ minWidth: "90px" }}>Status</th>
                <th style={{ minWidth: "130px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ minWidth: "160px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div className={styles.skeletonCell} style={{ width: 120 }} />
                        <div className={styles.skeletonCell} style={{ width: 70 }} />
                      </div>
                    </td>
                    <td className={styles.right} style={{ minWidth: "110px" }}><div className={styles.skeletonCell} style={{ width: 65, marginLeft: "auto" }} /></td>
                    <td className={styles.right} style={{ minWidth: "130px" }}><div className={styles.skeletonCell} style={{ width: 75, marginLeft: "auto" }} /></td>
                    <td style={{ minWidth: "120px" }}><div className={styles.skeletonCell} style={{ width: 80 }} /></td>
                    <td style={{ minWidth: "90px" }}><div className={styles.skeletonCell} style={{ width: 55 }} /></td>
                    <td style={{ minWidth: "130px", textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 70, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : cardOptions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px 24px", color: "var(--a-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <CreditCard size={26} style={{ opacity: 0.35 }} />
                      <span>No card options defined. Click Add Card Tier to create one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                cardOptions.map((opt) => (
                  <tr key={opt.id || opt.name}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{opt.title || opt.name}</div>
                      <div className={styles.faint}>{opt.name} Tier</div>
                    </td>
                    <td className={`${styles.right} ${styles.mono}`} style={{ color: "#34d399", fontWeight: 700 }}>
                      {usd(opt.issuanceFee)}
                    </td>
                    <td className={`${styles.right} ${styles.mono}`}>
                      {opt.depositTotalMinimum ? usd(opt.depositTotalMinimum) : "No minimum"}
                    </td>
                    <td>
                      <span className={`${styles.pill} ${opt.kycRequired ? styles.pillAmber : styles.pillBlue}`}>
                        {opt.kycRequired ? "KYC Required" : "Optional"}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.pill} ${opt.enabled ? styles.pillGreen : styles.pillRed}`}>
                        {opt.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className={styles.btnGhostSm}
                          onClick={() => setEditOption({ ...opt })}
                          title="Edit Card Option"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className={styles.btnDangerSm}
                          onClick={() => handleDeleteOption(opt.id, opt.title || opt.name)}
                          title="Delete Card Option"
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
            Array.from({ length: 2 }).map((_, i) => (
              <li key={i} className={styles.itemCard}>
                <div className={styles.skeletonCell} style={{ width: 140 }} />
                <div className={styles.skeletonCell} style={{ width: 80 }} />
              </li>
            ))
          ) : cardOptions.length === 0 ? (
            <li className={styles.itemCard} style={{ textAlign: "center", padding: "24px 16px", color: "var(--a-muted)" }}>
              <div>No card options defined.</div>
            </li>
          ) : (
            cardOptions.map((opt) => (
              <li key={opt.id || opt.name} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>{opt.title || opt.name}</div>
                    <div className={styles.faint} style={{ fontSize: "11.5px" }}>{opt.name} Tier</div>
                  </div>
                  <span className={`${styles.pill} ${opt.enabled ? styles.pillGreen : styles.pillRed}`}>
                    {opt.enabled ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className={styles.itemMetaGrid}>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Issuance Fee</span>
                    <span className={styles.itemMetaValue} style={{ color: "#34d399" }}>{usd(opt.issuanceFee)}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Min. Deposit</span>
                    <span className={styles.itemMetaValue}>{opt.depositTotalMinimum ? usd(opt.depositTotalMinimum) : "None"}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>KYC Rule</span>
                    <span className={styles.itemMetaValue}>{opt.kycRequired ? "Required" : "Optional"}</span>
                  </div>
                  <div className={styles.itemMetaCol}>
                    <span className={styles.itemMetaLabel}>Tier Status</span>
                    <span className={styles.itemMetaValue}>{opt.enabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>

                <div className={styles.itemBottom}>
                  <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                    <button
                      type="button"
                      className={styles.btnGhostSm}
                      onClick={() => setEditOption({ ...opt })}
                      style={{ height: "32px", fontSize: "12px" }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className={styles.btnDangerSm}
                      onClick={() => handleDeleteOption(opt.id, opt.title || opt.name)}
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

      {/* Edit / Add Modal */}
      {editOption && typeof document !== "undefined"
        ? createPortal(
            <div
              className={`${styles.modalBackdrop} project-edit-modal-overlay`}
              onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) {
                  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement && document.activeElement.matches("input, textarea, select")) {
                    document.activeElement.blur();
                    return;
                  }
                  setEditOption(null);
                }
              }}
            >
              <div className={`${styles.modal} project-edit-modal-dialog`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>{editOption.id ? "Edit Card Tier" : "Add New Card Tier"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setEditOption(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                    Tier Name
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                    value={editOption.name || ""}
                    onChange={(e) => setEditOption({ ...editOption, name: e.target.value })}
                    placeholder="e.g. Regular"
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                    Display Title
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                    value={editOption.title || ""}
                    onChange={(e) => setEditOption({ ...editOption, title: e.target.value })}
                    placeholder="e.g. Regular Card"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                    Issuance Fee ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                    value={editOption.issuanceFee ?? 1000}
                    onChange={(e) => setEditOption({ ...editOption, issuanceFee: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                    Deposit Minimum ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                    value={editOption.depositTotalMinimum ?? ""}
                    onChange={(e) => setEditOption({ ...editOption, depositTotalMinimum: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Optional (leave empty for none)"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                    KYC Required
                  </label>
                  <select
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                    value={editOption.kycRequired ? "true" : "false"}
                    onChange={(e) => setEditOption({ ...editOption, kycRequired: e.target.value === "true" })}
                  >
                    <option value="false">No (Optional)</option>
                    <option value="true">Yes (Mandatory)</option>
                  </select>
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                    Status
                  </label>
                  <select
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.16)", background: "#141721", color: "#fff" }}
                    value={editOption.enabled !== false ? "true" : "false"}
                    onChange={(e) => setEditOption({ ...editOption, enabled: e.target.value === "true" })}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.modalActions} style={{ marginTop: "18px" }}>
              <button type="button" className={styles.btnGhost} onClick={() => setEditOption(null)} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className={styles.btnSuccess} onClick={handleSaveOption} disabled={submitting}>
                {submitting ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                Save Card Tier
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
