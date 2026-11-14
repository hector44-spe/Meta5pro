"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ListOrdered,
  Users,
  Wallet,
  LogOut,
  RefreshCw,
  Menu,
  X,
  Check,
  Search,
  Eye,
  Save,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserX,
  UserCheck,
  DollarSign,
  ExternalLink,
  Loader2,
  RotateCcw,
  Wrench,
  TrendingUp,
  Radio,
  CreditCard,
  Layers,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import styles from "./page.module.css";
import AdminSettingsDrawer from "@/components/AdminSettingsDrawer";
import ExpertsSection from "./sections/ExpertsSection";
import TradesSection from "./sections/TradesSection";
import SignalsSection from "./sections/SignalsSection";
import CardRequestsSection from "./sections/CardRequestsSection";
import CardsSection from "./sections/CardsSection";
import SubscriptionsSection from "./sections/SubscriptionsSection";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface AdminTx {
  id: string;
  userId: string;
  userEmail: string | null;
  userFullName: string | null;
  type: string;
  amount: number;
  currency: string;
  cryptoAddress: string | null;
  txHash: string | null;
  receiptUrl: string | null;
  assetSymbol?: string | null;
  assetAmount?: number | null;
  status: string;
  createdAt: string;
}

interface AddressItem {
  id: string;
  token: string;
  symbol: string;
  network: string;
  address: string;
  memo: string | null;
}

interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: string;
  status: string;
  createdAt: string;
  mainBalance: number;
  interestBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

type Section =
  | "overview"
  | "deposits"
  | "withdrawals"
  | "users"
  | "experts"
  | "trades"
  | "signals"
  | "card-requests"
  | "cards"
  | "subscriptions"
  | "addresses"
  | "transactions";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const usd = (n: number) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const coins = (t: { assetSymbol?: string | null; assetAmount?: number | null }) =>
  t.assetSymbol && t.assetAmount ? `${Number(Number(t.assetAmount).toFixed(8))} ${t.assetSymbol}` : null;

const shortId = (id: string) => id.replace(/^tx_/, "").slice(0, 8).toUpperCase();

const typeLabel = (t: string) =>
  ({
    DEPOSIT: "Deposit",
    WITHDRAWAL: "Withdrawal",
    INVESTMENT_SUBSCRIBE: "Plan subscription",
    TRADE_BUY: "Trade (buy)",
    TRADE_SELL: "Trade (sell)",
    TRADE_CONVERT: "Trade (convert)",
    TRADE_CLOSE: "Trade closed",
  })[t] ?? t;

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "APPROVED" || status === "ACTIVE"
      ? styles.pillGreen
      : status === "PENDING"
        ? styles.pillAmber
        : styles.pillRed;
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`${styles.pill} ${cls}`}>{label}</span>;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [section, setSection] = useState<Section>("overview");

  // Deep links from the dashboard's admin Settings drawer, e.g. /admin?section=deposits
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("section");
    if (
      s &&
      [
        "overview",
        "deposits",
        "withdrawals",
        "users",
        "experts",
        "trades",
        "signals",
        "card-requests",
        "cards",
        "subscriptions",
        "addresses",
        "transactions",
      ].includes(s)
    ) {
      setSection(s as Section);
    }
  }, []);
  const [navOpen, setNavOpen] = useState(false);
  const [manageDrawerOpen, setManageDrawerOpen] = useState(false);

  const [transactions, setTransactions] = useState<AdminTx[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  // Approve / reject confirmation
  const [confirmTx, setConfirmTx] = useState<{ tx: AdminTx; action: "approve" | "reject" } | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  // Proof preview
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const flash = useCallback((kind: "ok" | "error", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, userRes, addrRes, meRes] = await Promise.all([
        fetch("/api/admin/transactions"),
        fetch("/api/admin/users"),
        fetch("/api/settings/addresses"),
        fetch("/api/auth/me"),
      ]);
      if (txRes.ok) setTransactions((await txRes.json()).transactions || []);
      if (userRes.ok) setUsers((await userRes.json()).users || []);
      if (addrRes.ok) setAddresses((await addrRes.json()).addresses || []);
      if (meRes.ok) setAdminEmail((await meRes.json()).user?.email || "");
    } catch {
      flash("error", "Could not load data. Check your connection and refresh.");
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Close the mobile menu when switching sections
  const go = (s: Section) => {
    setSection(s);
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  };

  const pendingDeposits = transactions.filter((t) => t.type === "DEPOSIT" && t.status === "PENDING");
  const pendingWithdrawals = transactions.filter((t) => t.type === "WITHDRAWAL" && t.status === "PENDING");

  const runAction = async () => {
    if (!confirmTx) return;
    setActionBusy(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/transactions/${confirmTx.tx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: confirmTx.action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      flash("ok", `${typeLabel(confirmTx.tx.type)} ${confirmTx.action === "approve" ? "approved" : "rejected"}.`);
      setConfirmTx(null);
      await loadAll();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const nav: { id: Section; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "deposits", label: "Deposits", icon: <ArrowDownToLine size={18} />, count: pendingDeposits.length },
    { id: "withdrawals", label: "Withdrawals", icon: <ArrowUpFromLine size={18} />, count: pendingWithdrawals.length },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "experts", label: "Experts", icon: <UserCheck size={18} /> },
    { id: "trades", label: "Trades", icon: <TrendingUp size={18} /> },
    { id: "signals", label: "Signals", icon: <Radio size={18} /> },
    { id: "card-requests", label: "Card requests", icon: <CreditCard size={18} /> },
    { id: "cards", label: "Cards", icon: <Layers size={18} /> },
    { id: "subscriptions", label: "Subscription", icon: <Sparkles size={18} /> },
    { id: "addresses", label: "Deposit addresses", icon: <Wallet size={18} /> },
  ];

  const titles: Record<Section, [string, string]> = {
    overview: ["Overview", "What needs your attention right now."],
    deposits: ["Deposits", "Check each payment on the blockchain or in the proof, then approve or reject it."],
    withdrawals: ["Withdrawals", "Funds are on hold until you approve (send the crypto) or reject (refund the balance)."],
    users: ["Users", "Find an account, adjust its balance, or suspend access."],
    experts: ["Experts", "Users who paid/subscribed to copy trading experts."],
    trades: ["Trades", "Live and closed trades placed by platform users."],
    signals: ["Signals", "Users who purchased trading signals and available signal packages."],
    "card-requests": ["Card Requests", "Users who requested and paid issuance fees for crypto cards."],
    cards: ["Cards", "Manage card types, issuance fees, and eligibility requirements."],
    subscriptions: ["Subscription", "Users subscribed to investment plans and plan settings."],
    addresses: ["Deposit addresses", "The wallets investors pay into. Each one saves on its own."],
    transactions: ["All transactions", "Every deposit, withdrawal, subscription and trade, newest first."],
  };

  return (
    <div className={styles.shell}>
      {/* ---------------- Sidebar ---------------- */}
      <aside className={`${styles.sidebar} ${navOpen ? styles.sidebarOpen : ""}`} aria-label="Admin navigation">
        <div className={styles.brand}>
          <ShieldCheck size={22} />
          <div>
            <div className={styles.brandTitle}>Admin</div>
            <div className={styles.brandSub}>Control panel</div>
          </div>
          <button type="button" className={styles.navClose} onClick={() => setNavOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${section === item.id ? styles.navItemActive : ""}`}
              onClick={() => {
                setManageDrawerOpen(false);
                go(item.id);
              }}
              aria-current={section === item.id ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
              {!!item.count && <span className={styles.navCount}>{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/dashboard" className={styles.backToPanelBtn}>
            <ArrowLeft size={16} />
            <span>Back to Panel</span>
          </Link>
          <div className={styles.adminWho} title={adminEmail}>
            <div className={styles.adminAvatar}>{(adminEmail[0] || "A").toUpperCase()}</div>
            <span>{adminEmail || "Administrator"}</span>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
      {navOpen && <div className={styles.scrim} onClick={() => setNavOpen(false)} />}

      {/* ---------------- Main ---------------- */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button type="button" className={styles.menuBtn} onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className={styles.pageTitles}>
            <h1>{titles[section][0]}</h1>
            <p>{titles[section][1]}</p>
          </div>
          <Link href="/dashboard" className={styles.topbarBackBtn} title="Return to Client Dashboard">
            <ArrowLeft size={15} />
            <span className={styles.hideSm}>Back to Panel</span>
          </Link>
          <button type="button" className={styles.btnGhost} onClick={loadAll} disabled={loading}>
            <RefreshCw size={15} className={loading ? styles.spin : ""} />
            <span className={styles.hideSm}>Refresh</span>
          </button>
        </header>

        {section === "overview" && (
          <Overview
            transactions={transactions}
            users={users}
            pendingDeposits={pendingDeposits}
            pendingWithdrawals={pendingWithdrawals}
            onReview={(tx, action) => setConfirmTx({ tx, action })}
            onGo={go}
            onPreview={setPreviewProofUrl}
          />
        )}

        {section === "deposits" && (
          <TxSection
            pending={pendingDeposits}
            history={transactions.filter((t) => t.type === "DEPOSIT" && t.status !== "PENDING")}
            kind="deposit"
            onReview={(tx, action) => setConfirmTx({ tx, action })}
            onPreview={setPreviewProofUrl}
          />
        )}

        {section === "withdrawals" && (
          <TxSection
            pending={pendingWithdrawals}
            history={transactions.filter((t) => t.type === "WITHDRAWAL" && t.status !== "PENDING")}
            kind="withdrawal"
            onReview={(tx, action) => setConfirmTx({ tx, action })}
            onPreview={setPreviewProofUrl}
          />
        )}

        {section === "transactions" && <AllTransactions transactions={transactions} onPreview={setPreviewProofUrl} />}

        {section === "users" && <UsersSection users={users} onChanged={loadAll} flash={flash} />}

        {section === "experts" && <ExpertsSection flash={flash} />}

        {section === "trades" && <TradesSection users={users} flash={flash} />}

        {section === "signals" && <SignalsSection flash={flash} />}

        {section === "card-requests" && <CardRequestsSection flash={flash} />}

        {section === "cards" && <CardsSection flash={flash} />}

        {section === "subscriptions" && <SubscriptionsSection flash={flash} />}

        {section === "addresses" && (
          <AddressesSection
            addresses={addresses}
            onSaved={(a) => setAddresses((prev) => prev.map((x) => (x.id === a.id ? a : x)))}
            flash={flash}
          />
        )}
      </main>

      {/* ---------------- Approve / reject confirmation ---------------- */}
      {confirmTx && (
        <div className={styles.modalBackdrop} onClick={() => !actionBusy && setConfirmTx(null)}>
          <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>
                {confirmTx.action === "approve" ? "Approve" : "Reject"} {typeLabel(confirmTx.tx.type).toLowerCase()}?
              </h2>
              <button type="button" className={styles.iconBtn} onClick={() => setConfirmTx(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <dl className={styles.detailList}>
              <dt>User</dt>
              <dd>{confirmTx.tx.userEmail}</dd>
              <dt>Amount</dt>
              <dd className={styles.mono}>
                {coins(confirmTx.tx) ? `${coins(confirmTx.tx)} (${usd(confirmTx.tx.amount)})` : usd(confirmTx.tx.amount)}
              </dd>
              <dt>Asset</dt>
              <dd>{confirmTx.tx.currency}</dd>
              {confirmTx.tx.cryptoAddress && (
                <>
                  <dt>{confirmTx.tx.type === "WITHDRAWAL" ? "Send to" : "Paid to"}</dt>
                  <dd className={`${styles.mono} ${styles.breakAll}`}>{confirmTx.tx.cryptoAddress}</dd>
                </>
              )}
              {confirmTx.tx.txHash && !confirmTx.tx.txHash.startsWith("PROOF_") && (
                <>
                  <dt>Tx hash</dt>
                  <dd className={`${styles.mono} ${styles.breakAll}`}>{confirmTx.tx.txHash}</dd>
                </>
              )}
            </dl>
            <p className={styles.modalNote}>
              {confirmTx.tx.type === "DEPOSIT" && confirmTx.action === "approve" &&
                "Only approve after you've confirmed the payment arrived. The amount will be added to the user's balance."}
              {confirmTx.tx.type === "DEPOSIT" && confirmTx.action === "reject" &&
                "The deposit will be marked rejected. No balance changes."}
              {confirmTx.tx.type === "WITHDRAWAL" && confirmTx.action === "approve" &&
                "Approve once you have sent the crypto to the address above. The held funds are marked as withdrawn."}
              {confirmTx.tx.type === "WITHDRAWAL" && confirmTx.action === "reject" &&
                "The held amount will be returned to the user's balance."}
              {" "}The user gets an email either way.
            </p>
            {confirmTx.tx.receiptUrl && (
              <button type="button" className={styles.linkBtn} onClick={() => setPreviewProofUrl(confirmTx.tx.receiptUrl)}>
                <Eye size={15} /> View payment proof
              </button>
            )}
            {actionError && (
              <div className={styles.errorText}>
                <AlertCircle size={15} /> {actionError}
              </div>
            )}
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnGhost} onClick={() => setConfirmTx(null)} disabled={actionBusy}>
                Cancel
              </button>
              <button
                type="button"
                className={confirmTx.action === "approve" ? styles.btnSuccess : styles.btnDanger}
                onClick={runAction}
                disabled={actionBusy}
              >
                {actionBusy ? <Loader2 size={15} className={styles.spin} /> : confirmTx.action === "approve" ? <Check size={15} /> : <X size={15} />}
                {confirmTx.action === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Proof preview ---------------- */}
      {previewProofUrl && (
        <div className={styles.modalBackdrop} onClick={() => setPreviewProofUrl(null)}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Payment proof</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <a className={styles.iconBtn} href={previewProofUrl} target="_blank" rel="noreferrer" aria-label="Open in new tab">
                  <ExternalLink size={17} />
                </a>
                <button type="button" className={styles.iconBtn} onClick={() => setPreviewProofUrl(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewProofUrl} alt="Payment proof screenshot" className={styles.proofImg} />
          </div>
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.kind === "ok" ? styles.toastOk : styles.toastErr}`} role="status">
          {toast.kind === "ok" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          {toast.text}
        </div>
      )}

      {manageDrawerOpen && (
        <AdminSettingsDrawer
          onClose={() => setManageDrawerOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

function Overview({
  transactions,
  users,
  pendingDeposits,
  pendingWithdrawals,
  onReview,
  onGo,
  onPreview,
}: {
  transactions: AdminTx[];
  users: AdminUser[];
  pendingDeposits: AdminTx[];
  pendingWithdrawals: AdminTx[];
  onReview: (tx: AdminTx, action: "approve" | "reject") => void;
  onGo: (s: Section) => void;
  onPreview: (url: string) => void;
}) {
  const sum = (list: AdminTx[]) => list.reduce((a, t) => a + Number(t.amount), 0);
  const investors = users.filter((u) => u.role !== "ADMIN");
  const totalBalances = investors.reduce((a, u) => a + Number(u.mainBalance), 0);
  const waiting = [...pendingDeposits, ...pendingWithdrawals].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <>
      <div className={styles.stats}>
        <button type="button" className={styles.statCard} onClick={() => onGo("deposits")}>
          <span className={`${styles.statIcon} ${styles.iconGreen}`}><ArrowDownToLine size={18} /></span>
          <span className={styles.statLabel}>Deposits to review</span>
          <span className={styles.statValue}>{pendingDeposits.length}</span>
          <span className={styles.statSub}>{usd(sum(pendingDeposits))} waiting</span>
        </button>
        <button type="button" className={styles.statCard} onClick={() => onGo("withdrawals")}>
          <span className={`${styles.statIcon} ${styles.iconAmber}`}><ArrowUpFromLine size={18} /></span>
          <span className={styles.statLabel}>Withdrawals to review</span>
          <span className={styles.statValue}>{pendingWithdrawals.length}</span>
          <span className={styles.statSub}>{usd(sum(pendingWithdrawals))} on hold</span>
        </button>
        <button type="button" className={styles.statCard} onClick={() => onGo("users")}>
          <span className={`${styles.statIcon} ${styles.iconBlue}`}><Users size={18} /></span>
          <span className={styles.statLabel}>Investors</span>
          <span className={styles.statValue}>{investors.length}</span>
          <span className={styles.statSub}>{investors.filter((u) => u.status === "SUSPENDED").length} suspended</span>
        </button>
        <button type="button" className={styles.statCard} onClick={() => onGo("users")}>
          <span className={`${styles.statIcon} ${styles.iconPurple}`}><DollarSign size={18} /></span>
          <span className={styles.statLabel}>Investor balances</span>
          <span className={styles.statValue}>{usd(totalBalances)}</span>
          <span className={styles.statSub}>across all accounts</span>
        </button>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2><Clock size={17} /> Waiting for review</h2>
          <span className={styles.muted}>Oldest first</span>
        </div>
        {waiting.length === 0 ? (
          <Empty icon={<CheckCircle2 size={28} />} text="All caught up. Nothing is waiting for review." />
        ) : (
          <TxTable rows={waiting.slice(0, 8)} showType onReview={onReview} onPreview={onPreview} />
        )}
        {waiting.length > 8 && (
          <p className={styles.muted} style={{ marginTop: 12 }}>
            Showing 8 of {waiting.length}. Open Deposits or Withdrawals to see the rest.
          </p>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2><ListOrdered size={17} /> Recent activity</h2>
          <button type="button" className={styles.linkBtn} onClick={() => onGo("transactions")}>
            View all
          </button>
        </div>
        {transactions.length === 0 ? (
          <Empty icon={<ListOrdered size={28} />} text="No transactions yet." />
        ) : (
          <TxTable rows={transactions.slice(0, 6)} showType onPreview={onPreview} />
        )}
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Deposits / withdrawals                                              */
/* ------------------------------------------------------------------ */

function TxSection({
  pending,
  history,
  kind,
  onReview,
  onPreview,
}: {
  pending: AdminTx[];
  history: AdminTx[];
  kind: "deposit" | "withdrawal";
  onReview: (tx: AdminTx, action: "approve" | "reject") => void;
  onPreview: (url: string) => void;
}) {
  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2><Clock size={17} /> Waiting for review <span className={styles.countChip}>{pending.length}</span></h2>
        </div>
        {pending.length === 0 ? (
          <Empty icon={<CheckCircle2 size={28} />} text={`No ${kind}s waiting for review.`} />
        ) : (
          <TxTable rows={pending} onReview={onReview} onPreview={onPreview} />
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2><ListOrdered size={17} /> History</h2>
        </div>
        {history.length === 0 ? (
          <Empty icon={<ListOrdered size={28} />} text={`No processed ${kind}s yet.`} />
        ) : (
          <TxTable rows={history} onPreview={onPreview} />
        )}
      </section>
    </>
  );
}

function AllTransactions({ transactions, onPreview }: { transactions: AdminTx[]; onPreview: (url: string) => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (type === "all" || (type === "TRADE" ? t.type.startsWith("TRADE") : t.type === type)) &&
        (!s ||
          (t.userEmail || "").toLowerCase().includes(s) ||
          t.id.toLowerCase().includes(s) ||
          (t.txHash || "").toLowerCase().includes(s)),
    );
  }, [transactions, q, status, type]);

  return (
    <section className={styles.card}>
      <div className={styles.filters}>
        <label className={styles.searchBox}>
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email, reference or hash" />
        </label>
        <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="all">All types</option>
          <option value="DEPOSIT">Deposits</option>
          <option value="WITHDRAWAL">Withdrawals</option>
          <option value="INVESTMENT_SUBSCRIBE">Subscriptions</option>
          <option value="TRADE">Trades</option>
        </select>
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="all">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      {rows.length === 0 ? (
        <Empty icon={<Search size={28} />} text="No transactions match these filters." />
      ) : (
        <TxTable rows={rows} showType onPreview={onPreview} />
      )}
    </section>
  );
}

function TxTable({
  rows,
  showType,
  onReview,
  onPreview,
}: {
  rows: AdminTx[];
  showType?: boolean;
  onReview?: (tx: AdminTx, action: "approve" | "reject") => void;
  onPreview: (url: string) => void;
}) {
  return (
    <>
      <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Reference</th>
            <th>User</th>
            {showType && <th>Type</th>}
            <th className={styles.right}>Amount</th>
            <th>Asset</th>
            <th>Proof</th>
            <th>Date</th>
            <th>{onReview ? "" : "Status"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td className={styles.mono}>{shortId(t.id)}</td>
              <td>
                <div className={styles.userCell}>
                  <span>{t.userFullName || "—"}</span>
                  <small>{t.userEmail}</small>
                </div>
              </td>
              {showType && <td>{typeLabel(t.type)}</td>}
              <td className={`${styles.right} ${styles.mono} ${styles.strong}`}>{usd(t.amount)}</td>
              <td className={styles.muted}>
                {coins(t) ? (
                  <div className={styles.userCell}>
                    <span className={styles.mono}>{coins(t)}</span>
                    <small>{t.currency}</small>
                  </div>
                ) : (
                  t.currency
                )}
              </td>
              <td>
                {t.receiptUrl ? (
                  <button type="button" className={styles.linkBtn} onClick={() => onPreview(t.receiptUrl!)}>
                    <Eye size={14} /> View
                  </button>
                ) : t.txHash && !t.txHash.startsWith("PROOF_") && t.type === "DEPOSIT" ? (
                  <span className={`${styles.mono} ${styles.muted}`} title={t.txHash}>
                    {t.txHash.slice(0, 10)}…
                  </span>
                ) : (
                  <span className={styles.muted}>—</span>
                )}
              </td>
              <td className={styles.muted}>{when(t.createdAt)}</td>
              <td>
                {onReview && t.status === "PENDING" ? (
                  <div className={styles.rowActions}>
                    <button type="button" className={styles.btnSuccessSm} onClick={() => onReview(t, "approve")}>
                      <Check size={14} /> Approve
                    </button>
                    <button type="button" className={styles.btnDangerSm} onClick={() => onReview(t, "reject")}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                ) : (
                  <StatusPill status={t.status} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Phone layout: one card per transaction */}
      <ul className={styles.cardList}>
        {rows.map((t) => (
          <li key={t.id} className={styles.itemCard}>
            <div className={styles.itemTop}>
              <div className={styles.userCell}>
                <span>{t.userFullName || t.userEmail}</span>
                <small>{t.userEmail}</small>
              </div>
              <span className={`${styles.mono} ${styles.strong}`}>{usd(t.amount)}</span>
            </div>
            <div className={styles.itemMeta}>
              <span>{typeLabel(t.type)}</span>
              <span>{coins(t) ?? t.currency}</span>
              <span>{when(t.createdAt)}</span>
              <span className={styles.mono}>#{shortId(t.id)}</span>
            </div>
            <div className={styles.itemBottom}>
              {t.receiptUrl ? (
                <button type="button" className={styles.linkBtn} onClick={() => onPreview(t.receiptUrl!)}>
                  <Eye size={14} /> View proof
                </button>
              ) : (
                <span />
              )}
              {onReview && t.status === "PENDING" ? (
                <div className={styles.rowActions}>
                  <button type="button" className={styles.btnSuccessSm} onClick={() => onReview(t, "approve")}>
                    <Check size={14} /> Approve
                  </button>
                  <button type="button" className={styles.btnDangerSm} onClick={() => onReview(t, "reject")}>
                    <X size={14} /> Reject
                  </button>
                </div>
              ) : (
                <StatusPill status={t.status} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

function UsersSection({
  users,
  onChanged,
  flash,
}: {
  users: AdminUser[];
  onChanged: () => Promise<void>;
  flash: (k: "ok" | "error", t: string) => void;
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<"credit" | "debit">("credit");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [statusBusy, setStatusBusy] = useState<string | null>(null);

  const rows = users.filter((u) => {
    const s = q.trim().toLowerCase();
    return (
      !s ||
      u.email.toLowerCase().includes(s) ||
      (u.fullName || "").toLowerCase().includes(s) ||
      u.username.toLowerCase().includes(s)
    );
  });

  const openAdjust = (u: AdminUser) => {
    setSelected(u);
    setAmount("");
    setNote("");
    setAction("credit");
    setError("");
  };

  const submitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const n = parseFloat(amount);
    if (!n || n <= 0) return setError("Enter an amount greater than 0.");
    if (note.trim().length < 3) return setError("Add a short reason. It is saved in the audit log.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/balance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n, action, note: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Adjustment failed");
      flash("ok", data.message);
      setSelected(null);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjustment failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (u: AdminUser) => {
    const next = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (!window.confirm(`${next === "SUSPENDED" ? "Suspend" : "Reactivate"} ${u.email}?`)) return;
    setStatusBusy(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      flash("ok", `${u.email} is now ${next.toLowerCase()}.`);
      await onChanged();
    } catch (err) {
      flash("error", err instanceof Error ? err.message : "Update failed");
    } finally {
      setStatusBusy(null);
    }
  };

  return (
    <>
      <section className={styles.card}>
        <div className={styles.filters}>
          <label className={styles.searchBox}>
            <Search size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or username" />
          </label>
          <span className={styles.muted}>{rows.length} of {users.length}</span>
        </div>
        {rows.length === 0 ? (
          <Empty icon={<Users size={28} />} text="No users match your search." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className={styles.right}>Balance</th>
                  <th className={styles.right}>Deposited</th>
                  <th className={styles.right}>Withdrawn</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span>{u.fullName || u.username}</span>
                        <small>{u.email}</small>
                      </div>
                    </td>
                    <td>{u.role === "ADMIN" ? <span className={`${styles.pill} ${styles.pillBlue}`}>Admin</span> : "Investor"}</td>
                    <td><StatusPill status={u.status} /></td>
                    <td className={`${styles.right} ${styles.mono} ${styles.strong}`}>{usd(u.mainBalance)}</td>
                    <td className={`${styles.right} ${styles.mono} ${styles.muted}`}>{usd(u.totalDeposited)}</td>
                    <td className={`${styles.right} ${styles.mono} ${styles.muted}`}>{usd(u.totalWithdrawn)}</td>
                    <td className={styles.muted}>{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button type="button" className={styles.btnGhostSm} onClick={() => openAdjust(u)}>
                          <DollarSign size={14} /> Balance
                        </button>
                        {u.role !== "ADMIN" && (
                          <button
                            type="button"
                            className={u.status === "ACTIVE" ? styles.btnDangerSm : styles.btnSuccessSm}
                            onClick={() => toggleStatus(u)}
                            disabled={statusBusy === u.id}
                          >
                            {u.status === "ACTIVE" ? <UserX size={14} /> : <UserCheck size={14} />}
                            {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows.length > 0 && (
          <ul className={styles.cardList}>
            {rows.map((u) => (
              <li key={u.id} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div className={styles.userCell}>
                    <span>{u.fullName || u.username}</span>
                    <small>{u.email}</small>
                  </div>
                  <StatusPill status={u.status} />
                </div>
                <div className={styles.itemMeta}>
                  <span>{u.role === "ADMIN" ? "Admin" : "Investor"}</span>
                  <span>Balance <b className={styles.mono}>{usd(u.mainBalance)}</b></span>
                  <span>Deposited {usd(u.totalDeposited)}</span>
                </div>
                <div className={styles.itemBottom}>
                  <button type="button" className={styles.btnGhostSm} onClick={() => openAdjust(u)}>
                    <DollarSign size={14} /> Balance
                  </button>
                  {u.role !== "ADMIN" && (
                    <button
                      type="button"
                      className={u.status === "ACTIVE" ? styles.btnDangerSm : styles.btnSuccessSm}
                      onClick={() => toggleStatus(u)}
                      disabled={statusBusy === u.id}
                    >
                      {u.status === "ACTIVE" ? <UserX size={14} /> : <UserCheck size={14} />}
                      {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && (
        <div className={styles.modalBackdrop} onClick={() => !busy && setSelected(null)}>
          <form className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} onSubmit={submitAdjust}>
            <div className={styles.modalHead}>
              <h2>Adjust balance</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setSelected(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <dl className={styles.detailList}>
              <dt>User</dt>
              <dd>{selected.email}</dd>
              <dt>Current balance</dt>
              <dd className={styles.mono}>{usd(selected.mainBalance)}</dd>
            </dl>
            <div className={styles.segmented} role="radiogroup" aria-label="Adjustment type">
              <button type="button" role="radio" aria-checked={action === "credit"} className={action === "credit" ? styles.segActive : ""} onClick={() => setAction("credit")}>
                Add funds
              </button>
              <button type="button" role="radio" aria-checked={action === "debit"} className={action === "debit" ? styles.segActive : ""} onClick={() => setAction("debit")}>
                Remove funds
              </button>
            </div>
            <label className={styles.field}>
              <span>Amount (USD)</span>
              <input className={styles.input} type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus />
            </label>
            <label className={styles.field}>
              <span>Reason (saved in the audit log)</span>
              <input className={styles.input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Correction for deposit ABC123" maxLength={200} />
            </label>
            {error && (
              <div className={styles.errorText}>
                <AlertCircle size={15} /> {error}
              </div>
            )}
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnGhost} onClick={() => setSelected(null)} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className={action === "credit" ? styles.btnSuccess : styles.btnDanger} disabled={busy}>
                {busy && <Loader2 size={15} className={styles.spin} />}
                {action === "credit" ? "Add funds" : "Remove funds"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Deposit addresses: each card saves on its own                       */
/* ------------------------------------------------------------------ */

function AddressesSection({
  addresses,
  onSaved,
  flash,
}: {
  addresses: AddressItem[];
  onSaved: (a: AddressItem) => void;
  flash: (k: "ok" | "error", t: string) => void;
}) {
  if (addresses.length === 0) {
    return (
      <section className={styles.card}>
        <Empty icon={<Wallet size={28} />} text="No deposit addresses configured. Run the seed script to create them." />
      </section>
    );
  }
  return (
    <div className={styles.addrGrid}>
      {addresses.map((a) => (
        <AddressCard key={a.id} item={a} onSaved={onSaved} flash={flash} />
      ))}
    </div>
  );
}

function AddressCard({
  item,
  onSaved,
  flash,
}: {
  item: AddressItem;
  onSaved: (a: AddressItem) => void;
  flash: (k: "ok" | "error", t: string) => void;
}) {
  const [address, setAddress] = useState(item.address);
  const [memo, setMemo] = useState(item.memo ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Keep in sync if the list is refreshed from the server
  useEffect(() => {
    setAddress(item.address);
    setMemo(item.memo ?? "");
  }, [item.address, item.memo]);

  const dirty = address.trim() !== item.address || (memo.trim() || null) !== (item.memo ?? null);
  const showMemo = ["XRP", "XLM", "EOS", "TON", "ATOM"].includes(item.symbol) || !!item.memo;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/settings/addresses/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim(), memo: memo.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved(data.address);
      setSavedAt(Date.now());
      flash("ok", `${item.symbol} (${item.network}) address saved.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <form className={`${styles.addrCard} ${dirty ? styles.addrDirty : ""}`} onSubmit={save}>
      <div className={styles.addrHead}>
        <div className={styles.addrToken}>
          <span className={styles.addrSymbol}>{item.symbol}</span>
          <div>
            <div className={styles.strong}>{item.token}</div>
            <div className={styles.muted}>{item.network} network</div>
          </div>
        </div>
        {dirty ? (
          <span className={`${styles.pill} ${styles.pillAmber}`}>Unsaved</span>
        ) : savedAt && Date.now() - savedAt < 5000 ? (
          <span className={`${styles.pill} ${styles.pillGreen}`}>Saved</span>
        ) : (
          <button type="button" className={styles.iconBtn} onClick={copy} aria-label="Copy current address" title="Copy current address">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </div>

      <label className={styles.field}>
        <span>Receiving address</span>
        <input
          className={`${styles.input} ${styles.mono}`}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </label>

      {showMemo && (
        <label className={styles.field}>
          <span>Memo / destination tag</span>
          <input className={styles.input} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Optional" />
        </label>
      )}

      {error && (
        <div className={styles.errorText}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className={styles.addrActions}>
        {dirty && (
          <button
            type="button"
            className={styles.btnGhostSm}
            onClick={() => {
              setAddress(item.address);
              setMemo(item.memo ?? "");
              setError("");
            }}
            disabled={busy}
          >
            <RotateCcw size={14} /> Undo
          </button>
        )}
        <button type="submit" className={styles.btnPrimarySm} disabled={!dirty || busy}>
          {busy ? <Loader2 size={14} className={styles.spin} /> : <Save size={14} />}
          Save
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className={styles.empty}>
      {icon}
      <p>{text}</p>
    </div>
  );
}
