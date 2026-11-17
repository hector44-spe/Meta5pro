"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Eye, EyeOff, Cpu, History } from "lucide-react";
import { MiningPool, UserMiningRecord } from "@/lib/miningData";

export default function MiningPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"pools" | "history" | "how">("pools");
  const [pools, setPools] = useState<MiningPool[]>([]);
  const [userMinings, setUserMinings] = useState<UserMiningRecord[]>([]);
  const [stats, setStats] = useState({
    totalMined: 0,
    totalCount: 0,
    activeMined: 0,
    activeCount: 0,
    closedMined: 0,
    closedCount: 0,
    totalHashrate: "18,036,473 GH/s",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  // User Mining Modal
  const [selectedPoolForMine, setSelectedPoolForMine] = useState<MiningPool | null>(null);
  const [mineAmount, setMineAmount] = useState<string>("");
  const [mineDuration, setMineDuration] = useState<number>(1);
  const [mineSubmitting, setMineSubmitting] = useState(false);
  const [mineSuccessMessage, setMineSuccessMessage] = useState<string | null>(null);
  const [mineErrorMessage, setMineErrorMessage] = useState<string | null>(null);

  // Admin Add / Edit Pool Modal
  const [editingPool, setEditingPool] = useState<MiningPool | null>(null);
  const [isAddPoolOpen, setIsAddPoolOpen] = useState(false);
  const [poolFormData, setPoolFormData] = useState({
    name: "",
    symbol: "BTC",
    badge: "BTC Pool",
    min: 1,
    max: 10,
    roi: 100,
    cycle: "Daily",
    hashrate: "18,036,473 GH/s",
  });
  const [adminSaving, setAdminSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mining");
      const data = await res.json();
      if (data.pools) setPools(data.pools);
      if (data.userMinings) setUserMinings(data.userMinings);
      if (data.stats) setStats(data.stats);
      if (typeof data.isAdmin === "boolean") setIsAdmin(data.isAdmin);

      const authRes = await fetch("/api/auth/me").catch(() => null);
      if (authRes && authRes.ok) {
        const authData = await authRes.json();
        setIsLoggedIn(!!authData.user);
        if (authData.user?.role === "ADMIN") setIsAdmin(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.error("Failed to load mining data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenMine = (pool: MiningPool) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/mining`);
      return;
    }
    setSelectedPoolForMine(pool);
    setMineAmount(String(pool.min));
    setMineDuration(1);
    setMineErrorMessage(null);
    setMineSuccessMessage(null);
  };

  const handleConfirmMine = async () => {
    if (!selectedPoolForMine) return;
    const amountNum = parseFloat(mineAmount);
    if (!amountNum || isNaN(amountNum) || amountNum < selectedPoolForMine.min || amountNum > selectedPoolForMine.max) {
      setMineErrorMessage(
        `Amount must be between ${selectedPoolForMine.min} and ${selectedPoolForMine.max} ${selectedPoolForMine.symbol}`
      );
      return;
    }

    setMineSubmitting(true);
    setMineErrorMessage(null);
    try {
      const res = await fetch("/api/mining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: selectedPoolForMine.id,
          amount: amountNum,
          durationDays: mineDuration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start mining");

      setMineSuccessMessage(`Successfully joined ${selectedPoolForMine.name} with ${amountNum} ${selectedPoolForMine.symbol}!`);
      loadData();
      setTimeout(() => {
        setSelectedPoolForMine(null);
        setMineSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setMineErrorMessage(err.message || "Failed to start mining");
    } finally {
      setMineSubmitting(false);
    }
  };

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
      const res = await fetch("/api/admin/mining", {
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

  const handleDeletePool = async (poolId: string) => {
    if (!confirm("Are you sure you want to delete this mining pool?")) return;
    setAdminSaving(true);
    try {
      const res = await fetch("/api/admin/mining", {
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
      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <Cpu size={18} color="#7189ff" />
        <h1 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#ffffff" }}>Mining</h1>
      </div>

      {/* Top 3 Stat Cards (Matches Images 4, 5 & Replica) */}
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)" }}>Your total minings</span>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.5)", cursor: "pointer", padding: 0 }}
            >
              {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            {hideBalance ? "••••••" : `$${stats.totalMined.toLocaleString()}`}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "4px" }}>
            {stats.totalCount} active contracts
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
          <div style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "8px" }}>Cycle</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Daily</div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "4px" }}>
            Active: {stats.activeCount} | Closed: {stats.closedCount}
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
          <div style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "8px" }}>Total Hashrate</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#34d399", lineHeight: 1.1 }}>
            {stats.totalHashrate}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "4px" }}>
            Network Status: 100% Operational
          </div>
        </div>
      </div>

      {/* Switcher Tabs */}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Mining pools</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setPoolFormData({
                    name: "",
                    symbol: "BTC",
                    badge: "BTC Pool",
                    min: 1,
                    max: 10,
                    roi: 100,
                    cycle: "Daily",
                    hashrate: "18,036,473 GH/s",
                  });
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

          {/* Mining Pools Grid (Matches Images 4, 5 & Replica) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
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
                  position: "relative",
                }}
              >
                <div>
                  {/* Hardware Image Container */}
                  <div
                    style={{
                      width: "100%",
                      height: "190px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                      position: "relative",
                    }}
                  >
                    <img
                      src={pool.hardwareImage || "/assets/coins/l9.png"}
                      alt={pool.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingPool(pool);
                          setPoolFormData({
                            name: pool.name,
                            symbol: pool.symbol,
                            badge: pool.badge,
                            min: pool.min,
                            max: pool.max,
                            roi: pool.roi,
                            cycle: pool.cycle,
                            hashrate: pool.hashrate,
                          });
                        }}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "rgba(0, 0, 0, 0.7)",
                          backdropFilter: "blur(4px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "6px",
                          color: "#3861fb",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "4px 10px",
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Card Header: BTC Pool Badge & Miner Name */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <img src={pool.icon || "/assets/coins/BTC.svg"} alt="BTC" width={18} height={18} />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)" }}>
                        {pool.badge || "BTC Pool"}
                      </span>
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{pool.name}</span>
                  </div>

                  {/* Details: ROI, Min, Max */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "8px",
                      padding: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      borderRadius: "10px",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#34d399" }}>{pool.roi}%</div>
                      <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)", marginTop: "2px" }}>ROI</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{pool.min} {pool.symbol}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)", marginTop: "2px" }}>Minimum</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{pool.max} {pool.symbol}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)", marginTop: "2px" }}>Maximum</div>
                    </div>
                  </div>
                </div>

                {/* Choose this pool button */}
                <button
                  onClick={() => handleOpenMine(pool)}
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
                  }}
                >
                  Choose this pool
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === "history" && (
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.025)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)", overflowX: "auto" }}>
          {userMinings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(255, 255, 255, 0.5)" }}>
              <History size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div>No mining contracts found.</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "rgba(255, 255, 255, 0.5)", textAlign: "left" }}>
                  <th style={{ padding: "14px 16px" }}>Pool Name</th>
                  <th style={{ padding: "14px 16px" }}>Invested</th>
                  <th style={{ padding: "14px 16px" }}>ROI (%)</th>
                  <th style={{ padding: "14px 16px" }}>Duration</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  <th style={{ padding: "14px 16px" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {userMinings.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{m.poolName}</td>
                    <td style={{ padding: "14px 16px" }}>{m.amount} {m.symbol}</td>
                    <td style={{ padding: "14px 16px", color: "#34d399" }}>+{m.roi}%</td>
                    <td style={{ padding: "14px 16px" }}>{m.durationDays} days</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: m.status === "ACTIVE" ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 255, 255, 0.1)",
                          color: m.status === "ACTIVE" ? "#34d399" : "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "rgba(255, 255, 255, 0.5)" }}>
                      {new Date(m.startDate).toLocaleDateString()}
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
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px" }}>How Cloud Mining Works</h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", lineHeight: "1.6" }}>
            Our enterprise cloud mining clusters allocate dedicated ASIC hashpower towards institutional Bitcoin mining operations.
            Zero hardware maintenance or electricity overhead — payouts are credited daily directly to your wallet based on your hashshare.
          </p>
        </div>
      )}

      {/* ===================== USER MINING MODAL ===================== */}
      {selectedPoolForMine && (
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
          onClick={() => setSelectedPoolForMine(null)}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Join {selectedPoolForMine.name}</h3>
              <button
                onClick={() => setSelectedPoolForMine(null)}
                style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.5)", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {mineErrorMessage && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(255, 59, 78, 0.12)", border: "1px solid rgba(255, 59, 78, 0.3)", borderRadius: "8px", color: "#ff3b4e", fontSize: "13px", marginBottom: "16px" }}>
                {mineErrorMessage}
              </div>
            )}
            {mineSuccessMessage && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.3)", borderRadius: "8px", color: "#34d399", fontSize: "13px", marginBottom: "16px" }}>
                {mineSuccessMessage}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "6px" }}>Amount:</label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  value={mineAmount}
                  onChange={(e) => setMineAmount(e.target.value)}
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
                  {selectedPoolForMine.symbol}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
                Min: {selectedPoolForMine.min} {selectedPoolForMine.symbol} | Max: {selectedPoolForMine.max} {selectedPoolForMine.symbol}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "6px" }}>Expected Return ROI:</label>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#34d399" }}>
                {selectedPoolForMine.roi}% Annualized
              </div>
            </div>

            <button
              onClick={handleConfirmMine}
              disabled={mineSubmitting}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "#3861fb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: mineSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {mineSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Start Mining"}
            </button>
          </div>
        </div>
      )}

      {/* ===================== ADMIN ADD / EDIT MINING POOL MODAL ===================== */}
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
                {editingPool ? "Edit Mining Pool" : "Add Mining Pool"}
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
                  Miner / Pool Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. BitMiner"
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
                  Badge:
                </label>
                <input
                  type="text"
                  placeholder="e.g. BTC Pool"
                  value={poolFormData.badge}
                  onChange={(e) => setPoolFormData({ ...poolFormData, badge: e.target.value })}
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
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                    Hashrate:
                  </label>
                  <input
                    type="text"
                    value={poolFormData.hashrate}
                    onChange={(e) => setPoolFormData({ ...poolFormData, hashrate: e.target.value })}
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
