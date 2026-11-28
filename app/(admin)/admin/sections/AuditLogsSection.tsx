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
  X,
} from "lucide-react";
import styles from "../page.module.css";
import cStyles from "./AuditLogsSection.module.css";

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
    <div className={cStyles.container}>
      {/* Top Banner with Admin Switcher */}
      <section className={cStyles.bannerCard}>
        <div className={cStyles.bannerHeader}>
          <div className={cStyles.bannerInfo}>
            <div className={cStyles.bannerIcon}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className={cStyles.bannerTitle}>
                Audit Log — Account Specific
              </div>
              <div className={cStyles.bannerSub}>
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
        <div className={cStyles.adminSwitcherWrap}>
          <span className={cStyles.adminSwitcherLabel}>
            View Admin:
          </span>
          <button
            type="button"
            onClick={() => handleAdminSwitch("support@meta5vip.com")}
            className={`${cStyles.adminPill} ${
              selectedAdmin === "support@meta5vip.com" ? cStyles.adminPillActive : cStyles.adminPillInactive
            }`}
          >
            <User size={13} />
            <span>support@meta5vip.com</span>
            <span
              className={`${cStyles.badgeCount} ${
                selectedAdmin === "support@meta5vip.com" ? cStyles.badgeCountActive : cStyles.badgeCountInactive
              }`}
            >
              {adminAccounts.find((a) => a.email === "support@meta5vip.com")?.count ?? 20}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAdminSwitch("orezimeabed2006@gmail.com")}
            className={`${cStyles.adminPill} ${
              selectedAdmin === "orezimeabed2006@gmail.com" ? cStyles.adminPillActive : cStyles.adminPillInactive
            }`}
          >
            <User size={13} />
            <span>orezimeabed2006@gmail.com</span>
            <span
              className={`${cStyles.badgeCount} ${
                selectedAdmin === "orezimeabed2006@gmail.com" ? cStyles.badgeCountActive : cStyles.badgeCountInactive
              }`}
            >
              {adminAccounts.find((a) => a.email === "orezimeabed2006@gmail.com")?.count ?? 1}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAdminSwitch("all")}
            className={`${cStyles.adminPill} ${
              selectedAdmin === "all" ? cStyles.adminPillActive : cStyles.adminPillInactive
            }`}
          >
            <Users size={13} />
            <span>All Admins</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className={cStyles.statsGrid}>
          <div className={cStyles.statCard}>
            <div className={cStyles.statTitle}>Total Actions</div>
            <div className={cStyles.statValue} style={{ color: "#ffffff" }}>{stats.total}</div>
          </div>
          <div className={cStyles.statCard}>
            <div className={cStyles.statTitle}>Credits & Assets</div>
            <div className={cStyles.statValue} style={{ color: "#10b981" }}>{stats.credits}</div>
          </div>
          <div className={cStyles.statCard}>
            <div className={cStyles.statTitle}>Debits & Returns</div>
            <div className={cStyles.statValue} style={{ color: "#ff4d5e" }}>{stats.debits}</div>
          </div>
          <div className={cStyles.statCard}>
            <div className={cStyles.statTitle}>Settings & Rules</div>
            <div className={cStyles.statValue} style={{ color: "#f5a524" }}>{stats.settings}</div>
          </div>
          <div className={cStyles.statCard}>
            <div className={cStyles.statTitle}>KYC & Status</div>
            <div className={cStyles.statValue} style={{ color: "#38bdf8" }}>{stats.verifs}</div>
          </div>
        </div>
      </section>

      {/* Main Table & Mobile Cards Card */}
      <section className={cStyles.tableCard}>
        {/* Filters bar */}
        <div className={cStyles.filterBar}>
          <label className={cStyles.searchBoxWrap}>
            <Search size={16} className={cStyles.searchIcon} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, user email, note, or IP..."
              className={cStyles.searchInput}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={cStyles.searchClearBtn}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <div className={cStyles.filterSelectWrap}>
            <Filter size={15} className={cStyles.filterIcon} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={cStyles.selectDropdown}
              aria-label="Filter by category"
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

        {/* Content State */}
        {loading && logs.length === 0 ? (
          <div style={{ minHeight: "240px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <>
            {/* 1. Desktop Table View (>= 768px) */}
            <div className={cStyles.desktopTableWrap}>
              <table className={styles.table} style={{ minWidth: "960px", width: "100%" }}>
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

            {/* 2. Mobile Card View (< 768px) */}
            <div className={cStyles.mobileListWrap}>
              {filteredLogs.map((log) => {
                const time = formatTimestamp(log.createdAt);
                return (
                  <div key={log.id} className={cStyles.mobileCard}>
                    {/* Header: Action badge & Timestamp */}
                    <div className={cStyles.mobileCardHeader}>
                      <div>{renderBadge(log)}</div>
                      <div className={cStyles.mobileCardTime}>
                        <div style={{ fontWeight: 600, color: "var(--a-text)" }}>{time.formatted}</div>
                        <div style={{ color: "var(--a-muted)", fontSize: "10px" }}>{time.relative}</div>
                      </div>
                    </div>

                    {/* Target User or System Scope */}
                    {log.targetUser ? (
                      <div className={cStyles.mobileCardUser}>
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
                        <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "13px",
                              color: "var(--a-text)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {log.targetUser.fullName || log.targetUser.username || "Investor"}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
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
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--a-faint)",
                          fontStyle: "italic",
                          padding: "4px 8px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: "4px",
                          display: "inline-block",
                        }}
                      >
                        Platform / System Wide
                      </div>
                    )}

                    {/* Details box */}
                    <div className={cStyles.mobileCardDetails}>
                      {log.details}
                    </div>

                    {/* Footer: Admin & IP */}
                    <div className={cStyles.mobileCardFooter}>
                      {selectedAdmin === "all" ? (
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#38bdf8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                          {log.adminEmail}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--a-muted)" }}>
                          Admin: <strong style={{ color: "#38bdf8" }}>{log.adminEmail.split("@")[0]}</strong>
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "var(--a-muted)",
                          backgroundColor: "rgba(255,255,255,0.04)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid var(--a-border)",
                        }}
                      >
                        {log.ipAddress}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
