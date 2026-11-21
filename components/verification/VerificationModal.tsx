"use client";

import { useCallback, useEffect, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import styles from "./VerificationModal.module.css";

type Submission = {
  id: string;
  documentType: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
};

export default function VerificationModal({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: (message: string) => void;
}) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState("passport");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/verification", { cache: "no-store" });
      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(response.ok ? "Invalid server response." : `Server error (${response.status})`);
      }
      if (!response.ok) throw new Error(data.error || "Could not load verification status.");
      setSubmission(data.submission ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load verification status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const canUpload = !submission || submission.status === "REJECTED";
  const submit = async () => {
    if (!front) {
      setError("Upload the front or photo page of your identity document.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.append("documentType", documentType);
      form.append("front", front);
      if (back) form.append("back", back);
      const response = await fetch("/api/verification", { method: "POST", body: form });
      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(response.ok ? "Invalid server response." : `Server error (${response.status})`);
      }
      if (!response.ok) throw new Error(data.error || "Document upload failed.");
      await loadStatus();
      onSubmitted("Your verification documents were uploaded and are awaiting admin review.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Document upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = submission?.status === "APPROVED"
    ? styles.approved
    : submission?.status === "REJECTED"
      ? styles.rejected
      : styles.pending;

  return (
    <div className={styles.backdrop} onClick={() => !submitting && onClose()}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="verification-title" onClick={(event) => event.stopPropagation()}>
        <header className={styles.head}>
          <h2 id="verification-title">Account verification</h2>
          <button type="button" className={styles.close} onClick={onClose} disabled={submitting} aria-label="Close verification form">
            <X size={20} />
          </button>
        </header>
        <div className={styles.body}>
          <p className={styles.intro}>Upload a clear government-issued identity document. Files are stored privately and are only available to you and authorized administrators.</p>
          <div className={styles.status}>
            {loading ? "Checking verification status…" : submission ? (
              <>Status: <strong className={statusClass}>{submission.status === "APPROVED" ? "Verified" : submission.status === "REJECTED" ? "Rejected" : "Pending review"}</strong>
                {submission.rejectionReason ? <div>Reason: {submission.rejectionReason}</div> : null}
              </>
            ) : <>Status: <strong className={styles.pending}>Not submitted</strong></>}
          </div>

          {canUpload ? (
            <>
              <label className={styles.field}>
                <span>Document type</span>
                <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver&apos;s licence</option>
                  <option value="national_id">National identity card</option>
                  <option value="birth_certificate">Birth certificate</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Front / photo page</span>
                <span className={styles.fileButton}><FileUp size={18} /><span>{front?.name || "Choose JPG, PNG, WEBP, or PDF"}</span><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setFront(event.target.files?.[0] ?? null)} /></span>
              </label>
              <label className={styles.field}>
                <span>Back page (optional)</span>
                <span className={styles.fileButton}><FileUp size={18} /><span>{back?.name || "Choose a second file if required"}</span><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setBack(event.target.files?.[0] ?? null)} /></span>
              </label>
              <p className={styles.hint}>Maximum 8MB per file. Make sure all four corners and document details are visible.</p>
              {error ? <p className={styles.error}>{error}</p> : null}
              <button type="button" className={styles.submit} onClick={submit} disabled={submitting || loading || !front}>
                {submitting ? <Loader2 size={17} className={styles.spin} /> : <FileUp size={17} />}
                {submitting ? "Uploading securely…" : submission?.status === "REJECTED" ? "Resubmit documents" : "Submit for verification"}
              </button>
            </>
          ) : error ? <p className={styles.error}>{error}</p> : null}
        </div>
      </section>
    </div>
  );
}
