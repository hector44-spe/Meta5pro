"use client";

import React, { useState } from "react";
import { Lock, Loader2, MessageSquare, AlertCircle, ArrowRight } from "lucide-react";

interface CopyTradingGateProps {
  onUnlocked: () => void;
}

export default function CopyTradingGate({ onUnlocked }: CopyTradingGateProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
        minHeight: "calc(100dvh - 160px)",
        padding: "20px 14px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#16181d",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          padding: "32px 20px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent glow line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #4763f0, transparent)",
          }}
        />

        {/* Security Badge Icon */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(71, 99, 240, 0.12)",
            border: "1px solid rgba(71, 99, 240, 0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4763f0",
            marginBottom: "18px",
            boxShadow: "0 8px 24px rgba(71, 99, 240, 0.16)",
          }}
        >
          <Lock size={26} strokeWidth={2.2} />
        </div>

        {/* Header Titles */}
        <h2
          style={{
            fontSize: "19px",
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 0 10px 0",
            letterSpacing: "-0.2px",
            lineHeight: "1.3",
          }}
        >
          Copy Trading Access Required
        </h2>

        <p
          style={{
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.65)",
            lineHeight: "1.5",
            margin: "0 0 22px 0",
          }}
        >
          This section is reserved for verified investors. All users are required to obtain an access code from live support to unlock the copy trading page.
        </p>

        {/* Access Code Form */}
        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left", width: "100%" }}>
            <label
              htmlFor="copy-access-code-input"
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.75)",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
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
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="numeric"
              maxLength={20}
              style={{
                width: "100%",
                height: "50px",
                padding: "0 16px",
                background: "#12151c",
                border: error
                  ? "1px solid #ff4757"
                  : isFocused
                  ? "1px solid #4763f0"
                  : "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: error
                  ? "0 0 0 3px rgba(255, 71, 87, 0.18), inset 0 2px 4px rgba(0, 0, 0, 0.3)"
                  : isFocused
                  ? "0 0 0 3px rgba(71, 99, 240, 0.22), inset 0 2px 4px rgba(0, 0, 0, 0.3)"
                  : "inset 0 2px 4px rgba(0, 0, 0, 0.25)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 600,
                letterSpacing: "4px",
                textAlign: "center",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "border-color 0.18s ease, box-shadow 0.18s ease",
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
                boxSizing: "border-box",
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
              height: "48px",
              padding: "0 18px",
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
              boxSizing: "border-box",
              boxShadow: "0 4px 14px rgba(71, 99, 240, 0.3)",
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
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
            Don&apos;t have an access code?
          </span>
          <button
            type="button"
            onClick={handleOpenSupport}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              color: "#ffffff",
              padding: "11px 14px",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "background 0.15s ease, border-color 0.15s ease",
              boxSizing: "border-box",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(71, 99, 240, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <MessageSquare size={15} color="#4763f0" />
            <span>Request code from 24/7 Live Support</span>
          </button>
        </div>
      </div>
    </div>
  );
}
