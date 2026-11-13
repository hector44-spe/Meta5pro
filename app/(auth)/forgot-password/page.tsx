"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../login/auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [directResetUrl, setDirectResetUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Unable to reach server. Please try again later.");
      }
      if (res.ok) {
        setSubmitted(true);
        if (data.resetUrl) {
          setDirectResetUrl(data.resetUrl);
        }
      } else {
        setErrorMsg(data.error || "Failed to process request");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Network error submitting request");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authWrapper}>
        <header className={styles.authHeader}>
          <Link href="/" className={styles.logoWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 198 235"
              style={{ height: "36px", width: "auto" }}
            >
              <path
                fill="#fff"
                d="m124.3 67.826-22.622 39.194H124.3v108.569l-50.611 18.422V166.2H96.32L73.69 126.996V18.422L124.3 0zm-73.676 59.17L27.99 166.2h22.634v23.063L0 207.685V59.92l50.624-18.435zm147.362 47.095-50.611 18.434V107.02h22.634l-22.634-39.213V44.748l50.624-18.422z"
              />
            </svg>
          </Link>

          <div className={styles.headerActions}>
            <Link href="/login" className={styles.headerBackLink}>
              <div className={styles.headerBackBtn}>
                <p>Back to login</p>
              </div>
            </Link>
          </div>
        </header>

        <main className={styles.authPageContent}>
          <div className={styles.authForm}>
            <span className={styles.authFormHeader}>
              <h3 className={styles.authFormTitle}>Reset Password</h3>
              <p className={styles.authFormSubtext}>
                Enter your email address to receive password reset instructions
              </p>
            </span>

            {errorMsg && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "6px",
                  padding: "10px",
                  color: "#ef4444",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {errorMsg}
              </div>
            )}

            {submitted ? (
              <div
                style={{
                  background: "rgba(1, 178, 139, 0.1)",
                  border: "1px solid rgba(1, 178, 139, 0.3)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                <p
                  style={{
                    color: "var(--color-positive)",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  Reset Link Dispatched
                </p>
                <p style={{ fontSize: "0.85rem", color: "#ccc" }}>
                  If an account exists with {email}, a password reset link has
                  been generated.
                </p>

                {directResetUrl && (
                  <div style={{ marginTop: "1rem", padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}>
                    <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "6px" }}>Direct Reset Link:</p>
                    <Link
                      href={directResetUrl}
                      style={{ color: "#38bdf8", fontWeight: 600, fontSize: "0.85rem", wordBreak: "break-all" }}
                    >
                      Click here to reset your password now &rarr;
                    </Link>
                  </div>
                )}

                <Link
                  href="/login"
                  className={styles.action}
                  style={{ display: "inline-block", marginTop: "1.25rem" }}
                >
                  Return to Log in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.authFormFields}>
                <div className={styles.textBoxPrimary}>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Account email address"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className={styles.authFormFooter}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.authBtn} ${loading ? styles.disabled : ""}`}
                  >
                    <p>{loading ? "Sending..." : "Send Reset Link"}</p>
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
