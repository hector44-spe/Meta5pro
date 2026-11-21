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

export default function VerificationSection({ flash }: { flash: (kind: "ok" | "error", text: string) => void }) {
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load verification submissions.");
      setRows(data.submissions || []);
    } catch (error) {
      if (!silent) flash("error", error instanceof Error ? error.message : "Failed to load verification submissions.");
    } finally {
      setLoading(false);
    }
  }, [flash]);

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
      const data = await response.json();
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
      <div className={styles.list}>
        {loading ? <div className={styles.empty}><Loader2 className={styles.spin} size={22} /> Loading submissions…</div> : filtered.length === 0 ? <div className={styles.empty}>No verification submissions found.</div> : filtered.map((row) => (
          <article className={styles.card} key={row.id}>
            <div className={styles.identity}>
              <strong>{row.userName || "Investor"}</strong>
              <span>{row.userEmail}</span>
              <span>Submitted {new Date(row.createdAt).toLocaleString()}</span>
            </div>
            <div className={styles.document}>
              <strong>{documentLabel(row.documentType)}</strong>
              <span className={`${styles.pill} ${row.status === "APPROVED" ? styles.approved : row.status === "REJECTED" ? styles.rejected : styles.pending}`}>{row.status.toLowerCase()}</span>
              {row.rejectionReason ? <span>Reason: {row.rejectionReason}</span> : null}
            </div>
            <div>
              <div className={styles.files}>
                <a className={styles.file} href={`/api/verification/${row.id}/file/front`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Front</a>
                {row.hasBack ? <a className={styles.file} href={`/api/verification/${row.id}/file/back`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Back</a> : null}
              </div>
              {row.status === "PENDING" ? <div className={styles.actions} style={{ marginTop: 9 }}>
                <button type="button" className={styles.approve} onClick={() => review(row.id, "approve")} disabled={busyId === row.id}><CheckCircle2 size={14} /> Approve</button>
                <button type="button" className={styles.reject} onClick={() => { setRejectingId(row.id); setReason(""); }} disabled={busyId === row.id}><XCircle size={14} /> Reject</button>
              </div> : null}
            </div>
            {rejectingId === row.id ? <div className={styles.review}>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why the documents were rejected…" maxLength={500} autoFocus />
              <div className={styles.reviewActions}>
                <button type="button" className={styles.file} onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</button>
                <button type="button" className={styles.reject} onClick={() => review(row.id, "reject")} disabled={busyId === row.id || reason.trim().length < 3}>{busyId === row.id ? <Loader2 size={14} className={styles.spin} /> : <XCircle size={14} />} Confirm rejection</button>
              </div>
            </div> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
