"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "../login/auth.module.css";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      setErrorMsg("Reset token is missing or invalid. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrorMsg(data.error || "Failed to reset password");
      }
    } catch {
      setErrorMsg("Network error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authWrapper}>
        <header className={styles.authHeader}>
          <Link href="/" className={styles.logoWrapper}>
            <span
              style={{
                color: "#fff",
                fontSize: "18px",
                fontWeight: "600",
                letterSpacing: "-0.01em",
              }}
            >
              Meta Gold 5
            </span>
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
              <h3 className={styles.authFormTitle}>Set New Password</h3>
              <p className={styles.authFormSubtext}>
                Please create a strong password for your account
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

            {success ? (
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
                  Password Successfully Reset!
                </p>
                <p style={{ fontSize: "0.85rem", color: "#ccc" }}>
                  Redirecting to login portal in 2 seconds...
                </p>
                <Link
                  href="/login"
                  className={styles.action}
                  style={{ display: "inline-block", marginTop: "1rem" }}
                >
                  Click here to Log in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.authFormFields}>
                <div className={styles.textBoxPrimary}>
                  <div className={styles.inputWrapper}>
                    <input
                      type="password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password (min 8 characters)"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className={styles.textBoxPrimary}>
                  <div className={styles.inputWrapper}>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className={styles.authFormFooter}>
                  <button
                    type="submit"
                    disabled={loading || !token}
                    className={`${styles.authBtn} ${loading || !token ? styles.disabled : ""}`}
                  >
                    <p>{loading ? "Updating..." : "Update Password"}</p>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", color: "#fff", textAlign: "center" }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
