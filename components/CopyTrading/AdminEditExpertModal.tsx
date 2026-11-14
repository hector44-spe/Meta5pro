"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { CopyExpert } from "@/app/api/copy-trading/experts/route";

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

  const [name, setName] = useState(expert?.name || "");
  const [username, setUsername] = useState(expert?.username || "");
  const [bio, setBio] = useState(expert?.bio || "");
  const [picture, setPicture] = useState(expert?.picture || "/assets/copy-trading/albania_support.png");
  const [winRate, setWinRate] = useState(expert?.winRate?.toString() || "92");
  const [profitShare, setProfitShare] = useState(expert?.profitShare?.toString() || "15");
  const [wins, setWins] = useState(expert?.wins?.toString() || "6988");
  const [losses, setLosses] = useState(expert?.losses?.toString() || "11");
  const [tradesCount, setTradesCount] = useState(expert?.tradesCount?.toString() || "6999");
  const [minimumStartUp, setMinimumStartUp] = useState(expert?.minimumStartUp?.toString() || "1000");
  const [followers, setFollowers] = useState(expert?.followers?.toString() || "13800");
  const [tickType, setTickType] = useState<"gold" | "blue" | "none">(expert?.tickType || "gold");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expert) {
      setName(expert.name || "");
      setUsername(expert.username || "");
      setBio(expert.bio || "");
      setPicture(expert.picture || "/assets/copy-trading/albania_support.png");
      setWinRate(expert.winRate?.toString() || "92");
      setProfitShare(expert.profitShare?.toString() || "15");
      setWins(expert.wins?.toString() || "6988");
      setLosses(expert.losses?.toString() || "11");
      setTradesCount(expert.tradesCount?.toString() || "6999");
      setMinimumStartUp(expert.minimumStartUp?.toString() || "1000");
      setFollowers(expert.followers?.toString() || "13800");
      setTickType(expert.tickType || "gold");
    } else {
      setName("");
      setUsername("");
      setBio("");
      setPicture("/assets/copy-trading/albania_support.png");
      setWinRate("90");
      setProfitShare("15");
      setWins("500");
      setLosses("10");
      setTradesCount("510");
      setMinimumStartUp("1000");
      setFollowers("5000");
      setTickType("gold");
    }
  }, [expert]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Expert name is required");
      return;
    }

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
      minimumStartUp: Number(minimumStartUp) || 0,
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
      setError(err.message || "Failed to save expert");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (expert && onRequestDelete) {
      onClose();
      onRequestDelete(expert);
    }
  };

  return (
    <div
      className="admin-expert-modal-overlay"
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
        className="admin-expert-modal-dialog"
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "#16181d",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "24px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 48px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#ffffff" }}>
            {isEditing ? "Edit Copy Trading Expert" : "Add Copy Trading Expert"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>

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

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
              Expert Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Albania fx"
              style={{
                width: "100%",
                height: "42px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "0 12px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Username (@)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Support"
                style={{
                  width: "100%",
                  height: "42px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0 12px",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Verification Tick
              </label>
              <select
                value={tickType}
                onChange={(e) => setTickType(e.target.value as any)}
                style={{
                  width: "100%",
                  height: "42px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0 12px",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                <option value="gold" style={{ background: "#16181d" }}>Gold Tick</option>
                <option value="blue" style={{ background: "#16181d" }}>Blue Tick</option>
                <option value="none" style={{ background: "#16181d" }}>None</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
              Avatar / Picture Path
            </label>
            <input
              type="text"
              value={picture}
              onChange={(e) => setPicture(e.target.value)}
              placeholder="/assets/copy-trading/albania_support.png"
              style={{
                width: "100%",
                height: "42px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "0 12px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I can give you a life you dreamed for"
              rows={2}
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#ffffff",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Win Rate (%)
              </label>
              <input
                type="number"
                value={winRate}
                onChange={(e) => setWinRate(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0 10px",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Profit Share (%)
              </label>
              <input
                type="number"
                value={profitShare}
                onChange={(e) => setProfitShare(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0 10px",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Min Startup ($)
              </label>
              <input
                type="number"
                value={minimumStartUp}
                onChange={(e) => setMinimumStartUp(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0 10px",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Wins
              </label>
              <input
                type="number"
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0 10px",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Losses
              </label>
              <input
                type="number"
                value={losses}
                onChange={(e) => setLosses(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0 10px",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Total Trades
              </label>
              <input
                type="number"
                value={tradesCount}
                onChange={(e) => setTradesCount(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0 10px",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
              Followers (e.g. 13800 for 13.8K)
            </label>
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "0 10px",
                color: "#ffffff",
                fontSize: "13.5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: isEditing ? "space-between" : "flex-end",
              alignItems: "center",
              marginTop: "16px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {isEditing && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={saving}
                style={{
                  background: "rgba(255, 59, 78, 0.15)",
                  color: "#ff3b4e",
                  border: "1px solid rgba(255, 59, 78, 0.3)",
                  borderRadius: "8px",
                  height: "42px",
                  padding: "0 16px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Trash2 size={15} />
                <span>Delete Expert</span>
              </button>
            )}

            <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  height: "42px",
                  padding: "0 18px",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#4F6BFF",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  height: "42px",
                  padding: "0 22px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @media screen and (max-width: 600px) {
          .admin-expert-modal-overlay {
            padding: 0 !important;
            align-items: flex-end !important;
          }
          .admin-expert-modal-dialog {
            max-width: 100% !important;
            border-radius: 18px 18px 0 0 !important;
            padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 16px)) !important;
            border-bottom: none !important;
          }
        }
      `}</style>
    </div>
  );
}
