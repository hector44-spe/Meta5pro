"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Check,
  X,
  Search,
  RefreshCw,
  LogOut,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Users,
  DollarSign,
  UserX,
  UserCheck,
  Edit3,
} from "lucide-react";
import styles from "./page.module.css";

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "addresses" | "users">("queue");
  const [transactions, setTransactions] = useState<AdminTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Address editor state
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [savingAddresses, setSavingAddresses] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // User management state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<AdminUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustAction, setAdjustAction] = useState<"credit" | "debit">("credit");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustStatus, setAdjustStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Proof screenshot lightbox
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load admin queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/settings/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAddresses();
    fetchUsers();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await fetchTransactions();
        await fetchUsers(); // refresh balances
      } else {
        const err = await res.json();
        alert(err.error || "Operation failed");
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddressChange = (id: string, field: "address" | "memo", val: string) => {
    setAddresses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddresses(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/admin/settings/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: addresses.map((a) => ({
            id: a.id,
            address: a.address,
            memo: a.memo,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus({ type: "success", message: "Deposit addresses updated successfully! Changes are live across all investor deposit modals." });
        if (data.addresses) setAddresses(data.addresses);
      } else {
        setSaveStatus({ type: "error", message: data.error || "Failed to update addresses" });
      }
    } catch {
      setSaveStatus({ type: "error", message: "Network error saving addresses" });
    } finally {
      setSavingAddresses(false);
    }
  };

  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    const num = parseFloat(adjustAmount);
    if (!num || num <= 0) {
      setAdjustStatus({ type: "error", message: "Please enter a valid positive adjustment amount" });
      return;
    }

    setAdjusting(true);
    setAdjustStatus(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForBalance.id}/balance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: num,
          action: adjustAction,
          note: adjustNote.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdjustStatus({ type: "success", message: data.message });
        await fetchUsers();
        setTimeout(() => {
          setSelectedUserForBalance(null);
          setAdjustAmount("");
          setAdjustNote("");
          setAdjustStatus(null);
        }, 1200);
      } else {
        setAdjustStatus({ type: "error", message: data.error || "Balance adjustment failed" });
      }
    } catch {
      setAdjustStatus({ type: "error", message: "Network error adjusting balance" });
    } finally {
      setAdjusting(false);
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (user.role === "ADMIN" && newStatus === "SUSPENDED") {
      alert("Cannot suspend a Super Admin account");
      return;
    }
    const confirmMsg = `Are you sure you want to set status of ${user.email} to ${newStatus}?`;
    if (!confirm(confirmMsg)) return;

    setStatusUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update user status");
      }
    } catch {
      alert("Network error updating status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const pendingQueue = transactions.filter((t) => t.status === "PENDING");
  const processedQueue = transactions.filter((t) => t.status !== "PENDING");

  const filteredUsers = users.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Super Admin Moderation Portal</h1>
          <p style={{ color: "var(--color-text-tertiary)", fontSize: "0.9rem" }}>
            Root privilege access • Financial audit logs, addresses &amp; balance control
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => {
              fetchTransactions();
              fetchAddresses();
              fetchUsers();
            }}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
            }}
          >
            <RefreshCw size={14} className={loading || loadingUsers ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className={styles.badge}>ADMIN SESSION ACTIVE</div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "rgba(255, 51, 68, 0.1)",
              border: "1px solid rgba(255, 51, 68, 0.25)",
              color: "var(--color-negative)",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: activeTab === "queue" ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)",
            background: activeTab === "queue" ? "rgba(59, 130, 246, 0.15)" : "#14171d",
            color: activeTab === "queue" ? "#60a5fa" : "rgba(255,255,255,0.6)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Approval Queue ({pendingQueue.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: activeTab === "users" ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)",
            background: activeTab === "users" ? "rgba(59, 130, 246, 0.15)" : "#14171d",
            color: activeTab === "users" ? "#60a5fa" : "rgba(255,255,255,0.6)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          User Accounts ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("addresses")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: activeTab === "addresses" ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)",
            background: activeTab === "addresses" ? "rgba(59, 130, 246, 0.15)" : "#14171d",
            color: activeTab === "addresses" ? "#60a5fa" : "rgba(255,255,255,0.6)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Crypto Deposit Addresses ({addresses.length})
        </button>
      </div>

      {/* ====================================================================
          TAB 1: APPROVAL QUEUE & SETTLEMENT HISTORY
          ==================================================================== */}
      {activeTab === "queue" && (
        <>
          <div className={styles.card}>
            <h2 className={styles.tableTitle}>
              Pending Financial Operations ({pendingQueue.length})
            </h2>
            {pendingQueue.length === 0 ? (
              <p style={{ color: "var(--color-positive)", padding: "1rem 0" }}>
                All operations reviewed and cleared. Pending queue is empty.
              </p>
            ) : (
              <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>User Account</th>
                    <th className={styles.th}>Type</th>
                    <th className={styles.th}>Amount</th>
                    <th className={styles.th}>Payment Proof</th>
                    <th className={styles.th}>Blockchain Ref</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQueue.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.td} style={{ fontFamily: "var(--font-mono)" }}>
                        {item.id.substring(0, 10)}...
                      </td>
                      <td className={styles.td}>
                        <div>{item.userFullName || "Investor"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>
                          {item.userEmail}
                        </div>
                      </td>
                      <td
                        className={styles.td}
                        style={{
                          color: item.type.includes("DEPOSIT") ? "var(--color-positive)" : "#f59e0b",
                          fontWeight: 700,
                        }}
                      >
                        {item.type}
                      </td>
                      <td className={styles.td} style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        <div style={{ fontSize: "11px", color: "#888", fontWeight: 400 }}>
                          {item.currency}
                        </div>
                      </td>

                      {/* Payment Proof Column */}
                      <td className={styles.td}>
                        {item.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewProofUrl(item.receiptUrl)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              backgroundColor: "rgba(59, 130, 246, 0.15)",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              color: "#60a5fa",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Eye size={13} />
                            <span>View Screenshot</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                            No file attached
                          </span>
                        )}
                      </td>

                      <td
                        className={styles.td}
                        style={{ fontSize: "0.8rem", color: "#888", maxWidth: "160px", wordBreak: "break-all" }}
                      >
                        {item.txHash || item.cryptoAddress || "Direct Ledger Transfer"}
                      </td>

                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          disabled={actionLoading === item.id}
                          onClick={() => handleAction(item.id, "approve")}
                          className={styles.approveBtn}
                        >
                          {actionLoading === item.id ? "Processing..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === item.id}
                          onClick={() => handleAction(item.id, "reject")}
                          className={styles.rejectBtn}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {/* Audit Log / Processed Operations */}
          <div className={styles.card} style={{ marginTop: "2rem" }}>
            <h2 className={styles.tableTitle}>
              Settlement Audit History ({processedQueue.length})
            </h2>
            {processedQueue.length === 0 ? (
              <p style={{ color: "#888", padding: "1rem 0" }}>
                No past operations in audit log.
              </p>
            ) : (
              <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>User Account</th>
                    <th className={styles.th}>Type</th>
                    <th className={styles.th}>Amount</th>
                    <th className={styles.th}>Proof</th>
                    <th className={styles.th}>Outcome</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {processedQueue.slice(0, 15).map((item) => (
                    <tr key={item.id}>
                      <td className={styles.td} style={{ fontFamily: "var(--font-mono)" }}>
                        {item.id.substring(0, 10)}...
                      </td>
                      <td className={styles.td}>{item.userEmail}</td>
                      <td className={styles.td}>{item.type}</td>
                      <td className={styles.td} style={{ fontFamily: "var(--font-mono)" }}>
                        ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className={styles.td}>
                        {item.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewProofUrl(item.receiptUrl)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#60a5fa",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                            }}
                          >
                            <Eye size={13} /> View
                          </button>
                        ) : (
                          <span style={{ color: "#666", fontSize: "11px" }}>-</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            backgroundColor:
                              item.status === "APPROVED"
                                ? "rgba(1, 178, 139, 0.15)"
                                : "rgba(255, 51, 68, 0.15)",
                            color:
                              item.status === "APPROVED"
                                ? "var(--color-positive)"
                                : "var(--color-negative)",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: "right", color: "#888", fontSize: "0.8rem" }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ====================================================================
          TAB 2: USER ACCOUNTS DIRECTORY & BALANCE ADJUSTMENT
          ==================================================================== */}
      {activeTab === "users" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.tableTitle} style={{ margin: 0 }}>
                Registered User Directory ({users.length})
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                Inspect investor profiles, adjust account balances, and manage access statuses.
              </p>
            </div>
            <div className={styles.search}>
              <input
                type="text"
                placeholder="Search email, name or role..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#0d0f14",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div className={styles.tableWrap}>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>User / Email</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Main Balance</th>
                <th className={styles.th}>Yield Profit</th>
                <th className={styles.th}>Total Deposited</th>
                <th className={styles.th} style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.td} style={{ textAlign: "center", color: "#888", padding: "20px 0" }}>
                    No users match search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{user.fullName || user.username}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{user.email}</div>
                    </td>
                    <td className={styles.td}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: user.role === "ADMIN" ? "rgba(168, 85, 247, 0.15)" : "rgba(59, 130, 246, 0.15)",
                          color: user.role === "ADMIN" ? "#c084fc" : "#60a5fa",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: user.status === "ACTIVE" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: user.status === "ACTIVE" ? "#10b981" : "#ef4444",
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.td} style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fff" }}>
                      ${user.mainBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className={styles.td} style={{ fontFamily: "var(--font-mono)", color: "#10b981" }}>
                      ${user.interestBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className={styles.td} style={{ fontFamily: "var(--font-mono)", color: "#888" }}>
                      ${user.totalDeposited.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className={styles.td} style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForBalance(user);
                            setAdjustAmount("");
                            setAdjustNote("");
                            setAdjustStatus(null);
                          }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "5px",
                            backgroundColor: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            color: "#60a5fa",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <DollarSign size={13} />
                          <span>Adjust Balance</span>
                        </button>

                        {user.role !== "ADMIN" && (
                          <button
                            type="button"
                            disabled={statusUpdatingId === user.id}
                            onClick={() => handleToggleUserStatus(user)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "5px",
                              backgroundColor: user.status === "ACTIVE" ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                              border: user.status === "ACTIVE" ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(16, 185, 129, 0.25)",
                              color: user.status === "ACTIVE" ? "#ef4444" : "#10b981",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {user.status === "ACTIVE" ? <UserX size={13} /> : <UserCheck size={13} />}
                            <span>{user.status === "ACTIVE" ? "Suspend" : "Activate"}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: CRYPTO DEPOSIT ADDRESSES MANAGEMENT (ADMIN CONTROL)
          ==================================================================== */}
      {activeTab === "addresses" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.tableTitle} style={{ margin: 0 }}>
                Crypto Deposit Addresses Configuration
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                Update receiving wallet addresses for each token and network. Changes immediately reflect in investor deposit modals.
              </p>
            </div>
          </div>

          {saveStatus && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                backgroundColor:
                  saveStatus.type === "success"
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                border:
                  saveStatus.type === "success"
                    ? "1px solid rgba(16, 185, 129, 0.3)"
                    : "1px solid rgba(239, 68, 68, 0.3)",
                color: saveStatus.type === "success" ? "#10b981" : "#ef4444",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {saveStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{saveStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveAddresses}>
            <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Token</th>
                  <th className={styles.th}>Symbol</th>
                  <th className={styles.th}>Network</th>
                  <th className={styles.th} style={{ width: "50%" }}>Receiving Address</th>
                  <th className={styles.th}>Memo / Tag (Optional)</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.td} style={{ fontWeight: 600, color: "#fff" }}>
                      {item.token}
                    </td>
                    <td className={styles.td}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(255,255,255,0.06)",
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                      >
                        {item.symbol}
                      </span>
                    </td>
                    <td className={styles.td} style={{ color: "#60a5fa", fontWeight: 500 }}>
                      {item.network}
                    </td>
                    <td className={styles.td}>
                      <input
                        type="text"
                        value={item.address}
                        onChange={(e) => handleAddressChange(item.id, "address", e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          backgroundColor: "#0d0f14",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "6px",
                          color: "#fff",
                          fontFamily: "ui-monospace, monospace",
                          fontSize: "12px",
                        }}
                      />
                    </td>
                    <td className={styles.td}>
                      <input
                        type="text"
                        value={item.memo || ""}
                        onChange={(e) => handleAddressChange(item.id, "memo", e.target.value)}
                        placeholder="None"
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          backgroundColor: "#0d0f14",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "6px",
                          color: "#fff",
                          fontFamily: "ui-monospace, monospace",
                          fontSize: "12px",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={savingAddresses}
                className={styles.approveBtn}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  fontSize: "14px",
                }}
              >
                <Save size={16} />
                <span>{savingAddresses ? "Saving Addresses..." : "Save All Addresses"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          BALANCE ADJUSTMENT MODAL
          ==================================================================== */}
      {selectedUserForBalance && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11000,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedUserForBalance(null)}
        >
          <div
            style={{
              maxWidth: "460px",
              width: "100%",
              backgroundColor: "#16191f",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "24px",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                Adjust Investor Balance
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForBalance(null)}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "12px", backgroundColor: "#0f1217", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#888" }}>Target Investor:</div>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>{selectedUserForBalance.email}</div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>
                Current Balance: <span style={{ color: "#38bdf8", fontWeight: 700 }}>${selectedUserForBalance.mainBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {adjustStatus && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  marginBottom: "14px",
                  backgroundColor: adjustStatus.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: adjustStatus.type === "success" ? "#10b981" : "#ef4444",
                  fontSize: "12px",
                }}
              >
                {adjustStatus.message}
              </div>
            )}

            <form onSubmit={handleBalanceSubmit}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                <button
                  type="button"
                  onClick={() => setAdjustAction("credit")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: adjustAction === "credit" ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: adjustAction === "credit" ? "rgba(16,185,129,0.15)" : "transparent",
                    color: adjustAction === "credit" ? "#10b981" : "#888",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  + Credit Funds
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction("debit")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: adjustAction === "debit" ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: adjustAction === "debit" ? "rgba(239,68,68,0.15)" : "transparent",
                    color: adjustAction === "debit" ? "#ef4444" : "#888",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  - Debit Funds
                </button>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "6px" }}>
                  Adjustment Amount ($):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    backgroundColor: "#0d0f14",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "6px" }}>
                  Reason / Internal Audit Note:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wire transfer deposit confirmation, bonus credit"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "#0d0f14",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  className={styles.rejectBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className={styles.approveBtn}
                >
                  {adjusting ? "Processing..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREENSHOT PROOF LIGHTBOX MODAL
          ==================================================================== */}
      {previewProofUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11000,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setPreviewProofUrl(null)}
        >
          <div
            style={{
              maxWidth: "720px",
              width: "100%",
              backgroundColor: "#16191f",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: 0 }}>
                Investor Payment Proof Screenshot
              </h3>
              <button
                type="button"
                onClick={() => setPreviewProofUrl(null)}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                backgroundColor: "#0b0d11",
                borderRadius: "8px",
                padding: "8px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewProofUrl}
                alt="Payment proof screenshot"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "6px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a
                href={previewProofUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#60a5fa",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={14} /> Open full size in new tab
              </a>
              <button
                type="button"
                onClick={() => setPreviewProofUrl(null)}
                className={styles.rejectBtn}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
