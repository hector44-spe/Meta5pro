"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "../login/auth.module.css";

export const dynamic = "force-dynamic";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (searchParams) {
      setToken(searchParams.get("token") || "");
    }
  }, [searchParams]);

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
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Unable to reach server. Please try again later.");
      }
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrorMsg(data.error || "Failed to reset password");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Network error resetting password");
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
