"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface CustomNotificationState {
  type: "success" | "error" | "info";
  message: string;
  durationMs?: number;
}

interface CustomNotificationBarProps {
  notification: CustomNotificationState | null;
  onClose: () => void;
}

export default function CustomNotificationBar({
  notification,
  onClose,
}: CustomNotificationBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, notification.durationMs ?? 4500);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification || !mounted) return null;

  const isSuccess = notification.type === "success";
  const isError = notification.type === "error";

  const accentColor = isSuccess ? "#02B15A" : isError ? "#ff3b4e" : "#4F6BFF";
  const bgColor = isSuccess
    ? "rgba(2, 177, 90, 0.15)"
    : isError
    ? "rgba(255, 59, 78, 0.15)"
    : "rgba(79, 107, 255, 0.15)";

  const content = (
    <div
      role="alert"
      className="custom-notification-bar-root"
      style={{
        position: "fixed",
        top: "calc(76px + env(safe-area-inset-top, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000000,
        width: "calc(100% - 32px)",
        maxWidth: "480px",
        backgroundColor: "#16181e",
        border: `1px solid ${accentColor}55`,
        boxShadow: `0 12px 36px rgba(0, 0, 0, 0.75), 0 0 20px ${accentColor}25`,
        borderRadius: "12px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        boxSizing: "border-box",
        animation: "notificationSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isSuccess && <CheckCircle2 size={18} color="#02B15A" />}
          {isError && <AlertCircle size={18} color="#ff3b4e" />}
          {!isSuccess && !isError && <Info size={18} color="#4F6BFF" />}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "13.5px",
            fontWeight: 500,
            color: "#ffffff",
            lineHeight: "1.4",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {notification.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255, 255, 255, 0.6)",
          cursor: "pointer",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRadius: "6px",
        }}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>

      <style jsx global>{`
        @keyframes notificationSlideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -16px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
