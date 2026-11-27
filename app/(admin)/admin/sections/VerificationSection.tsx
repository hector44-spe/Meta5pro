"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import styles from "./VerificationSection.module.css";

type VerificationRow = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  documentType: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  hasBack: boolean;
};

const documentLabel = (type: string) => ({
  passport: "Passport",
  drivers_license: "Driver's licence",
  national_id: "National identity card",
  birth_certificate: "Birth certificate",
}[type] || type);

export default function VerificationSection({
  flash,
  onCountChange,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
  onCountChange?: (count: number) => void;
}) {
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/admin/verifications", { cache: "no-store" });
      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(response.ok ? "Invalid server response." : `Server error (${response.status})`);
      }
      if (!response.ok) throw new Error(data.error || "Failed to load verification submissions.");
      const subs: VerificationRow[] = data.submissions || [];
      setRows(subs);
      const pendingCount = subs.filter((r) => r.status === "PENDING").length;
      onCountChange?.(pendingCount);
    } catch (error) {
      if (!silent) flash("error", error instanceof Error ? error.message : "Failed to load verification submissions.");
    } finally {
      setLoading(false);
    }
  }, [flash, onCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => filter === "ALL" ? rows : rows.filter((row) => row.status === filter), [filter, rows]);
  const counts = useMemo(() => ({
    pending: rows.filter((row) => row.status === "PENDING").length,
    approved: rows.filter((row) => row.status === "APPROVED").length,
    rejected: rows.filter((row) => row.status === "REJECTED").length,
  }), [rows]);

  const review = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: action === "reject" ? reason : undefined }),
      });
      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(response.ok ? "Invalid server response." : `Server error (${response.status})`);
      }
      if (!response.ok) throw new Error(data.error || "Review failed.");
      flash("ok", action === "approve" ? "Investor account verified and notified." : "Verification rejected and investor notified.");
      setRejectingId(null);
      setReason("");
      await load(true);
    } catch (error) {
      flash("error", error instanceof Error ? error.message : "Review failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.stats}>
        <div className={styles.stat}><strong>{counts.pending}</strong><span>Awaiting review</span></div>
        <div className={styles.stat}><strong>{counts.approved}</strong><span>Verified accounts</span></div>
        <div className={styles.stat}><strong>{counts.rejected}</strong><span>Rejected submissions</span></div>
      </div>
      <div className={styles.toolbar}>
        <h2>Identity documents</h2>
        <select className={styles.filter} value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter verification status">
          <option value="ALL">All submissions</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      <div className={styles.tableHeader}>
        <span>User / Investor</span>
        <span>Document &amp; Status</span>
        <span style={{ textAlign: "right" }}>Files &amp; Actions</span>
      </div>
      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>
            <Loader2 className={styles.spin} size={22} /> Loading submissions…
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No verification submissions found.</div>
        ) : (
          filtered.map((row) => (
            <article className={styles.card} key={row.id}>
              <div className={styles.identity}>
                <div className={styles.userAvatar}>
                  {(row.userName?.[0] || row.userEmail?.[0] || "U").toUpperCase()}
                </div>
                <div className={styles.identityMeta}>
                  <strong title={row.userName || "Investor"}>{row.userName || "Investor"}</strong>
                  <span className={styles.userEmail} title={row.userEmail}>{row.userEmail}</span>
                  <span className={styles.subDate}>Submitted {new Date(row.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className={styles.document}>
                <strong className={styles.docType}>{documentLabel(row.documentType)}</strong>
                <div className={styles.docMeta}>
                  <span
                    className={`${styles.pill} ${
                      row.status === "APPROVED"
                        ? styles.approved
                        : row.status === "REJECTED"
                        ? styles.rejected
                        : styles.pending
                    }`}
                  >
                    {row.status === "APPROVED" ? "Approved" : row.status === "REJECTED" ? "Rejected" : "Pending"}
                  </span>
                </div>
                {row.rejectionReason ? <span className={styles.rejectReason}>Reason: {row.rejectionReason}</span> : null}
              </div>
              <div className={styles.cardRight}>
                <div className={styles.files}>
                  <a className={styles.file} href={`/api/verification/${row.id}/file/front`} target="_blank" rel="noreferrer">
                    <ExternalLink size={13} /> Front
                  </a>
                  {row.hasBack ? (
                    <a className={styles.file} href={`/api/verification/${row.id}/file/back`} target="_blank" rel="noreferrer">
                      <ExternalLink size={13} /> Back
                    </a>
                  ) : null}
                </div>
                {row.status === "PENDING" ? (
                  <div className={styles.actions} style={{ marginTop: 6 }}>
                    <button type="button" className={styles.approve} onClick={() => review(row.id, "approve")} disabled={busyId === row.id}>
                      {busyId === row.id ? <Loader2 size={13} className={styles.spin} /> : <CheckCircle2 size={13} />} Approve
                    </button>
                    <button type="button" className={styles.reject} onClick={() => { setRejectingId(row.id); setReason(""); }} disabled={busyId === row.id}>
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                ) : null}
              </div>
              {rejectingId === row.id ? (
                <div className={styles.review}>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Explain why the documents were rejected…"
                    maxLength={500}
                    autoFocus
                  />
                  <div className={styles.reviewActions}>
                    <button type="button" className={styles.file} onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</button>
                    <button type="button" className={styles.reject} onClick={() => review(row.id, "reject")} disabled={busyId === row.id || reason.trim().length < 3}>
                      {busyId === row.id ? <Loader2 size={14} className={styles.spin} /> : <XCircle size={14} />} Confirm rejection
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
