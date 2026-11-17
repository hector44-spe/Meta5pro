"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, CheckCircle2, ChevronDown, Layers, HelpCircle, History } from "lucide-react";
import { StakingPool, UserStakeRecord } from "@/lib/stakingData";
import { useDashboard } from "@/components/DashboardShell";

export default function StakePage() {
  const router = useRouter();
  const { currentBalance, formatMoney } = useDashboard();

  const [activeTab, setActiveTab] = useState<"pools" | "history" | "how">("pools");
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [userStakes, setUserStakes] = useState<UserStakeRecord[]>([]);
  const [stats, setStats] = useState({
    totalStaked: 0,
    totalCount: 0,
    activeStaked: 0,
    activeCount: 0,
    closedStaked: 0,
    closedCount: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // User Stake Modal State (Image 10)
  const [selectedPoolForStake, setSelectedPoolForStake] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [stakeDuration, setStakeDuration] = useState<number>(1);
  const [stakingSubmitting, setStakingSubmitting] = useState(false);
  const [stakeSuccessMessage, setStakeSuccessMessage] = useState<string | null>(null);
  const [stakeErrorMessage, setStakeErrorMessage] = useState<string | null>(null);

  // Admin Add / Edit Pool Modal State
  const [editingPool, setEditingPool] = useState<StakingPool | null>(null);
  const [isAddPoolOpen, setIsAddPoolOpen] = useState(false);
  const [poolFormData, setPoolFormData] = useState({
    name: "",
    symbol: "",
    min: 1,
    max: 1000,
    cycle: "Daily",
    roi: 84,
  });
  const [adminSaving, setAdminSaving] = useState(false);

  // Fetch pools and user stakes
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staking");
      const data = await res.json();
      if (data.pools) setPools(data.pools);
      if (data.userStakes) setUserStakes(data.userStakes);
      if (data.stats) setStats(data.stats);
      if (typeof data.isAdmin === "boolean") setIsAdmin(data.isAdmin);

      // Check auth status
      const authRes = await fetch("/api/auth/me").catch(() => null);
      if (authRes && authRes.ok) {
        const authData = await authRes.json();
        setIsLoggedIn(!!authData.user);
        if (authData.user?.role === "ADMIN") setIsAdmin(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.error("Failed to load staking data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle open stake modal
  const handleOpenStake = (pool: StakingPool) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/stake`);
      return;
    }
    setSelectedPoolForStake(pool);
    setStakeAmount(String(pool.min));
    setStakeDuration(1);
    setStakeErrorMessage(null);
    setStakeSuccessMessage(null);
  };

  // Submit stake
  const handleConfirmStake = async () => {
    if (!selectedPoolForStake) return;
    const amountNum = parseFloat(stakeAmount);
    if (!amountNum || isNaN(amountNum) || amountNum < selectedPoolForStake.min || amountNum > selectedPoolForStake.max) {
      setStakeErrorMessage(
        `Amount must be between ${selectedPoolForStake.min} and ${selectedPoolForStake.max} ${selectedPoolForStake.symbol}`
      );
      return;
    }

    setStakingSubmitting(true);
    setStakeErrorMessage(null);
    try {
      const res = await fetch("/api/staking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: selectedPoolForStake.id,
          amount: amountNum,
          durationDays: stakeDuration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create stake");

      setStakeSuccessMessage(`Successfully staked ${amountNum} ${selectedPoolForStake.symbol}!`);
      loadData();
      setTimeout(() => {
        setSelectedPoolForStake(null);
        setStakeSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setStakeErrorMessage(err.message || "Failed to stake");
    } finally {
      setStakingSubmitting(false);
    }
  };

  // Admin Save Pool
  const handleSavePool = async () => {
    setAdminSaving(true);
    try {
      const payload = {
        action: "save_pool",
        pool: {
          id: editingPool ? editingPool.id : undefined,
          ...poolFormData,
        },
      };
      const res = await fetch("/api/admin/staking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save pool");

      setEditingPool(null);
      setIsAddPoolOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save pool");
    } finally {
      setAdminSaving(false);
    }
  };

  // Admin Delete Pool
  const handleDeletePool = async (poolId: string) => {
    if (!confirm("Are you sure you want to delete this staking pool?")) return;
    setAdminSaving(true);
    try {
      const res = await fetch("/api/admin/staking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_pool", poolId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete pool");

      setEditingPool(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete pool");
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 20px 48px", color: "#fff" }}>
      {/* Page Title Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <Layers size={18} color="#7189ff" />
        <h1 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#ffffff" }}>Stake</h1>
      </div>

      {/* Top 3 Stat Cards (Matches Images 1 & 8) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.025)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "12px",
            padding: "20px 24px",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            ${stats.totalStaked.toLocaleString()}
          </div>
          <div style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
            Total stakings
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
            {stats.totalCount} Stakings
          </div>
        </div>

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.025)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "12px",
            padding: "20px 24px",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            ${stats.activeStaked.toLocaleString()}
          </div>
          <div style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
            Active stakings
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
            {stats.activeCount} Stakings
          </div>
        </div>

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.025)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "12px",
            padding: "20px 24px",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            ${stats.closedStaked.toLocaleString()}
          </div>
          <div style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
            Closed stakings
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
            {stats.closedCount} Stakings
          </div>
        </div>
      </div>

      {/* Switcher Tabs (Matches Images 1 & 8) */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("pools")}
          style={{
            background: activeTab === "pools" ? "rgba(255, 255, 255, 0.1)" : "transparent",
            color: activeTab === "pools" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
            border: "none",
            borderRadius: "20px",
            padding: "6px 18px",
            fontSize: "13.5px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Pools
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            background: activeTab === "history" ? "rgba(255, 255, 255, 0.1)" : "transparent",
            color: activeTab === "history" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
            border: "none",
            borderRadius: "20px",
            padding: "6px 18px",
            fontSize: "13.5px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Your history
        </button>
        <button
          onClick={() => setActiveTab("how")}
          style={{
            background: activeTab === "how" ? "rgba(255, 255, 255, 0.1)" : "transparent",
            color: activeTab === "how" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
            border: "none",
            borderRadius: "20px",
            padding: "6px 18px",
            fontSize: "13.5px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          How it works
        </button>
      </div>

      {/* TAB 1: POOLS */}
      {activeTab === "pools" && (
        <>
          {/* Pools Subheader with Admin "+ Add pool" button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Pools</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setPoolFormData({ name: "", symbol: "", min: 1, max: 1000, cycle: "Daily", roi: 84 });
                  setIsAddPoolOpen(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#3861fb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Add pool
              </button>
            )}
          </div>

          {/* Staking Pools Grid (Matches Images 1, 2, 8, 9) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {pools.map((pool) => (
              <div
                key={pool.id}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.025)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* Card Top: Coin Icon & Name, Admin Edit button */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={pool.icon || `/assets/coins/${pool.symbol}.svg`}
                        alt={pool.symbol}
                        style={{ width: "36px", height: "36px", objectFit: "contain" }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div>
                        <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#fff" }}>{pool.name}</div>
                        <div style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.5)" }}>{pool.symbol}</div>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingPool(pool);
                          setPoolFormData({
                            name: pool.name,
                            symbol: pool.symbol,
                            min: pool.min,
                            max: pool.max,
                            cycle: pool.cycle,
                            roi: pool.roi,
                          });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#3861fb",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "4px 8px",
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Card Details: Min, Max, Cycle */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Minimum</span>
                      <span style={{ fontWeight: 600, color: "#fff" }}>
                        {pool.min} {pool.symbol}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Maximum</span>
                      <span style={{ fontWeight: 600, color: "#fff" }}>
                        {pool.max} {pool.symbol}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Cycle</span>
                      <span style={{ fontWeight: 600, color: "#fff" }}>{pool.cycle}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Stake Button (Blue) */}
                <button
                  onClick={() => handleOpenStake(pool)}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "#3861fb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  Stake
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === "history" && (
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.025)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)", overflowX: "auto" }}>
          {userStakes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(255, 255, 255, 0.5)" }}>
              <History size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div>No active or past stakings found.</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "rgba(255, 255, 255, 0.5)", textAlign: "left" }}>
                  <th style={{ padding: "14px 16px" }}>Pool</th>
                  <th style={{ padding: "14px 16px" }}>Amount</th>
                  <th style={{ padding: "14px 16px" }}>ROI (%)</th>
                  <th style={{ padding: "14px 16px" }}>Duration</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  <th style={{ padding: "14px 16px" }}>Start Date</th>
                </tr>
              </thead>
              <tbody>
                {userStakes.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{s.poolName} ({s.symbol})</td>
                    <td style={{ padding: "14px 16px" }}>{s.amount} {s.symbol}</td>
                    <td style={{ padding: "14px 16px", color: "#34d399" }}>+{s.roi}%</td>
                    <td style={{ padding: "14px 16px" }}>{s.durationDays} days</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: s.status === "ACTIVE" ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 255, 255, 0.1)",
                          color: s.status === "ACTIVE" ? "#34d399" : "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "rgba(255, 255, 255, 0.5)" }}>
                      {new Date(s.startDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: HOW IT WORKS */}
      {activeTab === "how" && (
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.025)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px" }}>How Staking Works</h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", lineHeight: "1.6" }}>
            Staking allows you to earn passive daily yield by locking your crypto assets in proof-of-stake validation pools.
            Rewards are automatically accrued daily based on the pool&apos;s annualized ROI and returned to your balance upon maturity.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "24px" }}>
            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.03)" }}>
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>1. Select a Pool</div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)" }}>Choose from verified assets like AVAX, ETH, MATIC, SOL, or USDT.</div>
            </div>
            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.03)" }}>
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>2. Specify Amount</div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)" }}>Enter an amount between the pool&apos;s minimum and maximum limit.</div>
            </div>
            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.03)" }}>
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>3. Receive Yield</div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)" }}>Daily returns are calculated and deposited directly to your portfolio.</div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== USER STAKE MODAL (Matches Image 10) ===================== */}
      {selectedPoolForStake && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100005,
            padding: "16px",
          }}
          onClick={() => setSelectedPoolForStake(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#16181d",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 24px 50px rgba(0, 0, 0, 0.8)",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Stake {selectedPoolForStake.symbol}</h3>
              <button
                onClick={() => setSelectedPoolForStake(null)}
                style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.5)", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {stakeErrorMessage && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(255, 59, 78, 0.12)", border: "1px solid rgba(255, 59, 78, 0.3)", borderRadius: "8px", color: "#ff3b4e", fontSize: "13px", marginBottom: "16px" }}>
                {stakeErrorMessage}
              </div>
            )}
            {stakeSuccessMessage && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.3)", borderRadius: "8px", color: "#34d399", fontSize: "13px", marginBottom: "16px" }}>
                {stakeSuccessMessage}
              </div>
            )}

            {/* Field 1: Amount */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "6px" }}>Amount:</label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "0 64px 0 14px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {selectedPoolForStake.symbol}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
                Current {selectedPoolForStake.symbol} balance: 0 {selectedPoolForStake.symbol}
              </div>
            </div>

            {/* Field 2: Duration Dropdown */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "6px" }}>Duration:</label>
              <select
                value={stakeDuration}
                onChange={(e) => setStakeDuration(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "44px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "0 14px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <option value={1} style={{ background: "#16181d", color: "#fff" }}>1 day</option>
                <option value={7} style={{ background: "#16181d", color: "#fff" }}>7 days</option>
                <option value={14} style={{ background: "#16181d", color: "#fff" }}>14 days</option>
                <option value={30} style={{ background: "#16181d", color: "#fff" }}>30 days</option>
                <option value={60} style={{ background: "#16181d", color: "#fff" }}>60 days</option>
                <option value={90} style={{ background: "#16181d", color: "#fff" }}>90 days</option>
              </select>
            </div>

            {/* Field 3: ROI */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "6px" }}>ROI:</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  readOnly
                  value={`${selectedPoolForStake.roi}`}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "0 34px 0 14px",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  %
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleConfirmStake}
              disabled={stakingSubmitting}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "#3861fb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: stakingSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {stakingSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Stake"}
            </button>
          </div>
        </div>
      )}

      {/* ===================== ADMIN ADD / EDIT POOL MODAL ===================== */}
      {(isAddPoolOpen || editingPool) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100005,
            padding: "16px",
          }}
          onClick={() => {
            setIsAddPoolOpen(false);
            setEditingPool(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#16181d",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 24px 50px rgba(0, 0, 0, 0.8)",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                {editingPool ? "Edit Staking Pool" : "Add Staking Pool"}
              </h3>
              <button
                onClick={() => {
                  setIsAddPoolOpen(false);
                  setEditingPool(null);
                }}
                style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.5)", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                  Pool Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Avalanche"
                  value={poolFormData.name}
                  onChange={(e) => setPoolFormData({ ...poolFormData, name: e.target.value })}
                  style={{
                    width: "100%",
                    height: "40px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "0 12px",
                    color: "#fff",
                    fontSize: "13.5px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                  Symbol:
                </label>
                <input
                  type="text"
                  placeholder="e.g. AVAX"
                  value={poolFormData.symbol}
                  onChange={(e) => setPoolFormData({ ...poolFormData, symbol: e.target.value.toUpperCase() })}
                  style={{
                    width: "100%",
                    height: "40px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "0 12px",
                    color: "#fff",
                    fontSize: "13.5px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                    Minimum:
                  </label>
                  <input
                    type="number"
                    value={poolFormData.min}
                    onChange={(e) => setPoolFormData({ ...poolFormData, min: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      height: "40px",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "0 12px",
                      color: "#fff",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                    Maximum:
                  </label>
                  <input
                    type="number"
                    value={poolFormData.max}
                    onChange={(e) => setPoolFormData({ ...poolFormData, max: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      height: "40px",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "0 12px",
                      color: "#fff",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                    Cycle:
                  </label>
                  <input
                    type="text"
                    value={poolFormData.cycle}
                    onChange={(e) => setPoolFormData({ ...poolFormData, cycle: e.target.value })}
                    style={{
                      width: "100%",
                      height: "40px",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "0 12px",
                      color: "#fff",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                    ROI (%):
                  </label>
                  <input
                    type="number"
                    value={poolFormData.roi}
                    onChange={(e) => setPoolFormData({ ...poolFormData, roi: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      height: "40px",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "0 12px",
                      color: "#fff",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              {editingPool && (
                <button
                  type="button"
                  onClick={() => handleDeletePool(editingPool.id)}
                  disabled={adminSaving}
                  style={{
                    height: "40px",
                    padding: "0 14px",
                    backgroundColor: "rgba(255, 59, 78, 0.12)",
                    border: "1px solid rgba(255, 59, 78, 0.25)",
                    borderRadius: "8px",
                    color: "#ff3b4e",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Delete pool
                </button>
              )}
              <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPoolOpen(false);
                    setEditingPool(null);
                  }}
                  style={{
                    height: "40px",
                    padding: "0 14px",
                    background: "none",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePool}
                  disabled={adminSaving}
                  style={{
                    height: "40px",
                    padding: "0 18px",
                    backgroundColor: "#3861fb",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: adminSaving ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {adminSaving ? <Loader2 size={14} className="animate-spin" /> : "Save pool"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
