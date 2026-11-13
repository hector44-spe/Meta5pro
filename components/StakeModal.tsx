"use client";

import React, { useState, useEffect } from "react";
import { X, Check, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";

interface PlanItem {
  id: string;
  name: string;
  minDeposit: number;
  maxDeposit: number;
  dailyRoiPercentage: number;
  durationDays: number;
  capitalRefund: boolean;
  isActive: boolean;
}

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function StakeModal({ isOpen, onClose, onSuccess }: StakeModalProps) {
  const { currentBalance, refreshBalance } = useDashboard();
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [amount, setAmount] = useState<string>("500");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSuccessMsg("");
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/investments/plans");
      if (res.ok) {
        const data = await res.json();
        if (data.plans) {
          setPlans(data.plans);
          if (data.plans.length > 0) {
            setSelectedPlan(data.plans[0]);
            setAmount(String(data.plans[0].minDeposit));
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch plans:", e);
    }
  };

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const dailyYield = selectedPlan ? (numAmount * (selectedPlan.dailyRoiPercentage / 100)) : 0;
  const totalReturn = selectedPlan ? (dailyYield * selectedPlan.durationDays) : 0;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setErrorMsg("");

    if (numAmount < selectedPlan.minDeposit) {
      setErrorMsg(`Minimum investment for ${selectedPlan.name} is $${selectedPlan.minDeposit.toLocaleString()}`);
      return;
    }
    if (numAmount > selectedPlan.maxDeposit) {
      setErrorMsg(`Maximum investment for ${selectedPlan.name} is $${selectedPlan.maxDeposit.toLocaleString()}`);
      return;
    }
    if (numAmount > currentBalance) {
      setErrorMsg(`Insufficient funds. Your available balance is $${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/investments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: numAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Subscription failed");
      } else {
        setSuccessMsg(data.message);
        if (refreshBalance) refreshBalance();
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch {
      setErrorMsg("Network error placing investment subscription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          backgroundColor: "#14171d",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "24px",
          color: "#fff",
          position: "relative",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={20} color="#3b82f6" />
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Stake &amp; Earn Yield</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
          >
            <X size={19} />
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", margin: "0 0 16px 0", lineHeight: 1.45 }}>
          Allocate your capital to an automated quantitative yield strategy. Daily returns accrue automatically.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              fontSize: "12px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              fontSize: "12px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Plan Tiers Selection */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.8)", display: "block", marginBottom: "8px" }}>
            Select yield tier:
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {plans.map((p) => {
              const isSelected = selectedPlan?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlan(p);
                    setAmount(String(p.minDeposit));
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.08)",
                    backgroundColor: isSelected ? "rgba(59, 130, 246, 0.08)" : "#1a1e26",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: isSelected ? "#fff" : "#e2e8f0" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                      Min: ${p.minDeposit.toLocaleString()} • Term: {p.durationDays} Days
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#10b981", fontWeight: 700, fontSize: "14px" }}>
                      +{p.dailyRoiPercentage}% / day
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      Capital returned: Yes
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <form onSubmit={handleSubscribe}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
                Stake amount ($ USD):
              </label>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                Available: <span style={{ color: "#38bdf8", fontWeight: 600 }}>${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#1a1e26",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "4px 12px",
              }}
            >
              <input
                type="number"
                step="any"
                min={selectedPlan?.minDeposit || 100}
                max={selectedPlan?.maxDeposit || 100000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "8px 0",
                }}
              />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                USD
              </span>
            </div>
          </div>

          {/* Projections Card */}
          <div
            style={{
              padding: "14px",
              borderRadius: "8px",
              backgroundColor: "#101217",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-around",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>Daily profit</div>
              <div style={{ color: "#10b981", fontWeight: 700, fontSize: "15px" }}>
                +${dailyYield.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>Total yield return</div>
              <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "15px" }}>
                +${totalReturn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              height: "44px",
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Confirming subscription...</span>
              </>
            ) : (
              "Confirm & lock capital"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
