"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  X,
  Settings as SettingsIcon,
  CirclePlus,
  CircleMinus,
  Coins,
  Palette,
  Copy,
  Pickaxe,
  Users,
  CreditCard,
  Crown,
  Code,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  UserCheck,
  User,
  Key,
  Contact,
  ShieldCheck,
  SquarePen,
  Gem,
  Sparkles,
  Star,
} from "lucide-react";
import "@/styles/app-forms.css";
import "@/styles/admin-settings.css";
import DepositAddressSection from "@/app/(admin)/admin/sections/DepositAddressSection";
import {
  ProfileSettings,
  SecuritySettings,
  AccountSettings,
  DISPLAY_CURRENCIES,
  UserProfile,
} from "@/components/SettingsForms";
import { ALL_LANGUAGES, changeLanguage } from "@/lib/languages";

type View =
  | "menu"
  | "payments"
  | "verification"
  | "personal"
  | "security"
  | "account"
  | "general"
  | "deposit"
  | "withdrawal"
  | "copy-experts"
  | "mining"
  | "referrals"
  | "cards"
  | "levels"
  | "developer";

const ADMIN_MENU: { id: Exclude<View, "menu" | "payments" | "verification" | "personal" | "security" | "account">; title: string; subtitle: string; icon: React.ReactNode }[] = [
  { id: "general", title: "General", subtitle: "Manage general admin settings", icon: <SettingsIcon size={18} /> },
  { id: "deposit", title: "Deposit", subtitle: "Manage deposit settings", icon: <CirclePlus size={18} /> },
  { id: "withdrawal", title: "Withdrawal", subtitle: "Manage withdrawal settings", icon: <CircleMinus size={18} /> },
  { id: "copy-experts", title: "Copy Experts", subtitle: "Manage copy expert settings", icon: <Copy size={18} /> },
  { id: "mining", title: "Mining", subtitle: "Manage mining settings", icon: <Pickaxe size={18} /> },
  { id: "referrals", title: "Referrals", subtitle: "Manage referral settings", icon: <Users size={18} /> },
  { id: "cards", title: "Cards", subtitle: "Manage card settings", icon: <CreditCard size={18} /> },
  { id: "levels", title: "Levels", subtitle: "Manage levels", icon: <Crown size={18} /> },
  { id: "developer", title: "Developer", subtitle: "Manage developer settings", icon: <Code size={18} /> },
];

const TITLES: Record<View, string> = {
  menu: "Settings",
  payments: "Payments",
  verification: "Verification",
  personal: "Personal Information",
  security: "Security",
  account: "Account Settings",
  general: "General Settings",
  deposit: "Deposit Settings",
  withdrawal: "Withdrawal Settings",
  "copy-experts": "Copy Experts Settings",
  mining: "Mining Settings",
  referrals: "Referral Settings",
  cards: "Card Settings",
  levels: "Levels",
  developer: "Developer Settings",
};

export default function AdminSettingsDrawer({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const [view, setView] = useState<View>("menu");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentLang, setCurrentLang] = useState("en");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile(d.profile);
      })
      .catch(() => null);

    try {
      const savedLang = localStorage.getItem("app_lang") || "en";
      setCurrentLang(savedLang);
      const savedCurr = localStorage.getItem("app_currency") || "USD";
      setCurrency(savedCurr);
    } catch {
      /* ignore */
    }
  }, []);

  const handleLanguageChange = (code: string) => {
    setCurrentLang(code);
    changeLanguage(code);
    try {
      localStorage.setItem("app_lang", code);
    } catch {
      /* ignore */
    }
  };

  const handleCurrencyChange = (curr: string) => {
    setCurrency(curr);
    try {
      localStorage.setItem("app_currency", curr);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="as-backdrop" onClick={onClose}>
      <div className="as-panel settings-drawer-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={TITLES[view]}>
        <div className="as-header">
          <button
            type="button"
            className="as-back"
            onClick={() => (view === "menu" ? onClose() : setView("menu"))}
            aria-label={view === "menu" ? "Close settings" : "Back to settings"}
          >
            <ChevronLeft size={19} />
            <span>{TITLES[view]}</span>
          </button>
          <button type="button" className="as-close" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <div className="as-body">
          {view === "menu" && (
            <>
              {/* User Card at top (Image 1) */}
              <div className="as-user-header">
                <div className="as-user-avatar">
                  {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : "MG"}
                </div>
                <div className="as-user-info">
                  <div className="as-user-name">
                    <span>{profile?.fullName || "Meta Gold"}</span>
                    <CheckCircle2 size={15} color="#3b82f6" fill="#3b82f6" stroke="#ffffff" />
                  </div>
                  <div className="as-user-email">{profile?.email || "support@metagold5.com"}</div>
                </div>
              </div>

              {/* Payments Card (Image 1) */}
              <div className="as-menu">
                <button type="button" className="as-item" onClick={() => setView("payments")}>
                  <span className="as-item-icon">
                    <CreditCard size={18} />
                  </span>
                  <span className="as-item-text">
                    <span className="as-item-title">Payments</span>
                    <span className="as-item-sub">Deposit and Withdraw</span>
                  </span>
                </button>
              </div>

              {/* Profile Section (Image 1) */}
              <div className="as-category-title">Profile</div>
              <div className="as-menu">
                <button type="button" className="as-item" onClick={() => setView("verification")}>
                  <span className="as-item-icon">
                    <UserCheck size={18} />
                  </span>
                  <span className="as-item-text">
                    <span className="as-item-title">Verification</span>
                    <span className="as-item-sub">Verification and confirmation of identity</span>
                  </span>
                </button>
                <button type="button" className="as-item" onClick={() => setView("personal")}>
                  <span className="as-item-icon">
                    <User size={18} />
                  </span>
                  <span className="as-item-text">
                    <span className="as-item-title">Personal</span>
                    <span className="as-item-sub">Your personal information</span>
                  </span>
                </button>
                <button type="button" className="as-item" onClick={() => setView("security")}>
                  <span className="as-item-icon">
                    <Key size={18} />
                  </span>
                  <span className="as-item-text">
                    <span className="as-item-title">Security</span>
                    <span className="as-item-sub">Email, password and 2FA</span>
                  </span>
                </button>
              </div>

              {/* Setup Section (Image 1) */}
              <div className="as-category-title">Setup</div>
              <div className="as-menu">
                <button type="button" className="as-item" onClick={() => setView("account")}>
                  <span className="as-item-icon">
                    <Contact size={18} />
                  </span>
                  <span className="as-item-text">
                    <span className="as-item-title">Account</span>
                    <span className="as-item-sub">Language, currency and account</span>
                  </span>
                </button>
              </div>

              {/* Admin Section (Image 1) */}
              <div className="as-category-title">Admin</div>
              <div className="as-menu">
                {ADMIN_MENU.map((item) => (
                  <button key={item.id} type="button" className="as-item" onClick={() => setView(item.id)}>
                    <span className="as-item-icon">{item.icon}</span>
                    <span className="as-item-text">
                      <span className="as-item-title">{item.title}</span>
                      <span className="as-item-sub">{item.subtitle}</span>
                    </span>
                  </button>
                ))}
              </div>

              <button type="button" className="as-item as-logout" onClick={onLogout}>
                <span className="as-item-icon">
                  <LogOut size={18} />
                </span>
                <span className="as-item-title">Logout</span>
              </button>
            </>
          )}

          {/* Subview: Payments */}
          {view === "payments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: 8 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Payment options</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <a
                  href="/admin?section=deposits"
                  style={{
                    padding: "16px 14px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(1, 178, 139, 0.15)",
                    border: "1px solid rgba(1, 178, 139, 0.3)",
                    color: "#01b28b",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                  }}
                >
                  <CirclePlus size={22} />
                  <span>Deposits</span>
                </a>
                <a
                  href="/admin?section=withdrawals"
                  style={{
                    padding: "16px 14px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                  }}
                >
                  <CircleMinus size={22} />
                  <span>Withdrawals</span>
                </a>
              </div>
            </div>
          )}

          {/* Subview: Verification */}
          {view === "verification" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: 8 }}>
              <div
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(1, 178, 139, 0.1)",
                  border: "1px solid rgba(1, 178, 139, 0.25)",
                }}
              >
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#01b28b" }}>
                  Identity verification (KYC)
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>
                  Admin accounts possess verified operational access. You can review user verification documents under the Users section.
                </div>
              </div>
            </div>
          )}

          {/* Subview: Personal */}
          {view === "personal" && <ProfileSettings profile={profile} onSaved={setProfile} />}

          {/* Subview: Security */}
          {view === "security" && <SecuritySettings email={profile?.email ?? null} />}

          {/* Subview: Account */}
          {view === "account" && (
            <AccountSettings
              languages={ALL_LANGUAGES}
              langCode={currentLang}
              onLanguageChange={handleLanguageChange}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              hideBalance={false}
              onToggleHideBalance={() => {}}
              rateNote={null}
            />
          )}

          {/* Subview: General Admin Settings */}
          {view === "general" && <GeneralSettings />}

          {/* Subview: Deposit Settings (Image 1) */}
          {view === "deposit" && <DepositSettingsView />}

          {/* Subview: Withdrawal Settings (Image 2) */}
          {view === "withdrawal" && <WithdrawalSettingsView />}

          {/* Subview: Copy Experts Settings (Image 3) */}
          {view === "copy-experts" && <CopyExpertsSettingsView />}

          {/* Subview: Mining Settings (Image 5) */}
          {view === "mining" && <MiningSettingsView />}

          {!["menu", "payments", "verification", "personal", "security", "account", "general", "deposit", "withdrawal", "copy-experts", "mining"].includes(view) && (
            <div className="as-placeholder">
              <p>This section isn&apos;t set up yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Deposit Settings (Image 1) */
function DepositSettingsView() {
  const [minDeposit, setMinDeposit] = useState(100);
  const [maxDeposit, setMaxDeposit] = useState(100000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/app-settings/deposit", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const s = d?.settings || d?.value;
        if (s) {
          if (typeof s.minDeposit === "number") setMinDeposit(s.minDeposit);
          if (typeof s.maxDeposit === "number") setMaxDeposit(s.maxDeposit);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/app-settings/deposit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minDeposit: Number(minDeposit) || 0,
          maxDeposit: Number(maxDeposit) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save deposit settings");
      setNotice({ kind: "ok", text: "Deposit settings saved successfully." });
    } catch (e: any) {
      setNotice({ kind: "error", text: e.message || "Failed to save deposit settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="as-placeholder">
        <Loader2 size={18} className="spin" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
      <div className="as-section-block">
        <h3 className="as-block-title">Deposit Limits</h3>
        <p className="as-block-sub">Set minimum and maximum deposit amounts</p>

        <div className="as-input-wrap">
          <label className="as-label">Minimum Deposit:</label>
          <div className="as-currency-input-box">
            <input
              type="number"
              value={minDeposit}
              onChange={(e) => setMinDeposit(Number(e.target.value))}
            />
            <span className="as-currency-badge">USD</span>
          </div>
        </div>

        <div className="as-input-wrap">
          <label className="as-label">Maximum Deposit:</label>
          <div className="as-currency-input-box">
            <input
              type="number"
              value={maxDeposit}
              onChange={(e) => setMaxDeposit(Number(e.target.value))}
            />
            <span className="as-currency-badge">USD</span>
          </div>
        </div>

        {notice && (
          <div className={`as-notice ${notice.kind}`} style={{ marginTop: "4px" }}>
            {notice.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{notice.text}</span>
          </div>
        )}

        <button
          type="button"
          className="as-primary-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 size={16} className="spin" />}
          Save deposit settings
        </button>
      </div>

      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px" }}>
        <DepositAddressSection
          flash={(k, t) => console.log(k, t)}
          isDrawerMode={true}
        />
      </div>
    </div>
  );
}

/** Withdrawal Settings (Image 2) */
function WithdrawalSettingsView() {
  const [minWithdrawal, setMinWithdrawal] = useState(10);
  const [maxWithdrawal, setMaxWithdrawal] = useState(1000000);
  const [useWithdrawalCode, setUseWithdrawalCode] = useState(true);
  const [allowCrypto, setAllowCrypto] = useState(true);
  const [showAssetsModal, setShowAssetsModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/app-settings/withdrawal", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const s = d?.settings || d?.value;
        if (s) {
          if (typeof s.minWithdrawal === "number") setMinWithdrawal(s.minWithdrawal);
          if (typeof s.maxWithdrawal === "number") setMaxWithdrawal(s.maxWithdrawal);
          if (typeof s.useWithdrawalCode === "boolean") setUseWithdrawalCode(s.useWithdrawalCode);
          if (typeof s.allowCrypto === "boolean") setAllowCrypto(s.allowCrypto);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/app-settings/withdrawal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minWithdrawal: Number(minWithdrawal) || 0,
          maxWithdrawal: Number(maxWithdrawal) || 0,
          useWithdrawalCode,
          allowCrypto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save withdrawal settings");
      setNotice({ kind: "ok", text: "Withdrawal settings saved successfully." });
    } catch (e: any) {
      setNotice({ kind: "error", text: e.message || "Failed to save withdrawal settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="as-placeholder">
        <Loader2 size={18} className="spin" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
      {/* Withdrawal Limits */}
      <div className="as-section-block">
        <h3 className="as-block-title">Withdrawal Limits</h3>
        <p className="as-block-sub">Set minimum and maximum withdrawal amounts</p>

        <div className="as-input-wrap">
          <label className="as-label">Minimum Withdrawal:</label>
          <div className="as-currency-input-box">
            <input
              type="number"
              value={minWithdrawal}
              onChange={(e) => setMinWithdrawal(Number(e.target.value))}
            />
            <span className="as-currency-badge">USD</span>
          </div>
        </div>

        <div className="as-input-wrap">
          <label className="as-label">Maximum Withdrawal:</label>
          <div className="as-currency-input-box">
            <input
              type="number"
              value={maxWithdrawal}
              onChange={(e) => setMaxWithdrawal(Number(e.target.value))}
            />
            <span className="as-currency-badge">USD</span>
          </div>
        </div>
      </div>

      {/* Withdrawal code */}
      <div className="as-section-block">
        <h3 className="as-block-title">Withdrawal code</h3>
        <p className="as-block-sub">
          The default withdrawal code is 123456. You can set a user&apos;s withdrawal code from your admin or manage tab.
        </p>

        <div className="as-toggle-card">
          <span className="as-toggle-card-title">Use withdrawal code for withdrawals</span>
          <button
            type="button"
            role="switch"
            aria-checked={useWithdrawalCode}
            aria-label="Use withdrawal code for withdrawals"
            className="app-switch"
            data-on={useWithdrawalCode ? "true" : "false"}
            onClick={() => setUseWithdrawalCode(!useWithdrawalCode)}
          >
            <span />
          </button>
        </div>
      </div>

      {/* Withdrawal methods */}
      <div className="as-section-block" style={{ marginBottom: "10px" }}>
        <h3 className="as-block-title">Withdrawal methods</h3>

        <div className="as-toggle-card" style={{ marginTop: "10px" }}>
          <div className="as-toggle-card-left">
            <span className="as-toggle-card-title">Crypto</span>
            <span className="as-toggle-card-sub">Allow users withdraw cryptocurrencies</span>
          </div>
          <div className="as-toggle-card-right">
            <span
              className="as-blue-link"
              onClick={() => setShowAssetsModal(!showAssetsModal)}
            >
              {showAssetsModal ? "Hide assets" : "Show assets"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={allowCrypto}
              aria-label="Allow users withdraw cryptocurrencies"
              className="app-switch"
              data-on={allowCrypto ? "true" : "false"}
              onClick={() => setAllowCrypto(!allowCrypto)}
            >
              <span />
            </button>
          </div>
        </div>

        {showAssetsModal && (
          <div
            style={{
              padding: "12px 14px",
              background: "#1e2126",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              fontSize: "12.5px",
              color: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontWeight: 600, color: "#fff" }}>Supported Withdrawal Assets:</div>
            <div>• BTC (Bitcoin)</div>
            <div>• ETH (ERC-20)</div>
            <div>• USDT (TRC-20, BEP-20, ERC-20)</div>
            <div>• USDC (ERC-20, BEP-20, Solana)</div>
            <div>• SOL (Solana)</div>
            <div>• XRP (Ripple)</div>
          </div>
        )}
      </div>

      {notice && (
        <div className={`as-notice ${notice.kind}`} style={{ marginTop: "-6px" }}>
          {notice.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Save button underneath */}
      <button
        type="button"
        className="as-primary-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving && <Loader2 size={16} className="spin" />}
        Save
      </button>
    </div>
  );
}

/** Copy Experts Settings (Image 3) */
function CopyExpertsSettingsView() {
  const [lockCopyExpertsPage, setLockCopyExpertsPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/app-settings/copyExperts", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const s = d?.settings || d?.value;
        if (s && typeof s.lockCopyExpertsPage === "boolean") {
          setLockCopyExpertsPage(s.lockCopyExpertsPage);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/app-settings/copyExperts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockCopyExpertsPage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setNotice({ kind: "ok", text: "Copy expert settings saved." });
    } catch (e: any) {
      setNotice({ kind: "error", text: e.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="as-placeholder">
        <Loader2 size={18} className="spin" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
      <div className="as-section-block">
        <h3 className="as-block-title">Copy expert settings</h3>
        <p className="as-block-sub">Manage your copy expert settings, edit amount and address</p>

        <div className="as-toggle-card">
          <span className="as-toggle-card-title">Lock copy experts page</span>
          <button
            type="button"
            role="switch"
            aria-checked={lockCopyExpertsPage}
            aria-label="Lock copy experts page"
            className="app-switch"
            data-on={lockCopyExpertsPage ? "true" : "false"}
            onClick={() => setLockCopyExpertsPage(!lockCopyExpertsPage)}
          >
            <span />
          </button>
        </div>

        {notice && (
          <div className={`as-notice ${notice.kind}`} style={{ marginTop: "4px" }}>
            {notice.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{notice.text}</span>
          </div>
        )}

        <button
          type="button"
          className="as-primary-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 size={16} className="spin" />}
          Save
        </button>
      </div>
    </div>
  );
}

/** Mining Settings (Image 5) */
function MiningSettingsView() {
  const [useMinerPictures, setUseMinerPictures] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/app-settings/mining", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const s = d?.settings || d?.value;
        if (s && typeof s.useMinerPictures === "boolean") {
          setUseMinerPictures(s.useMinerPictures);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/app-settings/mining", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useMinerPictures }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setNotice({ kind: "ok", text: "Mining settings saved." });
    } catch (e: any) {
      setNotice({ kind: "error", text: e.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="as-placeholder">
        <Loader2 size={18} className="spin" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
      <div className="as-section-block">
        <h3 className="as-block-title">Mining settings</h3>
        <p className="as-block-sub">Edit mining settings</p>

        <div style={{ marginTop: "12px", marginBottom: "8px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
            Use Miner Pictures
          </div>
          <div style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.55)", lineHeight: 1.4, marginBottom: "12px" }}>
            (A random picture will be displayed for each miner if you haven&apos;t selected one yet)
          </div>

          <div className="as-toggle-card">
            <span className="as-toggle-card-title">Use miner pictures</span>
            <button
              type="button"
              role="switch"
              aria-checked={useMinerPictures}
              aria-label="Use miner pictures"
              className="app-switch"
              data-on={useMinerPictures ? "true" : "false"}
              onClick={() => setUseMinerPictures(!useMinerPictures)}
            >
              <span />
            </button>
          </div>
        </div>

        {notice && (
          <div className={`as-notice ${notice.kind}`} style={{ marginTop: "4px" }}>
            {notice.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{notice.text}</span>
          </div>
        )}

        <button
          type="button"
          className="as-primary-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 size={16} className="spin" />}
          Save
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ReviewLink({ text, links }: { text: string; links: { label: string; href: string }[] }) {
  return (
    <div className="as-review">
      <p>{text}</p>
      {links.map((l) => (
        <a key={l.href} href={l.href} className="as-link-card">
          <span>{l.label}</span>
          <ExternalLink size={16} />
        </a>
      ))}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="as-field">
      <div className="as-field-label">{label}</div>
      <div className="as-toggle-row">
        <span>{description}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          className="app-switch"
          data-on={checked ? "true" : "false"}
          onClick={() => onChange(!checked)}
        >
          <span />
        </button>
      </div>
    </div>
  );
}

function GeneralSettings() {
  const [values, setValues] = useState({ lockVerification: false, allowRegularCard: false, allowVirtualCard: false });
  const [saved, setSaved] = useState(values);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/app-settings/general", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.value) {
          const v = {
            lockVerification: !!d.value.lockVerification,
            allowRegularCard: !!d.value.allowRegularCard,
            allowVirtualCard: !!d.value.allowVirtualCard,
          };
          setValues(v);
          setSaved(v);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const dirty =
    values.lockVerification !== saved.lockVerification ||
    values.allowRegularCard !== saved.allowRegularCard ||
    values.allowVirtualCard !== saved.allowVirtualCard;

  const save = async () => {
    if (!dirty || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/app-settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(values);
      setNotice({ kind: "ok", text: "Settings saved." });
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="as-placeholder">
        <Loader2 size={18} className="spin" />
      </div>
    );
  }

  return (
    <div className="as-form">
      <Toggle
        label="Lock Verification"
        description="Prevent users from changing verification status once submitted"
        checked={values.lockVerification}
        onChange={(v) => setValues((s) => ({ ...s, lockVerification: v }))}
      />
      <Toggle
        label="Regular Card Option"
        description="Allow users to request standard crypto cards"
        checked={values.allowRegularCard}
        onChange={(v) => setValues((s) => ({ ...s, allowRegularCard: v }))}
      />
      <Toggle
        label="Virtual Card Option"
        description="Allow users to create virtual instant cards"
        checked={values.allowVirtualCard}
        onChange={(v) => setValues((s) => ({ ...s, allowVirtualCard: v }))}
      />

      {notice && (
        <div className={`as-notice ${notice.kind}`}>
          {notice.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{notice.text}</span>
        </div>
      )}

      <button type="button" className="as-save" disabled={!dirty || busy} onClick={save}>
        {busy ? <Loader2 size={16} className="spin" /> : null}
        Save Changes
      </button>
    </div>
  );
}
