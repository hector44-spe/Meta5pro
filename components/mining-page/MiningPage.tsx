"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Eye, EyeOff, Cpu, History, Zap, ShieldCheck } from "lucide-react";
import { MiningPool, UserMiningRecord } from "@/lib/miningData";
import { useDashboard } from "@/components/DashboardShell";
import { usePrices } from "@/lib/usePrices";
import { useHoldings } from "@/lib/useHoldings";

export default function MiningPage() {
  const router = useRouter();
  const { currentBalance, realBalance, formatMoney, refreshBalance } = useDashboard();
  const { prices } = usePrices();
  const { holdings, refresh: refreshHoldings } = useHoldings();

  const [activeTab, setActiveTab] = useState<"pools" | "history" | "how">("pools");
  const [pools, setPools] = useState<MiningPool[]>([]);
  const [userMinings, setUserMinings] = useState<UserMiningRecord[]>([]);
  const [useMinerPictures, setUseMinerPictures] = useState(true);
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
  const [mineDuration, setMineDuration] = useState<number>(30);
  const [fundingSource, setFundingSource] = useState<"CASH" | "COIN">("CASH");
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
    min: 0.01,
    max: 10,
    roi: 100,
    cycle: "Daily",
    hashrate: "18,036,473 GH/s",
    hardwareImage: "/assets/coins/l9.png",
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
      if (typeof data.useMinerPictures === "boolean") setUseMinerPictures(data.useMinerPictures);
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
    setMineDuration(30);
    setFundingSource("CASH");
    setMineErrorMessage(null);
    setMineSuccessMessage(null);
  };

  const activePoolSymbol = selectedPoolForMine?.symbol?.toUpperCase() || "BTC";
  const livePrice = prices[activePoolSymbol] || (activePoolSymbol === "BTC" ? 65000 : 0);
  const userCashBalance = Number(realBalance ?? currentBalance ?? 0);
  const userCoinHolding = Number(holdings.find((h) => h.symbol.toUpperCase() === activePoolSymbol)?.units ?? 0);

  const amountNum = parseFloat(mineAmount) || 0;
  const estimatedUsdCost = livePrice > 0 ? amountNum * livePrice : amountNum;
  const dailyYieldCoin = selectedPoolForMine ? (amountNum * (selectedPoolForMine.roi / 100)) / 365 : 0;
  const totalYieldCoin = dailyYieldCoin * mineDuration;
  const totalReturnCoin = amountNum + totalYieldCoin;
  const totalYieldUsd = livePrice > 0 ? totalYieldCoin * livePrice : totalYieldCoin;
  const totalReturnUsd = livePrice > 0 ? totalReturnCoin * livePrice : totalReturnCoin;

  const handleConfirmMine = async () => {
    if (!selectedPoolForMine) return;
    if (!amountNum || isNaN(amountNum) || amountNum < selectedPoolForMine.min || amountNum > selectedPoolForMine.max) {
      setMineErrorMessage(
        `Amount must be between ${selectedPoolForMine.min} and ${selectedPoolForMine.max} ${selectedPoolForMine.symbol}`
      );
      return;
    }

    if (fundingSource === "COIN" && userCoinHolding < amountNum) {
      setMineErrorMessage(
        `Insufficient ${selectedPoolForMine.symbol} balance. You hold ${userCoinHolding} ${selectedPoolForMine.symbol}. Switch to Pay with USD Cash or deposit.`
      );
      return;
    }

    if (fundingSource === "CASH" && userCashBalance < estimatedUsdCost) {
      setMineErrorMessage(
        `Insufficient USD Cash balance. Required: $${estimatedUsdCost.toFixed(2)}, Available: $${userCashBalance.toFixed(2)}. Please deposit.`
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
          fundingSource,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start mining");

      setMineSuccessMessage(`Successfully joined ${selectedPoolForMine.name} with ${amountNum} ${selectedPoolForMine.symbol}!`);
      loadData();
      refreshBalance();
      refreshHoldings();
      setTimeout(() => {
        setSelectedPoolForMine(null);
        setMineSuccessMessage(null);
      }, 1600);
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
      {/* Top Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Cpu size={18} color="#7189ff" />
          <h1 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#ffffff" }}>Mining</h1>
        </div>
        <button
          onClick={() => setHideBalance(!hideBalance)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.4)",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
          title={hideBalance ? "Show balance" : "Hide balance"}
        >
          {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Top 3 Stat Cards */}
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
            {hideBalance ? "••••••" : `$${stats.totalMined.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
            Total value mined
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
            {stats.totalCount} Hash contracts
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
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#34d399", lineHeight: 1.1 }}>
            {hideBalance ? "••••••" : `$${stats.activeMined.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
            Active cloud hashrate
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
            {stats.activeCount} Active rigs ({stats.totalHashrate})
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
            {hideBalance ? "••••••" : `$${stats.closedMined.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
            Completed contracts
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
            {stats.closedCount} Matured contracts
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
          Mining pools
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
          Your history ({userMinings.length})
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
            <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Available Mining Pools</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setPoolFormData({
                    name: "",
                    symbol: "BTC",
                    badge: "BTC Pool",
                    min: 0.01,
                    max: 10,
                    roi: 100,
                    cycle: "Daily",
                    hashrate: "18,036,473 GH/s",
                    hardwareImage: "/assets/coins/l9.png",
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {pools.map((pool) => {
              const poolPrice = prices[pool.symbol.toUpperCase()] || 0;
              return (
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
                    {/* Hardware Image Container (Controlled by useMinerPictures setting) */}
                    {useMinerPictures ? (
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
                                hardwareImage: pool.hardwareImage || "/assets/coins/l9.png",
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
                    ) : (
                      /* Clean Modern Card Header when useMinerPictures is disabled */
                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={pool.icon || `/dashboard_files/${pool.symbol.toUpperCase()}.svg`}
                            alt={pool.symbol}
                            style={{ width: "32px", height: "32px" }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{pool.name}</div>
                            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>{pool.hashrate}</div>
                          </div>
                        </div>
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
                                hardwareImage: pool.hardwareImage || "/assets/coins/l9.png",
                              });
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#3861fb",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}

                    {/* Card Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <img
                          src={pool.icon || `/dashboard_files/${pool.symbol.toUpperCase()}.svg`}
                          alt={pool.symbol}
                          width={18}
                          height={18}
                        />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)" }}>
                          {pool.badge || `${pool.symbol} Pool`}
                        </span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{pool.name}</span>
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
                        <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)", marginTop: "2px" }}>Annual ROI</div>
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

                  {/* Hashrate & Action */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "14px" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Dedicated Hashrate:</span>
                      <span style={{ color: "#3861fb", fontWeight: 600 }}>{pool.hashrate}</span>
                    </div>

                    <button
                      onClick={() => handleOpenMine(pool)}
                      style={{
                        width: "100%",
                        height: "44px",
                        backgroundColor: "#3861fb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Zap size={15} /> Join Mining Pool
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === "history" && (
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.025)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)", overflowX: "auto" }}>
          {userMinings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(255, 255, 255, 0.5)" }}>
              <History size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div>No cloud mining contracts found.</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "rgba(255, 255, 255, 0.5)", textAlign: "left" }}>
                  <th style={{ padding: "14px 16px" }}>Pool / Miner</th>
                  <th style={{ padding: "14px 16px" }}>Invested Amount</th>
                  <th style={{ padding: "14px 16px" }}>Expected Return</th>
                  <th style={{ padding: "14px 16px" }}>Accrued Profit</th>
                  <th style={{ padding: "14px 16px" }}>Duration</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  <th style={{ padding: "14px 16px" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {userMinings.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{m.poolName}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600 }}>{m.amount} {m.symbol}</div>
                      <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.45)" }}>
                        ~${m.usdValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#34d399", fontWeight: 600 }}>
                      ${m.expectedReturnUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)" }}>+{m.roi}% ROI</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#34d399", fontWeight: 600 }}>
                      +${m.accruedProfitUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div>{m.durationDays} days</div>
                      <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.45)" }}>
                        {m.daysRemaining}d left
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor:
                            m.status === "ACTIVE"
                              ? "rgba(52, 211, 153, 0.15)"
                              : m.status === "COMPLETED"
                              ? "rgba(56, 97, 251, 0.15)"
                              : "rgba(255, 255, 255, 0.08)",
                          color:
                            m.status === "ACTIVE"
                              ? "#34d399"
                              : m.status === "COMPLETED"
                              ? "#3861fb"
                              : "rgba(255, 255, 255, 0.6)",
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Cpu size={22} color="#7189ff" />
                <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Join {selectedPoolForMine.name}</h3>
              </div>
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

            {/* Funding Source Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "6px" }}>
                Funding Source:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setFundingSource("CASH")}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: fundingSource === "CASH" ? "1px solid #3861fb" : "1px solid rgba(255, 255, 255, 0.08)",
                    backgroundColor: fundingSource === "CASH" ? "rgba(56, 97, 251, 0.15)" : "rgba(255, 255, 255, 0.02)",
                    color: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>USD Cash</div>
                  <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                    ${userCashBalance.toFixed(2)}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFundingSource("COIN")}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: fundingSource === "COIN" ? "1px solid #3861fb" : "1px solid rgba(255, 255, 255, 0.08)",
                    backgroundColor: fundingSource === "COIN" ? "rgba(56, 97, 251, 0.15)" : "rgba(255, 255, 255, 0.02)",
                    color: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>{selectedPoolForMine.symbol} Holding</div>
                  <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                    {userCoinHolding} {selectedPoolForMine.symbol}
                  </div>
                </button>
              </div>
            </div>

            {/* Field: Amount */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>Mining Allocation:</label>
                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.45)" }}>
                  {livePrice > 0 ? `1 ${selectedPoolForMine.symbol} = $${livePrice.toLocaleString()}` : ""}
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  step="any"
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
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "6px" }}>
                <span>Min: {selectedPoolForMine.min} | Max: {selectedPoolForMine.max}</span>
                <span style={{ color: "#3861fb", fontWeight: 600 }}>
                  Est. Cost: ${estimatedUsdCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* Field: Duration */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "6px" }}>
                Contract Duration:
              </label>
              <select
                value={mineDuration}
                onChange={(e) => setMineDuration(Number(e.target.value))}
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
                <option value={1} style={{ background: "#16181d", color: "#fff" }}>1 day (Quick test)</option>
                <option value={7} style={{ background: "#16181d", color: "#fff" }}>7 days (1 week)</option>
                <option value={14} style={{ background: "#16181d", color: "#fff" }}>14 days (2 weeks)</option>
                <option value={30} style={{ background: "#16181d", color: "#fff" }}>30 days (1 month)</option>
                <option value={60} style={{ background: "#16181d", color: "#fff" }}>60 days (2 months)</option>
                <option value={90} style={{ background: "#16181d", color: "#fff" }}>90 days (3 months)</option>
                <option value={180} style={{ background: "#16181d", color: "#fff" }}>180 days (6 months)</option>
                <option value={365} style={{ background: "#16181d", color: "#fff" }}>365 days (1 year)</option>
              </select>
            </div>

            {/* Expected Return Card */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Hardware Hashrate:</span>
                <span style={{ color: "#3861fb", fontWeight: 700 }}>{selectedPoolForMine.hashrate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Annualized ROI:</span>
                <span style={{ color: "#34d399", fontWeight: 700 }}>+{selectedPoolForMine.roi}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Est. Daily Profit:</span>
                <span style={{ color: "#34d399", fontWeight: 600 }}>
                  +{dailyYieldCoin.toFixed(6)} {selectedPoolForMine.symbol}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Total Profit ({mineDuration}d):</span>
                <span style={{ color: "#34d399", fontWeight: 700 }}>
                  +${totalYieldUsd.toFixed(2)} USD
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "8px", marginTop: "2px" }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>Total Return at Maturity:</span>
                <span style={{ color: "#fff", fontWeight: 700 }}>
                  ${totalReturnUsd.toFixed(2)} USD ({totalReturnCoin.toFixed(4)} {selectedPoolForMine.symbol})
                </span>
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
                  placeholder="e.g. BitMiner Ultra"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                    Symbol:
                  </label>
                  <input
                    type="text"
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
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                  Hardware Image URL:
                </label>
                <input
                  type="text"
                  placeholder="/assets/coins/l9.png"
                  value={poolFormData.hardwareImage}
                  onChange={(e) => setPoolFormData({ ...poolFormData, hardwareImage: e.target.value })}
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
                    Min:
                  </label>
                  <input
                    type="number"
                    value={poolFormData.min}
                    onChange={(e) => setPoolFormData({ ...poolFormData, min: parseFloat(e.target.value) || 0 })}
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
                    Max:
                  </label>
                  <input
                    type="number"
                    value={poolFormData.max}
                    onChange={(e) => setPoolFormData({ ...poolFormData, max: parseFloat(e.target.value) || 0 })}
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
                    Annual ROI (%):
                  </label>
                  <input
                    type="number"
                    value={poolFormData.roi}
                    onChange={(e) => setPoolFormData({ ...poolFormData, roi: parseFloat(e.target.value) || 0 })}
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

            <div style={{ display: "flex", gap: "10px" }}>
              {editingPool && (
                <button
                  onClick={() => handleDeletePool(editingPool.id)}
                  disabled={adminSaving}
                  style={{
                    height: "42px",
                    padding: "0 16px",
                    backgroundColor: "rgba(255, 59, 78, 0.15)",
                    color: "#ff3b4e",
                    border: "1px solid rgba(255, 59, 78, 0.3)",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSavePool}
                disabled={adminSaving}
                style={{
                  flex: 1,
                  height: "42px",
                  backgroundColor: "#3861fb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: adminSaving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {adminSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Mining Pool"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
