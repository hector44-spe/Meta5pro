"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Loader2, MessageSquare, AlertCircle, ArrowRight } from "lucide-react";

interface CopyTradingGateProps {
  onUnlocked: () => void;
}

export default function CopyTradingGate({ onUnlocked }: CopyTradingGateProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setError("Please enter the access code.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/copy-trading/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid access code. Please request your code from support.");
      }

      try {
        localStorage.setItem("mg5_copy_access_unlocked", "true");
      } catch {
        // ignore storage error
      }

      onUnlocked();
    } catch (err: any) {
      setError(err.message || "Invalid access code. Contact support for assistance.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSupport = () => {
    if (typeof window !== "undefined") {
      const w = window as any;
      if (w.$zoho?.salesiq?.chat?.start) {
        w.$zoho.salesiq.chat.start();
      } else if (w.$zoho?.salesiq?.floatwindow?.visible) {
        w.$zoho.salesiq.floatwindow.visible("show");
      } else {
        // Fallback: look for Zoho launcher button or support link
        const zohoBtn = document.querySelector("#zsiq_float, .zsiq_float_chat, [id*='zsiq']") as HTMLElement | null;
        if (zohoBtn) zohoBtn.click();
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 180px)",
        padding: "24px 16px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#16181d",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          padding: "36px 28px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.55)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle accent glow at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "220px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #4763f0, transparent)",
          }}
        />

        {/* Security Badge Icon */}
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "rgba(71, 99, 240, 0.12)",
            border: "1px solid rgba(71, 99, 240, 0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4763f0",
            marginBottom: "20px",
            boxShadow: "0 8px 24px rgba(71, 99, 240, 0.18)",
          }}
        >
          <Lock size={30} strokeWidth={2.2} />
        </div>

        {/* Header Titles */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 0 10px 0",
            letterSpacing: "-0.2px",
          }}
        >
          Copy Trading Access Required
        </h2>

        <p
          style={{
            fontSize: "13.5px",
            color: "rgba(255, 255, 255, 0.65)",
            lineHeight: "1.55",
            margin: "0 0 24px 0",
          }}
        >
          This section is reserved for verified investors. All users are required to obtain an access code from live support to unlock the copy trading page.
        </p>

        {/* Access Code Form */}
        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
            <label
              htmlFor="copy-access-code-input"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.75)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Enter Access Code
            </label>
            <input
              id="copy-access-code-input"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. 639852"
              autoFocus
              maxLength={20}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "#111317",
                border: error ? "1px solid #ff4757" : "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "2px",
                textAlign: "center",
                outline: "none",
                fontFamily: "monospace",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "10px 12px",
                background: "rgba(255, 71, 87, 0.12)",
                border: "1px solid rgba(255, 71, 87, 0.25)",
                borderRadius: "8px",
                color: "#ff6b81",
                fontSize: "12.5px",
                textAlign: "left",
                lineHeight: "1.4",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !code.trim()}
            style={{
              width: "100%",
              padding: "13px 18px",
              background: "#4763f0",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: submitting || !code.trim() ? "not-allowed" : "pointer",
              opacity: submitting || !code.trim() ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.15s ease",
              marginTop: "4px",
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Unlock Copy Trading</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Live Support Trigger Box */}
        <div
          style={{
            marginTop: "22px",
            paddingTop: "18px",
            borderTop: "1px solid rgba(255, 255, 255, 0.07)",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.5)" }}>
            Don&apos;t have an access code?
          </span>
          <button
            type="button"
            onClick={handleOpenSupport}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#ffffff",
              padding: "8px 14px",
              fontSize: "12.5px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.09)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
          >
            <MessageSquare size={14} color="#4763f0" />
            <span>Request code from 24/7 Live Support</span>
          </button>
        </div>
      </div>
    </div>
  );
}
