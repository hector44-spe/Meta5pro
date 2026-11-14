"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface CustomNotificationState {
  type: "success" | "error" | "info";
  message: string;
}

interface CustomNotificationBarProps {
  notification: CustomNotificationState | null;
  onClose: () => void;
}

export default function CustomNotificationBar({
  notification,
  onClose,
}: CustomNotificationBarProps) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const isSuccess = notification.type === "success";
  const isError = notification.type === "error";

  const accentColor = isSuccess ? "#02B15A" : isError ? "#ff3b4e" : "#4F6BFF";
  const bgColor = isSuccess
    ? "rgba(2, 177, 90, 0.15)"
    : isError
    ? "rgba(255, 59, 78, 0.15)"
    : "rgba(79, 107, 255, 0.15)";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100000,
        width: "90%",
        maxWidth: "480px",
        backgroundColor: "#16181e",
        border: `1px solid ${accentColor}40`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px ${accentColor}20`,
        borderRadius: "10px",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        animation: "notificationSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isSuccess && <CheckCircle2 size={16} color="#02B15A" />}
          {isError && <AlertCircle size={16} color="#ff3b4e" />}
          {!isSuccess && !isError && <Info size={16} color="#4F6BFF" />}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "13.5px",
            fontWeight: 500,
            color: "#ffffff",
            lineHeight: "18px",
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
          color: "rgba(255, 255, 255, 0.5)",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>

      <style jsx global>{`
        @keyframes notificationSlideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
