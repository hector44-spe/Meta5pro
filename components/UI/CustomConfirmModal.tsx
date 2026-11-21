"use client";

import React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, HelpCircle, Check, X, Loader2 } from "lucide-react";

export interface CustomConfirmState {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
}

interface CustomConfirmModalProps {
  state: CustomConfirmState | null;
  onClose: () => void;
  loading?: boolean;
}

export default function CustomConfirmModal({
  state,
  onClose,
  loading = false,
}: CustomConfirmModalProps) {
  if (!state) return null;

  const isDanger = state.danger !== false;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100000,
        padding: "16px",
        boxSizing: "border-box",
      }}
      onClick={() => !loading && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          maxHeight: "min(92vh, calc(100dvh - 24px))",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          backgroundColor: "#16181e",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "14px",
          padding: "22px 20px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxSizing: "border-box",
          animation: "customConfirmFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: isDanger ? "rgba(255, 59, 78, 0.15)" : "rgba(79, 107, 255, 0.15)",
              border: `1px solid ${isDanger ? "rgba(255, 59, 78, 0.35)" : "rgba(79, 107, 255, 0.35)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isDanger ? (
              <AlertCircle size={20} color="#ff3b4e" />
            ) : (
              <HelpCircle size={20} color="#4F6BFF" />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                margin: "0 0 6px 0",
                fontSize: "16px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.3,
              }}
            >
              {state.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "13.5px",
                lineHeight: "20px",
                color: "rgba(255, 255, 255, 0.65)",
                whiteSpace: "pre-line",
                wordBreak: "break-word",
              }}
            >
              {state.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !loading && onClose()}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.45)",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            marginTop: "4px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
              flex: "1 1 100px",
            }}
          >
            {state.cancelText || "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => {
              state.onConfirm();
              onClose();
            }}
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              backgroundColor: isDanger ? "#ff3b4e" : "#4F6BFF",
              border: "none",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              flex: "1 1 120px",
            }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            <span>{state.confirmText || "Confirm"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
