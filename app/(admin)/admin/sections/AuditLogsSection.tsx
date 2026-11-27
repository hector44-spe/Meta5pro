"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  RefreshCw,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  Settings,
  CheckCircle2,
  XCircle,
  Bell,
  Coins,
  Key,
  Layers,
  Filter,
  User,
  Users,
} from "lucide-react";
import styles from "../page.module.css";

interface AuditLogItem {
  id: string;
  action: string;
  actionLabel: string;
  category: "credit" | "debit" | "asset" | "status" | "verification" | "settings" | "notification" | "system";
  details: string;
  ipAddress: string;
  createdAt: string;
  adminEmail: string;
  targetUserId?: string | null;
  targetUser?: {
    id: string;
    fullName?: string | null;
    email: string;
    username?: string | null;
  } | null;
}

interface AdminAccountItem {
  id: string;
  email: string;
  fullName: string;
  count: number;
}

export default function AuditLogsSection({
  flash,
}: {
  flash: (kind: "ok" | "error", text: string) => void;
}) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccountItem[]>([]);
  // Default strictly to support@meta5vip.com (the second admin account)
  const [selectedAdmin, setSelectedAdmin] = useState<string>("support@meta5vip.com");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchLogs = useCallback(
    async (targetAdmin = selectedAdmin, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const query = new URLSearchParams({
          admin: targetAdmin,
        });
        const res = await fetch(`/api/admin/audit-logs?${query.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load audit logs");
        setLogs(data.logs || []);
        if (data.adminAccounts) setAdminAccounts(data.adminAccounts);
      } catch (err: any) {
        if (!silent) flash("error", err?.message || "Could not retrieve audit logs");
      } finally {
        setLoading(false);
      }
    },
    [selectedAdmin, flash]
  );

  useEffect(() => {
    fetchLogs(selectedAdmin);
  }, [selectedAdmin, fetchLogs]);

  const handleAdminSwitch = (adminEmail: string) => {
    setSelectedAdmin(adminEmail);
    fetchLogs(adminEmail);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (categoryFilter !== "ALL" && log.category.toUpperCase() !== categoryFilter) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const target = [
        log.action,
        log.actionLabel,
        log.details,
        log.ipAddress,
        log.adminEmail,
        log.targetUser?.email,
        log.targetUser?.fullName,
        log.targetUser?.username,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return target.includes(q);
    });
  }, [logs, categoryFilter, search]);

  const stats = useMemo(() => {
    const credits = logs.filter((l) => l.category === "credit" || l.category === "asset").length;
    const debits = logs.filter((l) => l.category === "debit").length;
    const settings = logs.filter((l) => l.category === "settings").length;
    const verifs = logs.filter((l) => l.category === "verification" || l.category === "status").length;
    return { total: logs.length, credits, debits, settings, verifs };
  }, [logs]);

  const renderBadge = (log: AuditLogItem) => {
    let icon = <Layers size={13} />;
    let pillClass = styles.pillBlue;

    switch (log.category) {
      case "credit":
        icon = <ArrowDownRight size={13} />;
        pillClass = styles.pillGreen;
        break;
      case "asset":
        icon = <Coins size={13} />;
        pillClass = styles.pillGreen;
        break;
      case "debit":
        icon = <ArrowUpRight size={13} />;
        pillClass = styles.pillRed;
        break;
      case "verification":
        icon = log.action.includes("UNVERIF") ? <XCircle size={13} /> : <CheckCircle2 size={13} />;
        pillClass = log.action.includes("UNVERIF") ? styles.pillRed : styles.pillGreen;
        break;
      case "status":
        icon = <Key size={13} />;
        pillClass = styles.pillCyan;
        break;
      case "settings":
        icon = <Settings size={13} />;
        pillClass = styles.pillAmber;
        break;
      case "notification":
        icon = <Bell size={13} />;
        pillClass = styles.pillBlue;
        break;
    }

    return (
      <span
        className={`${styles.pill} ${pillClass}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          fontWeight: 600,
          fontSize: "12px",
          padding: "3px 9px",
        }}
      >
        {icon}
        <span>{log.actionLabel}</span>
      </span>
    );
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        formatted: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        relative: getRelativeTime(d),
      };
    } catch {
      return { formatted: dateStr, relative: "" };
    }
  };

  const getRelativeTime = (d: Date) => {
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner with Admin Switcher */}
      <section className={styles.card} style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "rgba(71, 99, 240, 0.16)",
                color: "var(--a-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--a-text)" }}>
                Audit Log — Account Specific
              </div>
              <div style={{ fontSize: "13px", color: "var(--a-muted)", marginTop: "2px" }}>
                Tracking actions executed by{" "}
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                  {selectedAdmin === "all" ? "All Admin Accounts" : selectedAdmin}
                </span>
                {selectedAdmin === "support@meta5vip.com" && (
                  <span style={{ marginLeft: "6px", fontSize: "11px", color: "#10b981", fontWeight: 600 }}>
                    (Second / Production Admin)
                  </span>
                )}
                {selectedAdmin === "orezimeabed2006@gmail.com" && (
                  <span style={{ marginLeft: "6px", fontSize: "11px", color: "#f5a524", fontWeight: 600 }}>
                    (Developer Test Account)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => fetchLogs(selectedAdmin, false)}
              disabled={loading}
              title="Refresh audit trail"
            >
              <RefreshCw size={14} className={loading ? styles.spin : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Admin Account Switcher Tabs */}
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--a-border)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--a-muted)", fontWeight: 600, marginRight: "4px" }}>
            View Admin:
          </span>
          <button
            type="button"
            onClick={() => handleAdminSwitch("support@meta5vip.com")}
            className={selectedAdmin === "support@meta5vip.com" ? styles.btnPrimarySm : styles.btnGhostSm}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "6px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <User size={13} />
            <span>support@meta5vip.com</span>
            <span
              style={{
                backgroundColor: selectedAdmin === "support@meta5vip.com" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "11px",
              }}
            >
              {adminAccounts.find((a) => a.email === "support@meta5vip.com")?.count ?? 20}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAdminSwitch("orezimeabed2006@gmail.com")}
            className={selectedAdmin === "orezimeabed2006@gmail.com" ? styles.btnPrimarySm : styles.btnGhostSm}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "6px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <User size={13} />
            <span>orezimeabed2006@gmail.com</span>
            <span
              style={{
                backgroundColor: selectedAdmin === "orezimeabed2006@gmail.com" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "11px",
              }}
            >
              {adminAccounts.find((a) => a.email === "orezimeabed2006@gmail.com")?.count ?? 1}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAdminSwitch("all")}
            className={selectedAdmin === "all" ? styles.btnPrimarySm : styles.btnGhostSm}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "6px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <Users size={13} />
            <span>All Admins</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid var(--a-border)",
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--a-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--a-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Actions</div>
            <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px", color: "#ffffff" }}>{stats.total}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--a-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--a-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Credits & Assets</div>
            <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px", color: "#10b981" }}>{stats.credits}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--a-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--a-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Debits & Returns</div>
            <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px", color: "#ff4d5e" }}>{stats.debits}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--a-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--a-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Settings & Rules</div>
            <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px", color: "#f5a524" }}>{stats.settings}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--a-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--a-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>KYC & Status</div>
            <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px", color: "#38bdf8" }}>{stats.verifs}</div>
          </div>
        </div>
      </section>

      {/* Main Table Card */}
      <section className={styles.card}>
        {/* Filters bar */}
        <div className={styles.filters} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <label className={styles.searchBox} style={{ flex: "1 1 280px" }}>
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, user email, note, or IP..."
            />
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={15} style={{ color: "var(--a-muted)" }} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.searchBox}
              style={{
                background: "var(--a-panel)",
                color: "var(--a-text)",
                border: "1px solid var(--a-border)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="CREDIT">Balance Credits</option>
              <option value="DEBIT">Balance Debits</option>
              <option value="ASSET">Crypto Assets</option>
              <option value="SETTINGS">Settings Changes</option>
              <option value="STATUS">User Status & Codes</option>
              <option value="VERIFICATION">Identity & Verification</option>
              <option value="NOTIFICATION">Notifications</option>
            </select>
          </div>
        </div>

        {/* Table content */}
        {loading && logs.length === 0 ? (
          <div className={styles.tableWrap} style={{ minHeight: "240px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "180px", color: "var(--a-muted)" }}>
              <RefreshCw size={24} className={styles.spin} />
              <span style={{ marginLeft: "10px" }}>Loading audit records for {selectedAdmin}...</span>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--a-muted)" }}>
            <ShieldCheck size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--a-text)" }}>No matching audit actions found</div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>
              {search || categoryFilter !== "ALL"
                ? "Try adjusting your search query or category filter."
                : `No actions have been recorded yet for ${selectedAdmin}.`}
            </div>
          </div>
        ) : (
          <div className={styles.tableWrap} style={{ minHeight: "320px" }}>
            <table className={styles.table} style={{ minWidth: "960px" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: "160px" }}>Timestamp</th>
                  <th style={{ minWidth: "170px" }}>Action</th>
                  {selectedAdmin === "all" && <th style={{ minWidth: "160px" }}>Admin</th>}
                  <th style={{ minWidth: "200px" }}>Target User / Scope</th>
                  <th style={{ minWidth: "320px" }}>Details & Note</th>
                  <th style={{ minWidth: "110px", textAlign: "right" }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const time = formatTimestamp(log.createdAt);
                  return (
                    <tr key={log.id}>
                      {/* Timestamp */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 600, color: "var(--a-text)", fontSize: "13px" }}>
                            {time.formatted}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--a-muted)" }}>{time.relative}</span>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td>{renderBadge(log)}</td>

                      {/* Admin Account (when viewing all) */}
                      {selectedAdmin === "all" && (
                        <td>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#38bdf8" }}>
                            {log.adminEmail}
                          </span>
                        </td>
                      )}

                      {/* Target User / Target Scope */}
                      <td>
                        {log.targetUser ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                                color: "var(--a-text)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {(log.targetUser.email[0] || "U").toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, overflow: "hidden" }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: "13px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {log.targetUser.fullName || log.targetUser.username || "Investor"}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--a-muted)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {log.targetUser.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--a-faint)",
                              fontStyle: "italic",
                            }}
                          >
                            Platform / System Wide
                          </span>
                        )}
                      </td>

                      {/* Details & Notes */}
                      <td>
                        <div
                          style={{
                            fontSize: "13px",
                            lineHeight: "1.45",
                            color: "var(--a-text)",
                            wordBreak: "break-word",
                          }}
                        >
                          {log.details}
                        </div>
                      </td>

                      {/* IP Address */}
                      <td style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "var(--a-muted)",
                            backgroundColor: "rgba(255,255,255,0.04)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: "1px solid var(--a-border)",
                          }}
                        >
                          {log.ipAddress}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
