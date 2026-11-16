"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  FileUp,
  WandSparkles,
  Loader2,
  Trash2,
  Check,
} from "lucide-react";
import type { CopyExpert } from "@/types/copy-trading";

interface AdminEditExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: CopyExpert | null;
  onSaved: () => void;
  onRequestDelete?: (expert: CopyExpert) => void;
}

export default function AdminEditExpertModal({
  isOpen,
  onClose,
  expert,
  onSaved,
  onRequestDelete,
}: AdminEditExpertModalProps) {
  const isEditing = Boolean(expert && expert.id);

  // Modal Step State: 1 = Details, 2 = Stats, 3 = Settings
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields - Step 1: Details
  const [name, setName] = useState(expert?.name || "");
  const [username, setUsername] = useState(expert?.username || "");
  const [picture, setPicture] = useState(expert?.picture || "");
  const [badge, setBadge] = useState("");
  const [bio, setBio] = useState(expert?.bio || "");
  const [tickType, setTickType] = useState<"gold" | "blue" | "none">(
    expert?.tickType || "none"
  );

  // Form Fields - Step 2: Stats
  const [winRate, setWinRate] = useState(expert?.winRate?.toString() || "92");
  const [profitShare, setProfitShare] = useState(
    expert?.profitShare?.toString() || "15"
  );
  const [wins, setWins] = useState(expert?.wins?.toString() || "6988");
  const [losses, setLosses] = useState(expert?.losses?.toString() || "11");
  const [tradesCount, setTradesCount] = useState(
    expert?.tradesCount?.toString() || "6999"
  );
  const [followers, setFollowers] = useState(
    expert?.followers?.toString() || "13800"
  );

  // Form Fields - Step 3: Settings
  const [useMinimumStartup, setUseMinimumStartup] = useState(true);
  const [minimumStartUp, setMinimumStartUp] = useState(
    expert?.minimumStartUp?.toString() || "1000"
  );
  const [autoGenerateTrades, setAutoGenerateTrades] = useState(true);

  // Loading & Error States
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Inputs
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const badgeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (expert) {
      setStep(1);
      setName(expert.name || "");
      setUsername(expert.username || "");
      setPicture(expert.picture || "/assets/copy-trading/albania_support.png");
      setBio(expert.bio || "");
      setTickType(expert.tickType || "gold");
      setWinRate(expert.winRate?.toString() || "92");
      setProfitShare(expert.profitShare?.toString() || "15");
      setWins(expert.wins?.toString() || "6988");
      setLosses(expert.losses?.toString() || "11");
      setTradesCount(expert.tradesCount?.toString() || "6999");
      setFollowers(expert.followers?.toString() || "13800");
      setMinimumStartUp(expert.minimumStartUp?.toString() || "1000");
      setUseMinimumStartup(Boolean(expert.minimumStartUp && expert.minimumStartUp > 0));
    } else {
      setStep(1);
      setName("");
      setUsername("");
      setPicture("");
      setBadge("");
      setBio("");
      setTickType("none");
      setWinRate("90");
      setProfitShare("15");
      setWins("1000");
      setLosses("10");
      setTradesCount("1010");
      setFollowers("5000");
      setMinimumStartUp("1000");
      setUseMinimumStartup(true);
      setAutoGenerateTrades(true);
    }
    setError(null);
  }, [expert, isOpen]);

  if (!isOpen) return null;

  // Handle Image Upload locally with object URL preview
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPicture(url);
    }
  };

  const handleBadgeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBadge(url);
    }
  };

  // Step 2: Auto Fill generator
  const handleAutoFill = () => {
    setAutoFilling(true);
    setTimeout(() => {
      const generatedWinRate = (Math.random() * 20 + 80).toFixed(0);
      const generatedProfitShare = (Math.random() * 15 + 10).toFixed(0);
      const generatedWins = Math.floor(Math.random() * 8000) + 500;
      const generatedLosses = Math.floor(Math.random() * 200) + 5;
      const generatedTrades = generatedWins + generatedLosses;
      const generatedFollowers = Math.floor(Math.random() * 50000) + 1000;

      setWinRate(generatedWinRate);
      setProfitShare(generatedProfitShare);
      setWins(generatedWins.toString());
      setLosses(generatedLosses.toString());
      setTradesCount(generatedTrades.toString());
      setFollowers(generatedFollowers.toString());
      setAutoFilling(false);
    }, 600);
  };

  // Step 3: Final Save
  const handleSaveExpert = async () => {
    setSaving(true);
    setError(null);

    const payload: Partial<CopyExpert> & { expertId?: string } = {
      expertId: expert?.id || expert?.ref || `expert_${Date.now()}`,
      ref: expert?.ref || expert?.id || `expert_${Date.now()}`,
      name: name.trim(),
      username: username.trim(),
      bio: bio.trim(),
      picture: picture.trim() || "/assets/copy-trading/albania_support.png",
      winRate: Number(winRate) || 0,
      profitShare: Number(profitShare) || 0,
      wins: Number(wins) || 0,
      losses: Number(losses) || 0,
      tradesCount: Number(tradesCount) || 0,
      minimumStartUp: useMinimumStartup ? Number(minimumStartUp) || 0 : 0,
      followers: Number(followers) || 0,
      tickType,
    };

    try {
      const res = await fetch("/api/copy-trading/experts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          expert: payload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save expert");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save expert. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="meta-gold-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="meta-gold-modal-dialog"
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#16181d",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "20px 20px 16px 20px",
          maxHeight: "min(92vh, calc(100dvh - 24px))",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 50px rgba(0, 0, 0, 0.8)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== MODAL HEADER ===================== */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <p style={{ margin: 0, fontSize: "14.5px", fontWeight: 600, color: "#ffffff" }}>
              {step === 1 && "Expert Details"}
              {step === 2 && "Expert Stats"}
              {step === 3 && "Expert Settings"}{" "}
              <strong style={{ fontWeight: 400, color: "rgba(255, 255, 255, 0.45)", marginLeft: "6px" }}>
                Step {step}/3
              </strong>
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
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            paddingRight: "4px",
            paddingBottom: "8px",
          }}
        >
          {error && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "rgba(255, 59, 78, 0.1)",
                border: "1px solid rgba(255, 59, 78, 0.3)",
                borderRadius: "8px",
                color: "#ff3b4e",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {/* ===================== STEP 1 / 3: EXPERT DETAILS ===================== */}
          {step === 1 && (
            <div>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "13px",
                  lineHeight: "18px",
                  margin: "0 0 20px 0",
                }}
              >
                {isEditing
                  ? "To edit this expert, fill in the details, and click on the continue button. You can leave things as they are if you don't want to change them."
                  : "To add an expert, fill in the details, and click on the continue button."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Expert name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "6px",
                    }}
                  >
                    Expert name:
                  </label>
                  <input
                    type="text"
                    value={name}
                    placeholder="Alexis Sanchez"
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      height: "44px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "0 14px",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 600,
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Expert username */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "6px",
                    }}
                  >
                    Expert username:
                  </label>
                  <input
                    type="text"
                    value={username}
                    placeholder="alexis_sanchez"
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: "100%",
                      height: "44px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "0 14px",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 600,
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Expert image picker button (Matches Image 1 & Image 3) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "6px",
                    }}
                  >
                    Expert image
                  </label>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      width: "100%",
                      height: "44px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "0 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    {picture ? (
                      <img
                        src={picture}
                        alt="preview"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <FileUp size={16} color="#4F6BFF" />
                    )}
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#4F6BFF" }}>
                      {picture ? "Click here to change expert image" : "Click here to upload expert image"}
                    </span>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* Expert badge picker button (Matches Image 1 & Image 3) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "6px",
                    }}
                  >
                    Expert badge
                  </label>
                  <div
                    onClick={() => badgeInputRef.current?.click()}
                    style={{
                      width: "100%",
                      height: "44px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "0 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    {badge ? (
                      <img
                        src={badge}
                        alt="badge"
                        style={{ width: "20px", height: "20px", objectFit: "contain" }}
                      />
                    ) : (
                      <FileUp size={16} color="#4F6BFF" />
                    )}
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#4F6BFF" }}>
                      {badge ? "Click to change badge" : "Click to upload badge"}
                    </span>
                    <input
                      ref={badgeInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBadgeFile}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "6px",
                    }}
                  >
                    Bio:
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    placeholder="Enter expert bio"
                    onChange={(e) => setBio(e.target.value)}
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 600,
                      boxSizing: "border-box",
                      outline: "none",
                      resize: "none",
                    }}
                  />
                </div>

                {/* Verification Dropdown (Matches Image 2 & Image 4) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "6px",
                    }}
                  >
                    Verification:
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={tickType}
                      onChange={(e) => setTickType(e.target.value as any)}
                      style={{
                        width: "100%",
                        height: "44px",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "8px",
                        padding: "0 14px",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxSizing: "border-box",
                        outline: "none",
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="gold" style={{ background: "#16181d" }}>
                        gold
                      </option>
                      <option value="blue" style={{ background: "#16181d" }}>
                        blue
                      </option>
                      <option value="none" style={{ background: "#16181d" }}>
                        none
                      </option>
                    </select>
                    <div
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: "10px",
                      }}
                    >
                      ▼
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 2 / 3: EXPERT STATS ===================== */}
          {step === 2 && (
            <div>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "13px",
                  lineHeight: "18px",
                  margin: "0 0 20px 0",
                }}
              >
                To continue, fill in the stats, and click on the continue button. You can use the &quot;Auto fill&quot; button to do it automatically.
                {isEditing && (
                  <span>
                    {" "}
                    You are editing <strong style={{ color: "#ffffff" }}>{name}</strong>
                  </span>
                )}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Row 1: Win Rate & Profit Share */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                      Win Rate:
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={winRate}
                        onChange={(e) => setWinRate(e.target.value)}
                        placeholder="10"
                        style={{
                          width: "100%",
                          height: "44px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "8px",
                          padding: "0 34px 0 12px",
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: 600,
                          boxSizing: "border-box",
                        }}
                      />
                      <span style={{ position: "absolute", right: "12px", top: "14px", color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                      Profit share:
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={profitShare}
                        onChange={(e) => setProfitShare(e.target.value)}
                        placeholder="40"
                        style={{
                          width: "100%",
                          height: "44px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "8px",
                          padding: "0 34px 0 12px",
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: 600,
                          boxSizing: "border-box",
                        }}
                      />
                      <span style={{ position: "absolute", right: "12px", top: "14px", color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Wins & Losses */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                      Wins:
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={wins}
                        onChange={(e) => setWins(e.target.value)}
                        placeholder="1000"
                        style={{
                          width: "100%",
                          height: "44px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "8px",
                          padding: "0 46px 0 12px",
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: 600,
                          boxSizing: "border-box",
                        }}
                      />
                      <span style={{ position: "absolute", right: "10px", top: "14px", color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600 }}>
                        WINS
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                      Losses:
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={losses}
                        onChange={(e) => setLosses(e.target.value)}
                        placeholder="100"
                        style={{
                          width: "100%",
                          height: "44px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "8px",
                          padding: "0 54px 0 12px",
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: 600,
                          boxSizing: "border-box",
                        }}
                      />
                      <span style={{ position: "absolute", right: "10px", top: "14px", color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600 }}>
                        LOSSES
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Followers & Trades */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                      Followers:
                    </label>
                    <input
                      type="number"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      placeholder="1000"
                      style={{
                        width: "100%",
                        height: "44px",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "8px",
                        padding: "0 12px",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                      Trades:
                    </label>
                    <input
                      type="number"
                      value={tradesCount}
                      onChange={(e) => setTradesCount(e.target.value)}
                      placeholder="1000"
                      style={{
                        width: "100%",
                        height: "44px",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "8px",
                        padding: "0 12px",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 3 / 3: EXPERT SETTINGS ===================== */}
          {step === 3 && (
            <div>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "13px",
                  lineHeight: "18px",
                  margin: "0 0 20px 0",
                }}
              >
                To finish, modify the settings, and click on the button below. You may also leave the settings as they are.
                {isEditing && (
                  <span>
                    {" "}
                    You are editing <strong style={{ color: "#ffffff" }}>{name}</strong>
                  </span>
                )}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Minimum Startup Toggle */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <label style={{ fontSize: "13px", fontWeight: 500, color: "#ffffff" }}>
                    Use minimum startup for this expert
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseMinimumStartup(!useMinimumStartup)}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      backgroundColor: useMinimumStartup ? "#4F6BFF" : "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: useMinimumStartup ? "22px" : "2px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                        transition: "left 0.2s",
                      }}
                    />
                  </button>
                </div>

                {/* Minimum Startup Amount Input */}
                {useMinimumStartup && (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                      Minimum startup ($):
                    </label>
                    <input
                      type="number"
                      value={minimumStartUp}
                      onChange={(e) => setMinimumStartUp(e.target.value)}
                      placeholder="1000"
                      style={{
                        width: "100%",
                        height: "44px",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "8px",
                        padding: "0 14px",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}

                {/* Auto generate trades toggle */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <label style={{ fontSize: "13px", fontWeight: 500, color: "#ffffff" }}>
                    Auto generate trades for this expert
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoGenerateTrades(!autoGenerateTrades)}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      backgroundColor: autoGenerateTrades ? "#4F6BFF" : "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: autoGenerateTrades ? "22px" : "2px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                        transition: "left 0.2s",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== FOOTER ACTIONS ===================== */}
        <div
          style={{
            flexShrink: 0,
            marginTop: "auto",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "#16181d",
          }}
        >
          {step === 1 && (
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: name.trim() ? "#4F6BFF" : "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: name.trim() ? "pointer" : "not-allowed",
                transition: "background 0.15s",
              }}
            >
              Continue
            </button>
          )}

          {step === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={autoFilling}
                style={{
                  height: "44px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {autoFilling ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />}
                <span>Auto fill</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  height: "44px",
                  backgroundColor: "#4F6BFF",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "10px" }}>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (expert && onRequestDelete) onRequestDelete(expert);
                  }}
                  style={{
                    height: "44px",
                    padding: "0 16px",
                    backgroundColor: "rgba(255, 59, 78, 0.12)",
                    border: "1px solid rgba(255, 59, 78, 0.25)",
                    borderRadius: "8px",
                    color: "#ff3b4e",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Trash2 size={15} />
                  <span>Delete expert</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveExpert}
                disabled={saving}
                style={{
                  flex: 1,
                  height: "44px",
                  backgroundColor: "#4F6BFF",
                  color: "#ffffff",
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
                {saving && <Loader2 size={16} className="animate-spin" />}
                <span>{isEditing ? "Save Changes" : "Finish"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media screen and (max-width: 600px) {
          .meta-gold-modal-overlay {
            padding: 12px 10px !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .meta-gold-modal-dialog {
            max-width: 100% !important;
            max-height: calc(100dvh - 24px) !important;
            border-radius: 16px !important;
            padding: 18px 16px calc(14px + env(safe-area-inset-bottom, 0px)) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
          }
        }
      `}</style>
    </div>
  );
}
