"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, Copy, Check } from "lucide-react";
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
        alignItems: "flex-start",
        fontSize: "12.5px",
        color: ok ? "#01b28b" : "#ff5c6a",
      }}
    >
      {ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
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
    <form onSubmit={save} className="app-form" style={{ padding: "0 18px 80px 18px" }}>
      <div>
        <label className="app-label" htmlFor="settings-fullname">Full name</label>
        <input id="settings-fullname" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required className="app-input" />
      </div>
      <div>
        <label className="app-label" htmlFor="settings-email">Email address</label>
        <input id="settings-email" type="email" value={profile?.email ?? ""} disabled className="app-input" />
      </div>
      <div>
        <label className="app-label" htmlFor="settings-phone">Phone number</label>
        <input id="settings-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+1 555 000 0000" className="app-input" />
      </div>
      <div>
        <label className="app-label" htmlFor="settings-country">Country / region</label>
        <input id="settings-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country-name" placeholder="Country" className="app-input" />
      </div>
      {notice && <Notice kind={notice.kind} text={notice.text} />}
      <button type="submit" disabled={busy || !profile} className="app-primary-btn">
        {busy && <Loader2 size={15} className="animate-spin" />}
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

/** Security: change password; 2FA controls; shows that withdrawals are confirmed by an emailed code. */
export function SecuritySettings({ email }: { email: string | null }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
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
    <div className="app-form" style={{ padding: "0 18px 80px 18px" }}>
      <form onSubmit={change}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Change password</div>
        <div style={{ marginTop: "12px" }}>
          <label className="app-label" htmlFor="settings-current-pw">Current password</label>
          <input id="settings-current-pw" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required className="app-input" />
        </div>
        <div>
          <label className="app-label" htmlFor="settings-new-pw">New password</label>
          <input id="settings-new-pw" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" required className="app-input" />
        </div>
        <div>
          <label className="app-label" htmlFor="settings-confirm-pw">Confirm new password</label>
          <input id="settings-confirm-pw" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required className="app-input" />
        </div>
        {notice && <Notice kind={notice.kind} text={notice.text} />}
        <button type="submit" disabled={busy} className="app-primary-btn" style={{ marginTop: "12px" }}>
          {busy && <Loader2 size={15} className="animate-spin" />}
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>

      {/* Two-Factor Authentication Section */}
      <div style={{ marginTop: "28px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Two-Factor Authentication (2FA)</div>
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>
              Secure your account using Google Authenticator, Microsoft Authenticator, or 1Password.
            </div>
          </div>
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: twoFactorEnabled ? "rgba(1, 178, 139, 0.15)" : "rgba(255, 255, 255, 0.08)",
              color: twoFactorEnabled ? "#01b28b" : "#888",
            }}
          >
            {twoFactorEnabled ? "Active" : "Disabled"}
          </span>
        </div>

        {twoFactorNotice && (
          <div style={{ marginTop: "12px" }}>
            <Notice kind={twoFactorNotice.kind} text={twoFactorNotice.text} />
          </div>
        )}

        {setupStep === "idle" && (
          <div style={{ marginTop: "14px" }}>
            {twoFactorEnabled ? (
              <button
                type="button"
                onClick={disable2FA}
                disabled={twoFactorLoading}
                className="app-primary-btn"
                style={{ backgroundColor: "#ff5c6a", color: "#fff", borderColor: "#ff5c6a" }}
              >
                {twoFactorLoading ? <Loader2 size={15} className="animate-spin" /> : "Disable 2FA"}
              </button>
            ) : (
              <button
                type="button"
                onClick={start2FASetup}
                disabled={twoFactorLoading}
                className="app-primary-btn"
              >
                {twoFactorLoading ? <Loader2 size={15} className="animate-spin" /> : "Set up 2FA (Optional)"}
              </button>
            )}
          </div>
        )}

        {setupStep === "setup" && setupData && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
              1. Scan this QR Code with Authenticator App
            </div>
            <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setupData.qrCode}
                alt="2FA QR Code"
                style={{ width: "160px", height: "160px", borderRadius: "8px", background: "#fff", padding: "8px" }}
              />
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", textAlign: "center" }}>
              Or enter manual key:
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                margin: "6px 0 14px",
                fontSize: "12px",
                fontFamily: "monospace",
                color: "#f59e0b",
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
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
              >
                {copiedKey ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <form onSubmit={activate2FA}>
              <label className="app-label">2. Enter 6-digit verification code</label>
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
                }}
                className="app-input"
                required
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSetupStep("idle")}
                  className="app-primary-btn"
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={twoFactorLoading} className="app-primary-btn">
                  {twoFactorLoading ? <Loader2 size={15} className="animate-spin" /> : "Verify & Enable 2FA"}
                </button>
              </div>
            </form>
          </div>
        )}

        {setupStep === "backup_codes" && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
              Emergency Recovery Backup Codes
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "12px" }}>
              Save these one-time codes in a safe place. If you lose your phone, you can use these to sign in.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                fontFamily: "monospace",
                fontSize: "12px",
                marginBottom: "14px",
              }}
            >
              {backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "6px 10px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    textAlign: "center",
                    color: "#01b28b",
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
              className="app-primary-btn"
            >
              Done — I have saved my codes
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          padding: "12px 14px",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          marginTop: "24px",
        }}
      >
        <ShieldCheck size={18} color="#01b28b" style={{ flexShrink: 0, marginTop: "1px" }} />
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Withdrawal confirmation</div>
          <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px", lineHeight: 1.5 }}>
            Every withdrawal needs a one-time code sent to {email ?? "your email"}.
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
    <div className="app-form" style={{ padding: "0 18px 80px 18px" }}>
      <div>
        <label className="app-label" htmlFor="settings-language">Language</label>
        <select id="settings-language" className="app-input" value={langCode} onChange={(e) => onLanguageChange(e.target.value)}>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label} ({l.code.toUpperCase()})
            </option>
          ))}
        </select>
        <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.45)", marginTop: "6px" }}>
          The page reloads to apply a new language.
        </div>
      </div>

      <div>
        <label className="app-label" htmlFor="settings-currency">Display currency</label>
        <select id="settings-currency" className="app-input" value={currency} onChange={(e) => onCurrencyChange(e.target.value)}>
          {DISPLAY_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.label}
            </option>
          ))}
        </select>
        <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.45)", marginTop: "6px", lineHeight: 1.5 }}>
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
          padding: "12px 14px",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Hide balances</div>
          <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.5)" }}>Show ****** instead of amounts</div>
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
  );
}
