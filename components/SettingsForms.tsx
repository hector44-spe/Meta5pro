"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
} from "lucide-react";
import "@/styles/app-forms.css";

export interface UserProfile {
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  country: string | null;
}

function Notice({ kind, text }: { kind: "ok" | "error"; text: string }) {
  const ok = kind === "ok";
  return (
    <div
      role={ok ? "status" : "alert"}
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        fontSize: "13px",
        padding: "10px 14px",
        borderRadius: "8px",
        backgroundColor: ok ? "rgba(52, 211, 153, 0.1)" : "rgba(248, 73, 96, 0.1)",
        border: ok ? "1px solid rgba(52, 211, 153, 0.25)" : "1px solid rgba(248, 73, 96, 0.25)",
        color: ok ? "#34d399" : "#ff7a87",
      }}
    >
      {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span>{text}</span>
    </div>
  );
}

/** Personal info: loads and saves name, phone and country. Email is read-only. */
export function ProfileSettings({
  profile,
  onSaved,
}: {
  profile: UserProfile | null;
  onSaved: (p: UserProfile) => void;
}) {
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [phone, setPhone] = useState(profile?.phoneNumber ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Fill the form once the profile arrives
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? "");
    setPhone(profile.phoneNumber ?? "");
    setCountry(profile.country ?? "");
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phoneNumber: phone, country }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save changes");
      onSaved({ ...profile!, ...data.profile });
      setNotice({ kind: "ok", text: "Your profile has been updated." });
    } catch (err) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Could not save changes" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
      <form onSubmit={save} className="as-section-block">
        <h3 className="as-block-title">Personal Information</h3>
        <p className="as-block-sub">Manage your profile details and contact information</p>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-fullname">Full name</label>
          <div className="as-text-input-box">
            <input
              id="settings-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-email">Email address</label>
          <div className="as-text-input-box" style={{ opacity: 0.7 }}>
            <input
              id="settings-email"
              type="email"
              value={profile?.email ?? ""}
              disabled
            />
          </div>
        </div>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-phone">Phone number</label>
          <div className="as-text-input-box">
            <input
              id="settings-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+1 555 000 0000"
            />
          </div>
        </div>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-country">Country / region</label>
          <div className="as-text-input-box">
            <input
              id="settings-country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              autoComplete="country-name"
              placeholder="Country"
            />
          </div>
        </div>

        {notice && <div style={{ marginTop: "6px" }}><Notice kind={notice.kind} text={notice.text} /></div>}

        <button type="submit" disabled={busy || !profile} className="as-save" style={{ marginTop: "10px" }}>
          {busy ? <Loader2 size={18} className="spin" /> : "Save changes"}
        </button>
      </form>
    </div>
  );
}

/** Security: change password; 2FA controls; shows that withdrawals are confirmed by an emailed code. */
export function SecuritySettings({ email }: { email: string | null }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // 2FA Admin Settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<"idle" | "setup" | "backup_codes">("idle");
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string; otpAuthUri: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorNotice, setTwoFactorNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetch("/api/admin/2fa/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.twoFactorEnabled === "boolean") {
          setTwoFactorEnabled(data.twoFactorEnabled);
        }
      })
      .catch(() => {});
  }, []);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (next.length < 8) return setNotice({ kind: "error", text: "New password must be at least 8 characters." });
    if (next !== confirm) return setNotice({ kind: "error", text: "The new passwords don't match." });
    setBusy(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change password");
      setCurrent("");
      setNext("");
      setConfirm("");
      setNotice({ kind: "ok", text: "Your password has been changed." });
    } catch (err) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Could not change password" });
    } finally {
      setBusy(false);
    }
  };

  const start2FASetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorNotice(null);
    try {
      const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start 2FA setup");
      setSetupData(data);
      setSetupStep("setup");
    } catch (err: any) {
      setTwoFactorNotice({ kind: "error", text: err.message || "Failed to initialize 2FA" });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const activate2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length < 6) {
      setTwoFactorNotice({ kind: "error", text: "Please enter the 6-digit code from your app." });
      return;
    }
    setTwoFactorLoading(true);
    setTwoFactorNotice(null);
    try {
      const res = await fetch("/api/admin/2fa/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to activate 2FA");
      setTwoFactorEnabled(true);
      setBackupCodes(data.backupCodes || []);
      setSetupStep("backup_codes");
      setTwoFactorNotice({ kind: "ok", text: "Two-Factor Authentication is now active!" });
    } catch (err: any) {
      setTwoFactorNotice({ kind: "error", text: err.message || "Failed to activate 2FA" });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const disable2FA = async () => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
    setTwoFactorLoading(true);
    setTwoFactorNotice(null);
    try {
      const res = await fetch("/api/admin/2fa/disable", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disable 2FA");
      setTwoFactorEnabled(false);
      setSetupStep("idle");
      setSetupData(null);
      setTwoFactorNotice({ kind: "ok", text: "Two-Factor Authentication has been disabled." });
    } catch (err: any) {
      setTwoFactorNotice({ kind: "error", text: err.message || "Failed to disable 2FA" });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", paddingBottom: "36px" }}>
      {/* 1. Change Password Section */}
      <form onSubmit={change} className="as-section-block">
        <h3 className="as-block-title">Password</h3>
        <p className="as-block-sub">Update your account login password</p>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-current-pw">Current password</label>
          <div className="as-text-input-box">
            <input
              id="settings-current-pw"
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-new-pw">New password</label>
          <div className="as-text-input-box">
            <input
              id="settings-new-pw"
              type={showNext ? "text" : "password"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
            />
            <button
              type="button"
              onClick={() => setShowNext(!showNext)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
            >
              {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-confirm-pw">Confirm new password</label>
          <div className="as-text-input-box">
            <input
              id="settings-confirm-pw"
              type={showNext ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm new password"
              required
            />
          </div>
        </div>

        {notice && (
          <div style={{ marginTop: "4px" }}>
            <Notice kind={notice.kind} text={notice.text} />
          </div>
        )}

        <button type="submit" disabled={busy} className="as-save" style={{ marginTop: "8px" }}>
          {busy ? <Loader2 size={18} className="spin" /> : "Update password"}
        </button>
      </form>

      {/* 2. Two-Factor Authentication Section */}
      <div className="as-section-block">
        <h3 className="as-block-title">Two-Factor Authentication (2FA)</h3>
        <p className="as-block-sub">Add an extra layer of security using an authenticator app</p>

        <div
          style={{
            background: "#25282e",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "10px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: twoFactorEnabled ? "rgba(52, 211, 153, 0.12)" : "rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: twoFactorEnabled ? "#34d399" : "rgba(255, 255, 255, 0.6)",
                  flexShrink: 0,
                }}
              >
                <KeyRound size={18} />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                  Authenticator Status
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>
                  {twoFactorEnabled ? "Active & Protected" : "Not configured (Optional)"}
                </div>
              </div>
            </div>

            <span
              style={{
                padding: "4px 10px",
                borderRadius: "16px",
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.3px",
                backgroundColor: twoFactorEnabled ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 255, 255, 0.08)",
                color: twoFactorEnabled ? "#34d399" : "rgba(255, 255, 255, 0.5)",
                border: twoFactorEnabled ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {twoFactorEnabled ? "Active" : "Disabled"}
            </span>
          </div>

          <div style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.55)", lineHeight: 1.5 }}>
            Protect your admin account with Google Authenticator, Microsoft Authenticator, or 1Password.
          </div>

          {twoFactorNotice && (
            <div style={{ marginTop: "2px" }}>
              <Notice kind={twoFactorNotice.kind} text={twoFactorNotice.text} />
            </div>
          )}

          {setupStep === "idle" && (
            <div style={{ marginTop: "4px" }}>
              {twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={disable2FA}
                  disabled={twoFactorLoading}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "8px",
                    background: "rgba(248, 73, 96, 0.08)",
                    border: "1px solid rgba(248, 73, 96, 0.25)",
                    color: "#f84960",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {twoFactorLoading ? <Loader2 size={16} className="spin" /> : "Disable 2FA"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={start2FASetup}
                  disabled={twoFactorLoading}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "8px",
                    background: "rgba(71, 99, 240, 0.12)",
                    border: "1px solid rgba(71, 99, 240, 0.35)",
                    color: "#7b93ff",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {twoFactorLoading ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Set up 2FA (Optional)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* QR Code Setup Step */}
          {setupStep === "setup" && setupData && (
            <div
              style={{
                marginTop: "4px",
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "#1e2127",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
                1. Scan QR Code in Authenticator App
              </div>
              <div style={{ display: "flex", justifyContent: "center", margin: "14px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setupData.qrCode}
                  alt="2FA QR Code"
                  style={{ width: "150px", height: "150px", borderRadius: "8px", background: "#fff", padding: "6px" }}
                />
              </div>

              <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.5)", textAlign: "center" }}>
                Or enter this setup key manually:
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  margin: "6px 0 16px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#f59e0b",
                  background: "rgba(0,0,0,0.25)",
                  padding: "6px 10px",
                  borderRadius: "6px",
                }}
              >
                <span>{setupData.secret}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(setupData.secret);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}
                  title="Copy Key"
                >
                  {copiedKey ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                </button>
              </div>

              <form onSubmit={activate2FA}>
                <label className="as-label" style={{ display: "block", marginBottom: "8px" }}>
                  2. Enter 6-digit code from app
                </label>
                <div className="as-text-input-box" style={{ justifyContent: "center" }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    style={{
                      letterSpacing: "6px",
                      fontSize: "18px",
                      fontWeight: 700,
                      textAlign: "center",
                      width: "100%",
                    }}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "14px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setSetupStep("idle")}
                    style={{
                      flex: 1,
                      height: "44px",
                      borderRadius: "8px",
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={twoFactorLoading}
                    style={{
                      flex: 1.5,
                      height: "44px",
                      borderRadius: "8px",
                      background: "linear-gradient(180deg, #5a74ff 0%, #4763f0 100%)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: twoFactorLoading ? "default" : "pointer",
                      opacity: twoFactorLoading ? 0.6 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      margin: 0,
                      padding: "0 16px",
                    }}
                  >
                    {twoFactorLoading ? <Loader2 size={16} className="spin" /> : "Verify & Enable"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Backup codes step */}
          {setupStep === "backup_codes" && (
            <div
              style={{
                marginTop: "4px",
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "#1e2127",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                Emergency Recovery Codes
              </div>
              <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "12px", lineHeight: 1.4 }}>
                Save these one-time codes in a safe place. You can use them if you lose access to your phone.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  marginBottom: "14px",
                }}
              >
                {backupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "6px 8px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "4px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      textAlign: "center",
                      color: "#34d399",
                      fontWeight: 600,
                    }}
                  >
                    {code}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join("\n"));
                  if (typeof window !== "undefined") window.alert("Backup codes copied to clipboard!");
                  setSetupStep("idle");
                }}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "8px",
                  background: "linear-gradient(180deg, #5a74ff 0%, #4763f0 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  margin: 0,
                  padding: "0 16px",
                }}
              >
                Copy Codes & Finish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Withdrawal Security Notice Card */}
      <div
        style={{
          background: "#25282e",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "10px",
          padding: "16px 18px",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: "rgba(52, 211, 153, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#34d399",
            flexShrink: 0,
            marginTop: "1px",
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
            Withdrawal confirmation
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", marginTop: "3px", lineHeight: 1.45 }}>
            Every withdrawal needs a one-time code sent to <span style={{ color: "#ffffff", fontWeight: 500 }}>{email ?? "your email"}</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

export const DISPLAY_CURRENCIES = [
  { code: "USD", label: "US dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British pound" },
  { code: "NGN", label: "Nigerian naira" },
  { code: "GHS", label: "Ghanaian cedi" },
  { code: "KES", label: "Kenyan shilling" },
  { code: "ZAR", label: "South African rand" },
  { code: "CAD", label: "Canadian dollar" },
  { code: "AUD", label: "Australian dollar" },
  { code: "INR", label: "Indian rupee" },
  { code: "JPY", label: "Japanese yen" },
  { code: "CHF", label: "Swiss franc" },
  { code: "AED", label: "UAE dirham" },
];

/** Language, display currency and balance privacy. */
export function AccountSettings({
  languages,
  langCode,
  onLanguageChange,
  currency,
  onCurrencyChange,
  hideBalance,
  onToggleHideBalance,
  rateNote,
}: {
  languages: { code: string; label: string }[];
  langCode: string;
  onLanguageChange: (code: string) => void;
  currency: string;
  onCurrencyChange: (code: string) => void;
  hideBalance: boolean;
  onToggleHideBalance: () => void;
  rateNote: string | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
      <div className="as-section-block">
        <h3 className="as-block-title">Preferences</h3>
        <p className="as-block-sub">Customize your display language and account currency</p>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-language">Language</label>
          <div className="as-text-input-box">
            <select
              id="settings-language"
              value={langCode}
              onChange={(e) => onLanguageChange(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} style={{ background: "#25282e", color: "#fff" }}>
                  {l.label} ({l.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>
            The page reloads to apply a new language.
          </div>
        </div>

        <div className="as-input-wrap">
          <label className="as-label" htmlFor="settings-currency">Display currency</label>
          <div className="as-text-input-box">
            <select
              id="settings-currency"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {DISPLAY_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} style={{ background: "#25282e", color: "#fff" }}>
                  {c.code} · {c.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.45)", marginTop: "4px", lineHeight: 1.4 }}>
            Balances are shown in this currency using live exchange rates. Your account itself is held in US dollars.
            {rateNote ? ` ${rateNote}` : ""}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "14px 16px",
            borderRadius: "8px",
            backgroundColor: "#25282e",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            marginTop: "6px",
          }}
        >
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#fff" }}>Hide balances</div>
            <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>
              Show ****** instead of amounts
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hideBalance}
            onClick={onToggleHideBalance}
            className="app-switch"
            data-on={hideBalance ? "true" : "false"}
          >
            <span />
          </button>
        </div>
      </div>
    </div>
  );
}
