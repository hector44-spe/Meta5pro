"use client";

import React from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  ShieldCheck,
  UserRound,
  LineChart,
  Layers,
  Bell,
  CheckCheck,
} from "lucide-react";

export interface AppNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  deposit: { icon: <ArrowDownToLine size={16} />, color: "#10b981" },
  withdrawal: { icon: <ArrowUpFromLine size={16} />, color: "#f5a524" },
  balance: { icon: <Wallet size={16} />, color: "#8fa2ff" },
  security: { icon: <ShieldCheck size={16} />, color: "#ff7a87" },
  account: { icon: <UserRound size={16} />, color: "#8fa2ff" },
  trade: { icon: <LineChart size={16} />, color: "#a78bfa" },
  investment: { icon: <Layers size={16} />, color: "#38bdf8" },
};

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotificationsPanel({
  items,
  unread,
  loading,
  onMarkAllRead,
}: {
  items: AppNotification[];
  unread: number;
  loading: boolean;
  onMarkAllRead: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", minHeight: 0, flex: 1 }}>
      {unread > 0 && (
        <button
          type="button"
          onClick={onMarkAllRead}
          style={{
            alignSelf: "flex-end",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: "#8fa2ff",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            height: "auto",
          }}
        >
          <CheckCheck size={15} /> Mark all as read
        </button>
      )}

      {loading && items.length === 0 && (
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", padding: "24px 0", textAlign: "center" }}>Loading…</div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "40px 0", color: "rgba(255,255,255,0.45)" }}>
          <Bell size={26} />
          <div style={{ fontSize: "13px" }}>No notifications yet</div>
        </div>
      )}

      {items.map((n) => {
        const meta = ICONS[n.kind] ?? ICONS.account;
        return (
          <div
            key={n.id}
            style={{
              display: "flex",
              gap: "12px",
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: n.read ? "rgba(255, 255, 255, 0.03)" : "rgba(71, 99, 240, 0.1)",
              border: `1px solid ${n.read ? "rgba(255, 255, 255, 0.06)" : "rgba(71, 99, 240, 0.25)"}`,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: meta.color,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              {meta.icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "baseline" }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#fff" }}>{n.title}</div>
                {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4763f0", flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.65)", marginTop: "4px", lineHeight: 1.5, wordBreak: "break-word" }}>
                {n.body}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", marginTop: "8px" }}>{timeAgo(n.createdAt)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
