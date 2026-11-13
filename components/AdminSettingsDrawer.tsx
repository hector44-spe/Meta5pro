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
} from "lucide-react";
import "@/styles/app-forms.css";
import "@/styles/admin-settings.css";

type View =
  | "menu"
  | "general"
  | "deposit"
  | "withdrawal"
  | "add-crypto"
  | "interface"
  | "copy-experts"
  | "mining"
  | "referrals"
  | "cards"
  | "levels"
  | "developer";

const MENU: { id: Exclude<View, "menu">; title: string; subtitle: string; icon: React.ReactNode }[] = [
  { id: "general", title: "General", subtitle: "Manage general admin settings", icon: <SettingsIcon size={18} /> },
  { id: "deposit", title: "Deposit", subtitle: "Manage deposit settings", icon: <CirclePlus size={18} /> },
  { id: "withdrawal", title: "Withdrawal", subtitle: "Manage withdrawal settings", icon: <CircleMinus size={18} /> },
  { id: "add-crypto", title: "Add crypto", subtitle: "Add crypto to the platform", icon: <Coins size={18} /> },
  { id: "interface", title: "Interface", subtitle: "Manage interface settings", icon: <Palette size={18} /> },
  { id: "copy-experts", title: "Copy Experts", subtitle: "Manage copy expert settings", icon: <Copy size={18} /> },
  { id: "mining", title: "Mining", subtitle: "Manage mining settings", icon: <Pickaxe size={18} /> },
  { id: "referrals", title: "Referrals", subtitle: "Manage referral settings", icon: <Users size={18} /> },
  { id: "cards", title: "Cards", subtitle: "Manage card settings", icon: <CreditCard size={18} /> },
  { id: "levels", title: "Levels", subtitle: "Manage levels", icon: <Crown size={18} /> },
  { id: "developer", title: "Developer", subtitle: "Manage developer settings", icon: <Code size={18} /> },
];

const TITLES: Record<View, string> = {
  menu: "Settings",
  general: "General Settings",
  deposit: "Deposit Settings",
  withdrawal: "Withdrawal Settings",
  "add-crypto": "Add Crypto",
  interface: "Interface Settings",
  "copy-experts": "Copy Expert Settings",
  mining: "Mining Settings",
  referrals: "Referral Settings",
  cards: "Card Settings",
  levels: "Levels",
  developer: "Developer Settings",
};

export default function AdminSettingsDrawer({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const [view, setView] = useState<View>("menu");

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
              <div className="as-menu">
                {MENU.map((item) => (
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

          {view === "general" && <GeneralSettings />}

          {view === "deposit" && (
            <ReviewLink
              text="Review and approve incoming deposits, and manage the wallet addresses investors pay into."
              links={[
                { label: "Open deposit reviews", href: "/admin?section=deposits" },
                { label: "Manage deposit addresses", href: "/admin?section=addresses" },
              ]}
            />
          )}

          {view === "withdrawal" && (
            <ReviewLink
              text="Review withdrawal requests. Funds stay on hold until you approve or reject them."
              links={[{ label: "Open withdrawal reviews", href: "/admin?section=withdrawals" }]}
            />
          )}

          {!["menu", "general", "deposit", "withdrawal"].includes(view) && (
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
        if (d.settings) {
          setValues(d.settings);
          setSaved(d.settings);
        } else {
          setNotice({ kind: "error", text: d.error || "Could not load settings" });
        }
      })
      .catch(() => setNotice({ kind: "error", text: "Could not load settings" }))
      .finally(() => setLoading(false));
  }, []);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const save = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/app-settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed");
      setSaved(d.settings);
      setValues(d.settings);
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
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="as-form">
      <Toggle
        label="Lock verification"
        description="Users have to verify to use their accounts"
        checked={values.lockVerification}
        onChange={(v) => setValues((s) => ({ ...s, lockVerification: v }))}
      />
      <Toggle
        label="Allow regular card"
        description="Allow users pay with regular card"
        checked={values.allowRegularCard}
        onChange={(v) => setValues((s) => ({ ...s, allowRegularCard: v }))}
      />
      <Toggle
        label="Allow virtual card"
        description="Allow users pay with virtual card"
        checked={values.allowVirtualCard}
        onChange={(v) => setValues((s) => ({ ...s, allowVirtualCard: v }))}
      />

      {notice && (
        <div className={`as-notice ${notice.kind === "ok" ? "ok" : "err"}`} role="status">
          {notice.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {notice.text}
        </div>
      )}

      <button type="button" className="as-save" onClick={save} disabled={busy || !dirty}>
        {busy && <Loader2 size={16} className="animate-spin" />}
        Save
      </button>
    </div>
  );
}
