"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  Loader2,
  Trash2,
  CheckCircle2,
  Ban,
  Clock,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import styles from "../page.module.css";
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";

const usd = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface AdminUserCard {
  id: string;
  ref: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  type: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardPin: string;
  status: "active" | "pending" | "blocked";
  balance: number;
  issuanceFee: number;
  createdAt: string;
}

export default function CardRequestsSection({
  flash,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
}) {
  const [cards, setCards] = useState<AdminUserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);

  const loadCards = async () => {
    setLoading(true);
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
        setCards(data.cards || []);
      } else {
        flash("error", "Failed to load card requests.");
      }
    } catch {
      flash("error", "Network error while loading card requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadCards();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const handleUpdateStatus = async (userId: string, cardId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateCardStatus", userId, cardId, newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      flash("ok", `Card request marked as ${newStatus}.`);
      loadCards();
    } catch (e: any) {
      flash("error", e.message || "Failed to update status");
    }
  };

  const handleDeleteCard = (userId: string, cardId: string) => {
    setConfirmState({
      title: "Delete Card Request?",
      message: "Are you sure you want to delete this user card request?",
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteCard", userId, cardId }),
          });
          if (!res.ok) throw new Error("Delete failed");
          flash("ok", "Card request deleted.");
          loadCards();
        } catch (e: any) {
          flash("error", e.message || "Failed to delete");
        } finally {
          setConfirmState(null);
        }
      },
    });
  };

  const filteredCards = useMemo(() => {
    let list = cards;
    if (filterType !== "ALL") {
      list = list.filter((c) => c.type.toLowerCase() === filterType.toLowerCase());
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.userEmail.toLowerCase().includes(q) ||
          c.userFullName.toLowerCase().includes(q) ||
          c.cardNumber.includes(q) ||
          c.ref.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cards, filterType, query]);

  const totalFees = useMemo(() => cards.reduce((a, c) => a + (c.issuanceFee || 1000), 0), [cards]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(71, 99, 240, 0.15)", color: "#7a94ff" }}>
            <CreditCard size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : cards.length}
          </div>
          <div className={styles.statLabel}>Total Card Requests</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CheckCircle2 size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : cards.filter((c) => c.status === "active").length}
          </div>
          <div className={styles.statLabel}>Active Cards</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(245, 165, 36, 0.15)", color: "#fbbf24" }}>
            <Clock size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : cards.filter((c) => c.status === "pending").length}
          </div>
          <div className={styles.statLabel}>Pending Verification</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c4b5fd" }}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statValue}>
            {loading ? <span className={styles.skeletonStatVal} /> : usd(totalFees)}
          </div>
          <div className={styles.statLabel}>Issuance Fees Collected</div>
        </div>
      </div>

      {/* Cards Table */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Card Requests</h2>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", width: "100%", maxWidth: "560px" }}>
            <div className={styles.searchBox} style={{ flex: "1 1 200px" }}>
              <Search size={15} />
              <input
                type="search"
                placeholder="Filter by user or card number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--a-border)",
                background: "var(--a-raised)",
                color: "#fff",
                fontSize: "13px",
                boxSizing: "border-box",
                flex: "0 1 auto",
              }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="Regular">Regular</option>
              <option value="Virtual">Virtual</option>
              <option value="Physical">Physical</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: "1020px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "200px" }}>User</th>
                <th style={{ minWidth: "100px" }}>Card Type</th>
                <th style={{ minWidth: "140px" }}>Card Number</th>
                <th style={{ minWidth: "120px" }}>Exp / CVV / PIN</th>
                <th className={styles.right} style={{ minWidth: "100px" }}>Fee Paid</th>
                <th style={{ minWidth: "120px" }}>Requested Date</th>
                <th style={{ minWidth: "90px" }}>Status</th>
                <th style={{ minWidth: "140px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ minWidth: "200px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div className={styles.skeletonCell} style={{ width: 130 }} />
                        <div className={styles.skeletonCell} style={{ width: 90 }} />
                      </div>
                    </td>
                    <td style={{ minWidth: "100px" }}><div className={styles.skeletonCell} style={{ width: 80 }} /></td>
                    <td style={{ minWidth: "140px" }}><div className={styles.skeletonCell} style={{ width: 110 }} /></td>
                    <td style={{ minWidth: "120px" }}><div className={styles.skeletonCell} style={{ width: 90 }} /></td>
                    <td className={styles.right} style={{ minWidth: "100px" }}><div className={styles.skeletonCell} style={{ width: 60, marginLeft: "auto" }} /></td>
                    <td style={{ minWidth: "120px" }}><div className={styles.skeletonCell} style={{ width: 85 }} /></td>
                    <td style={{ minWidth: "90px" }}><div className={styles.skeletonCell} style={{ width: 60 }} /></td>
                    <td style={{ minWidth: "140px", textAlign: "right" }}><div className={styles.skeletonCell} style={{ width: 70, marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "36px", color: "var(--a-muted)" }}>
                    No card requests found.
                  </td>
                </tr>
              ) : (
                filteredCards.map((c) => (
                  <tr key={c.id || c.ref}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{(c.userEmail[0] || "U").toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.userFullName}</div>
                          <div className={styles.faint}>{c.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.pill} ${
                          c.type === "Physical"
                            ? styles.pillAmber
                            : c.type === "Virtual"
                            ? styles.pillBlue
                            : styles.pillGreen
                        }`}
                      >
                        {c.type} Card
                      </span>
                    </td>
                    <td className={styles.mono} style={{ fontWeight: 600, letterSpacing: "1px" }}>
                      {c.cardNumber ? `•••• •••• •••• ${c.cardNumber.slice(-4)}` : "Generating..."}
                    </td>
                    <td className={styles.mono} style={{ fontSize: "12px" }}>
                      {c.expiryDate} / CVV: {c.cvv} / PIN: {c.cardPin}
                    </td>
                    <td className={styles.mono} style={{ color: "#34d399", fontWeight: 700 }}>
                      {usd(c.issuanceFee || 1000)}
                    </td>
                    <td className={styles.faint} style={{ fontSize: "12px" }}>
                      {new Date(c.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td>
                      <span
                        className={`${styles.pill} ${
                          c.status === "active"
                            ? styles.pillGreen
                            : c.status === "pending"
                            ? styles.pillAmber
                            : styles.pillRed
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {c.status !== "active" ? (
                          <button
                            type="button"
                            className={styles.btnSuccessSm}
                            onClick={() => handleUpdateStatus(c.userId, c.id, "active")}
                            title="Confirm Payment & Activate Card"
                          >
                            <ShieldCheck size={14} /> Confirm & Activate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.btnGhostSm}
                            onClick={() => handleUpdateStatus(c.userId, c.id, "blocked")}
                            title="Block Card"
                          >
                            <Ban size={14} /> Block
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.btnDangerSm}
                          onClick={() => handleDeleteCard(c.userId, c.id)}
                          title="Delete Card"
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

      <CustomConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}
