"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Globe, ChevronDown, Search } from "lucide-react";
import {
  ALL_LANGUAGES,
  getCurrentLanguageCode,
  changeLanguage,
  getFlagUrl,
} from "@/lib/languages";
import styles from "./auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Language dropdown
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [currentCode, setCurrentCode] = useState("en");

  useEffect(() => {
    setCurrentCode(getCurrentLanguageCode());
    const handleChanged = (e: any) => {
      if (e?.detail) setCurrentCode(e.detail);
    };
    window.addEventListener("mg5-lang-changed", handleChanged);
    return () => window.removeEventListener("mg5-lang-changed", handleChanged);
  }, []);

  const currentLang =
    ALL_LANGUAGES.find((l) => l.code === currentCode) || ALL_LANGUAGES[0];

  const filteredLangs = ALL_LANGUAGES.filter(
    (l) =>
      !langSearch.trim() ||
      l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authWrapper}>
        {/* Exact Authentic Auth Header */}
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
            <div style={{ position: "relative" }}>
              <div
                className={styles.globeWrapper}
                onClick={() => setLangOpen(!langOpen)}
              >
                <div className={styles.globeContent}>
                  <Globe size={18} />
                  <span className={styles.globeCode}>{currentLang.code}</span>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    transform: langOpen ? "rotate(180deg)" : "none",
                    transition: "transform 150ms ease",
                  }}
                />
              </div>

              {langOpen && (
                <div
                  className={styles.dropdownMenu}
                  style={{
                    width: "220px",
                    right: 0,
                    left: "auto",
                    maxHeight: "320px",
                    overflowY: "auto",
                    padding: "4px",
                    zIndex: 9999,
                  }}
                >
                  <div
                    style={{
                      padding: "6px",
                      position: "sticky",
                      top: 0,
                      background: "#18181b",
                      zIndex: 10,
                      borderBottom: "1px solid #27272a",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Search language..."
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        fontSize: "12px",
                        background: "#09090b",
                        border: "1px solid #3f3f46",
                        borderRadius: "4px",
                        color: "#fff",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  {filteredLangs.map((l) => (
                    <div
                      key={l.code}
                      className={styles.dropdownItem}
                      onClick={() => {
                        changeLanguage(l.code);
                        setCurrentCode(l.code);
                        setLangOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "7px 10px",
                        background:
                          currentCode === l.code
                            ? "rgba(79, 70, 229, 0.25)"
                            : undefined,
                      }}
                    >
                      <img
                        src={getFlagUrl(l.countryCode)}
                        alt={l.code}
                        style={{
                          width: "18px",
                          height: "13px",
                          objectFit: "cover",
                          borderRadius: "2px",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          textTransform: "uppercase",
                          fontSize: "11px",
                          minWidth: "24px",
                        }}
                      >
                        {l.code}
                      </span>
                      <span className={styles.itemSecondary} style={{ fontSize: "12px" }}>
                        {l.label}
                      </span>
                    </div>
                  ))}
                  {filteredLangs.length === 0 && (
                    <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "#71717a" }}>
                      No languages found
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/" className={styles.headerBackLink}>
              <div className={styles.headerBackBtn}>
                <p>Back to homepage</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Auth Form */}
        <main className={styles.authPageContent}>
          <div className={styles.authForm}>
            <span className={styles.authFormHeader}>
              <h3 className={styles.authFormTitle}>Welcome back</h3>
              <p className={styles.authFormSubtext}>Log in to your account</p>
            </span>

            {error && (
              <div
                style={{
                  background: "rgba(255, 51, 68, 0.12)",
                  border: "1px solid rgba(255, 51, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  color: "var(--color-negative)",
                  fontSize: "13px",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className={styles.authFormFields}>
              <div className={styles.textBoxPrimary}>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.passwordBoxPrimary}>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.showBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={14} strokeWidth={1.5} />
                    ) : (
                      <Eye size={14} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              <br />

              <p className={styles.formActionText}>
                Don&apos;t have an account?{" "}
                <Link href="/register" className={styles.action}>
                  Register
                </Link>
              </p>

              <p className={styles.formActionText}>
                Forgot your password?{" "}
                <Link href="/forgot-password" className={styles.action}>
                  Reset
                </Link>
              </p>

              <div className={styles.authFormFooter}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.authBtn} ${loading ? styles.disabled : ""}`}
                >
                  <p>{loading ? "Logging in..." : "Log in"}</p>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
