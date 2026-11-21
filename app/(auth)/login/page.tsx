"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react";
import {
  ALL_LANGUAGES,
  getCurrentLanguageCode,
  changeLanguage,
  getFlagUrl,
} from "@/lib/languages";
import styles from "./auth.module.css";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA state flow
  const [step, setStep] = useState<"credentials" | "2fa_challenge" | "2fa_setup" | "backup_codes_reveal">("credentials");
  const [tempToken, setTempToken] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [isBackupMode, setIsBackupMode] = useState(false);

  // 2FA Setup data
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
    otpAuthUri: string;
  } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedAllCodes, setCopiedAllCodes] = useState(false);

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

  // Phase 1: Submit credentials
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
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Unable to reach server. Please try again later.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if 2FA is required for Admin
      if (data.requires2FA && data.tempToken) {
        setTempToken(data.tempToken);
        setStep("2fa_challenge");
        return;
      }

      if (data.requires2FASetup && data.tempToken) {
        setTempToken(data.tempToken);
        await initSetup2FA(data.tempToken);
        return;
      }

      // Normal Login Success
      try {
        if (data.user?.id) {
          sessionStorage.removeItem(`mg5_frozen_toast_shown_${data.user.id}`);
        }
      } catch {}
      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        const safeRedirect = redirectTarget.startsWith("/")
          && !redirectTarget.startsWith("//")
          && !redirectTarget.includes("\\");
        router.push(safeRedirect ? redirectTarget : "/dashboard");
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

  // Phase 2: Init 2FA Setup (First time Admin)
  const initSetup2FA = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate 2FA setup");
      setSetupData(data);
      setStep("2fa_setup");
    } catch (err: any) {
      setError(err.message || "Failed to load 2FA setup");
      setStep("credentials");
    } finally {
      setLoading(false);
    }
  };

  // Phase 3: Confirm & Activate 2FA Setup
  const handleActivate2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length < 6) {
      setError("Please enter the 6-digit code from your authenticator app.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempToken,
          code: totpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "2FA activation failed");

      if (Array.isArray(data.backupCodes) && data.backupCodes.length > 0) {
        setBackupCodes(data.backupCodes);
        setStep("backup_codes_reveal");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Phase 4: Verify 2FA during Login Challenge
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length < 6) {
      setError("Please enter your 6-digit code or backup recovery code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempToken,
          code: totpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid authentication code");
    } finally {
      setLoading(false);
    }
  };

  const copySecretToClipboard = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyAllBackupCodes = () => {
    if (!backupCodes.length) return;
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedAllCodes(true);
    setTimeout(() => setCopiedAllCodes(false), 2000);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authWrapper}>
        {/* Auth Header */}
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

          <Link href="/" className={styles.headerBackLink}>
            <div className={styles.headerBackBtn}>
              <p>Back to homepage</p>
            </div>
          </Link>
        </header>

        {/* Right-aligned Language Switcher Pill */}
        <div className={styles.authLangRow}>
          <div style={{ position: "relative" }}>
            <div
              className={styles.globeWrapper}
              onClick={() => setLangOpen(!langOpen)}
            >
              <div className={styles.globeContent}>
                <Globe size={15} />
                <span className={styles.globeCode}>{currentLang.code}</span>
              </div>
              <ChevronDown
                size={13}
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
              </div>
            )}
          </div>
        </div>

        {/* Main Auth Form Container */}
        <main className={styles.authPageContent}>
          <div className={styles.authForm}>
            {/* STEP 1: CREDENTIALS */}
            {step === "credentials" && (
              <>
                <span className={styles.authFormHeader}>
                  <h3 className={styles.authFormTitle}>Welcome back!</h3>
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
                      color: "#ff4d5e",
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
              </>
            )}

            {/* STEP 2: 2FA CHALLENGE (LOGIN) */}
            {step === "2fa_challenge" && (
              <>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(71, 99, 240, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      color: "#4763f0",
                    }}
                  >
                    <ShieldCheck size={26} />
                  </div>
                  <h3 className={styles.authFormTitle}>Security Verification</h3>
                  <p className={styles.authFormSubtext}>
                    {isBackupMode
                      ? "Enter one of your 8-character recovery backup codes"
                      : "Enter the 6-digit code from Google or Microsoft Authenticator"}
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      background: "rgba(255, 51, 68, 0.12)",
                      border: "1px solid rgba(255, 51, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      marginBottom: "16px",
                      color: "#ff4d5e",
                      fontSize: "13px",
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerify2FA} className={styles.authFormFields}>
                  <div className={styles.textBoxPrimary}>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        autoFocus
                        required
                        maxLength={isBackupMode ? 12 : 6}
                        placeholder={isBackupMode ? "e.g. ABCD-1234" : "000000"}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                        style={{
                          letterSpacing: isBackupMode ? "2px" : "6px",
                          textAlign: "center",
                          fontSize: "18px",
                          fontWeight: 700,
                          fontFamily: "monospace",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "12.5px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBackupMode(!isBackupMode);
                        setTotpCode("");
                        setError(null);
                      }}
                      style={{ background: "none", border: "none", color: "#4763f0", cursor: "pointer", padding: 0 }}
                    >
                      {isBackupMode ? "Use 6-digit Authenticator code" : "Use emergency recovery backup code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("credentials");
                        setTotpCode("");
                        setError(null);
                      }}
                      style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.5)", cursor: "pointer", padding: 0 }}
                    >
                      Back to login
                    </button>
                  </div>

                  <div className={styles.authFormFooter} style={{ marginTop: "24px" }}>
                    <button
                      type="submit"
                      disabled={loading || totpCode.trim().length < 6}
                      className={`${styles.authBtn} ${loading || totpCode.trim().length < 6 ? styles.disabled : ""}`}
                    >
                      <p>{loading ? "Verifying..." : "Verify & Sign In"}</p>
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* STEP 3: MANDATORY 2FA SETUP (FIRST-TIME ADMIN) */}
            {step === "2fa_setup" && setupData && (
              <>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(71, 99, 240, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      color: "#4763f0",
                    }}
                  >
                    <KeyRound size={26} />
                  </div>
                  <h3 className={styles.authFormTitle}>Set Up Two-Factor Authentication</h3>
                  <p className={styles.authFormSubtext}>
                    Required to protect your administrator account
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      background: "rgba(255, 51, 68, 0.12)",
                      border: "1px solid rgba(255, 51, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      marginBottom: "16px",
                      color: "#ff4d5e",
                      fontSize: "13px",
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* QR Code Card */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "12px",
                    borderRadius: "12px",
                    width: "200px",
                    margin: "0 auto 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  <img
                    src={setupData.qrCode}
                    alt="2FA QR Code"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>

                {/* Manual Secret Key */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>Manual Setup Key:</div>
                    <div style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: 700, color: "#fff", letterSpacing: "1px" }}>
                      {setupData.secret}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copySecretToClipboard}
                    style={{
                      background: "rgba(71, 99, 240, 0.15)",
                      border: "none",
                      color: "#4763f0",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copiedSecret ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedSecret ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <form onSubmit={handleActivate2FA} className={styles.authFormFields}>
                  <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "6px" }}>
                    Enter 6-digit confirmation code from your app:
                  </label>
                  <div className={styles.textBoxPrimary}>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        autoFocus
                        required
                        maxLength={6}
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                        style={{
                          letterSpacing: "6px",
                          textAlign: "center",
                          fontSize: "18px",
                          fontWeight: 700,
                          fontFamily: "monospace",
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.authFormFooter} style={{ marginTop: "20px" }}>
                    <button
                      type="submit"
                      disabled={loading || totpCode.trim().length !== 6}
                      className={`${styles.authBtn} ${loading || totpCode.trim().length !== 6 ? styles.disabled : ""}`}
                    >
                      <p>{loading ? "Activating..." : "Activate 2FA & Continue"}</p>
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* STEP 4: REVEAL BACKUP CODES */}
            {step === "backup_codes_reveal" && (
              <>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(52, 211, 153, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      color: "#34d399",
                    }}
                  >
                    <Check size={26} />
                  </div>
                  <h3 className={styles.authFormTitle}>Save Your Recovery Codes</h3>
                  <p className={styles.authFormSubtext}>
                    If you lose your authenticator device, each code can be used once to access your admin account.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {backupCodes.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "6px 8px",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "6px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        fontWeight: 700,
                        textAlign: "center",
                        color: "#fff",
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button
                    type="button"
                    onClick={copyAllBackupCodes}
                    style={{
                      flex: 1,
                      height: "40px",
                      backgroundColor: "rgba(71, 99, 240, 0.15)",
                      border: "1px solid rgba(71, 99, 240, 0.3)",
                      borderRadius: "8px",
                      color: "#4763f0",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    {copiedAllCodes ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedAllCodes ? "Copied All Codes!" : "Copy All Codes"}</span>
                  </button>
                </div>

                <div className={styles.authFormFooter}>
                  <button
                    type="button"
                    onClick={() => router.push("/admin")}
                    className={styles.authBtn}
                  >
                    <p>I have saved my codes — Enter Admin Panel</p>
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0b0d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
