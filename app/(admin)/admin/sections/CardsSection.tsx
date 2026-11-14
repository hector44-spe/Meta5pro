"use client";

import React, { useEffect, useState } from "react";
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

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cards");
      if (res.ok) {
        const data = await res.json();
        setCardOptions(data.cardOptions || []);
        setTotalCardsIssued((data.cards || []).length);
      } else {
        flash("error", "Failed to load card configurations.");
      }
    } catch {
      flash("error", "Network error while loading cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const handleDeleteOption = async (optionId: string, name: string) => {
    if (!confirm(`Delete card option "${name}"?`)) return;
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
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(71, 99, 240, 0.15)", color: "#7a94ff" }}>
            <Layers size={18} />
          </div>
          <div className={styles.statValue}>{cardOptions.length}</div>
          <div className={styles.statLabel}>Available Card Tiers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CreditCard size={18} />
          </div>
          <div className={styles.statValue}>{totalCardsIssued}</div>
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
            {cardOptions.filter((c) => c.kycRequired).length}
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

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tier Name</th>
                <th>Issuance Fee</th>
                <th>Deposit Minimum</th>
                <th>KYC Verification</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--a-muted)" }}>
                    <Loader2 size={20} className={styles.spin} style={{ display: "inline-block", marginRight: 8 }} />
                    Loading card options...
                  </td>
                </tr>
              ) : cardOptions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "var(--a-muted)" }}>
                    No card options defined.
                  </td>
                </tr>
              ) : (
                cardOptions.map((opt) => (
                  <tr key={opt.id || opt.name}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{opt.title || opt.name}</div>
                      <div className={styles.faint}>{opt.name} Tier</div>
                    </td>
                    <td className={styles.mono} style={{ color: "#34d399", fontWeight: 700 }}>
                      {usd(opt.issuanceFee)}
                    </td>
                    <td className={styles.mono}>
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
                          <Edit2 size={14} />
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
      </section>

      {/* Edit / Add Modal */}
      {editOption && (
        <div className={styles.modalBackdrop} onClick={() => !submitting && setEditOption(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>{editOption.id ? "Edit Card Tier" : "Add New Card Tier"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setEditOption(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Tier Name
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editOption.name || ""}
                    onChange={(e) => setEditOption({ ...editOption, name: e.target.value })}
                    placeholder="e.g. Regular"
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Display Title
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editOption.title || ""}
                    onChange={(e) => setEditOption({ ...editOption, title: e.target.value })}
                    placeholder="e.g. Regular Card"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Issuance Fee ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editOption.issuanceFee ?? 1000}
                    onChange={(e) => setEditOption({ ...editOption, issuanceFee: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Deposit Minimum ($)
                  </label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editOption.depositTotalMinimum ?? ""}
                    onChange={(e) => setEditOption({ ...editOption, depositTotalMinimum: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Optional (leave empty for none)"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    KYC Required
                  </label>
                  <select
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
                    value={editOption.kycRequired ? "true" : "false"}
                    onChange={(e) => setEditOption({ ...editOption, kycRequired: e.target.value === "true" })}
                  >
                    <option value="false">No (Optional)</option>
                    <option value="true">Yes (Mandatory)</option>
                  </select>
                </div>
                <div>
                  <label className={styles.faint} style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
                    Status
                  </label>
                  <select
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--a-border)", background: "var(--a-raised)", color: "#fff" }}
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
        </div>
      )}
    </div>
  );
}
