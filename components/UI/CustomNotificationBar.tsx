"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X, Info } from "lucide-react";

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

  // Exact design replica from image 2:
  // - High contrast dark forest green for success / profit
  // - High contrast dark ruby red for error / loss
  // - High contrast dark sapphire for info
  const bgColor = isSuccess
    ? "#EBF9F1"
    : isError
    ? "#FEEFEF"
    : "#EEF2FF";

  const borderColor = isSuccess
    ? "rgba(0, 104, 55, 0.28)"
    : isError
    ? "rgba(153, 27, 27, 0.28)"
    : "rgba(30, 64, 175, 0.28)";

  const textColor = isSuccess
    ? "#006837"
    : isError
    ? "#991b1b"
    : "#1e40af";

  const iconBgColor = isSuccess
    ? "#00875a"
    : isError
    ? "#b91c1c"
    : "#2563eb";

  const content = (
    <div
      role="alert"
      className="custom-notification-bar-root"
      style={{
        position: "fixed",
        top: "calc(76px + env(safe-area-inset-top, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100000,
        width: "calc(100% - 32px)",
        maxWidth: "460px",
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08)",
        borderRadius: "14px",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        boxSizing: "border-box",
        animation: "notificationSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "auto",
        color: textColor,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
        {isSuccess && (
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: iconBgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Check size={14} color="#ffffff" strokeWidth={3} />
          </div>
        )}
        {isError && (
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: iconBgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={13} color="#ffffff" strokeWidth={3} />
          </div>
        )}
        {!isSuccess && !isError && (
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: iconBgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Info size={13} color="#ffffff" strokeWidth={3} />
          </div>
        )}

        <p
          className="custom-notification-message"
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 650,
            color: `${textColor} !important`,
            lineHeight: "1.4",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            letterSpacing: "-0.15px",
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
          color: `${textColor} !important`,
          opacity: 0.85,
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRadius: "6px",
          transition: "opacity 0.15s ease",
        }}
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={2.5} />
      </button>

      <style jsx global>{`
        .custom-notification-bar-root {
          z-index: 100000 !important;
        }
        .custom-notification-bar-root p,
        .custom-notification-bar-root .custom-notification-message {
          color: ${textColor} !important;
          font-weight: 650 !important;
        }
        .custom-notification-bar-root button {
          color: ${textColor} !important;
        }
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
