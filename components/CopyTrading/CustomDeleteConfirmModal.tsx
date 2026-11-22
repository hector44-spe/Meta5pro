"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface CustomDeleteConfirmModalProps {
  isOpen: boolean;
  expertName: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CustomDeleteConfirmModal({
  isOpen,
  expertName,
  loading = false,
  onConfirm,
  onCancel,
}: CustomDeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div
      className="project-edit-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100005,
        padding: "16px",
      }}
      onClick={onCancel}
    >
      <div
        className="project-edit-modal-dialog"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#16171d",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "14px",
          padding: "24px",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 59, 78, 0.12)",
              border: "1px solid rgba(255, 59, 78, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={22} color="#ff3b4e" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="dm-close-btn close_btn"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              color: "#ffffff",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
            }}
          >
            <X size={18} color="#ffffff" />
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
            Delete Expert
          </h3>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "rgba(255, 255, 255, 0.65)",
              margin: 0,
            }}
          >
            Are you sure you want to delete <strong style={{ color: "#ffffff" }}>{expertName}</strong>?
            This will permanently remove the expert from the copy trading catalog. This action cannot be undone.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              height: "42px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              height: "42px",
              backgroundColor: "#ff3b4e",
              border: "none",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  return mounted && typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
}
