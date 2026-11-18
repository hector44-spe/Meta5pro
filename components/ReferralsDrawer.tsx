"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, X, Search, CheckCircle2, Loader2, Copy } from "lucide-react";
import { ReferralUser } from "@/lib/referralData";

interface ReferralsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export default function ReferralsDrawer({
  isOpen,
  onClose,
  referralCode: initialRefCode,
}: ReferralsDrawerProps) {
  const [referralCode, setReferralCode] = useState<string>(
    initialRefCode || "VmDBZTVmbmtYdFBFYm5QaTZjM053WT"
  );
  const [referralBalance, setReferralBalance] = useState<number>(0);
  const [rewardsClaimed, setRewardsClaimed] = useState<number>(0);
  const [friendsInvited, setFriendsInvited] = useState<number>(0);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchReferralData = async () => {
    try {
      const res = await fetch("/api/referrals");
      if (res.ok) {
        const data = await res.json();
        if (data.referralCode) setReferralCode(data.referralCode);
        if (typeof data.referralBalance === "number") setReferralBalance(data.referralBalance);
        if (typeof data.rewardsClaimed === "number") setRewardsClaimed(data.rewardsClaimed);
        if (typeof data.friendsInvited === "number") setFriendsInvited(data.friendsInvited);
        if (Array.isArray(data.referrals)) setReferrals(data.referrals);
      }
    } catch (err) {
      console.error("Failed to fetch referral data:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReferralData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(referralCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = referralCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      showToast("Referral code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      showToast("Copied to clipboard!");
    }
  };

  const handleClaim = async () => {
    if (referralBalance <= 0 || isClaiming) return;
    setIsClaiming(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim rewards");

      showToast(data.message || "Successfully claimed referral rewards!");
      setReferralBalance(0);
      setRewardsClaimed((prev) => prev + (data.claimedAmount || 0));
    } catch (err: any) {
      showToast(err.message || "Unable to claim referral balance");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isOpen) return null;

  const filteredReferrals = referrals.filter(
    (r) =>
      r.username?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "rgba(22, 25, 30, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(71, 99, 240, 0.4)",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            zIndex: 100000,
            fontSize: "13.5px",
            fontWeight: 500,
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <CheckCircle2 size={18} color="#4763f0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
          transition: "opacity 300ms ease",
        }}
      />

      {/* Sliding Drawer */}
      <div
        className="scrollbar-hide"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "100%",
          maxWidth: "440px",
          zIndex: 9999,
          backgroundColor: "#101216",
          borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflowY: "auto",
          boxShadow: "-10px 0 35px rgba(0, 0, 0, 0.6)",
          animation: "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 20px 16px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              padding: 0,
              fontSize: "14.5px",
              fontWeight: 600,
              lineHeight: "18px",
            }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span>Referral program</span>
          </button>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              display: "grid",
              placeContent: "center",
              width: "24px",
              height: "24px",
              padding: 0,
              borderRadius: "4px",
              transition: "color 0.15s ease",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* Subtitle description */}
          <div
            style={{
              fontSize: "13px",
              lineHeight: "18px",
              color: "#8c95a0",
              marginBottom: "24px",
            }}
          >
            Invite your friends to join our platform by using your referral code on sign up! You&apos;ll earn a rewarding 40% from the deposits made by the friends you bring on board. It&apos;s a win-win for everyone!
          </div>

          {/* Section: Your referral balance */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                lineHeight: "16px",
                fontWeight: 500,
                color: "#8c95a0",
                marginBottom: "8px",
              }}
            >
              Your referral balance:
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#16191e",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "6px 8px 6px 14px",
                gap: "8px",
              }}
            >
              <input
                type="text"
                readOnly
                value={`$${referralBalance.toFixed(2)}`}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
              <button
                disabled={referralBalance <= 0 || isClaiming}
                onClick={handleClaim}
                style={{
                  backgroundColor: referralBalance > 0 ? "#4763f0" : "#4a515a",
                  color: referralBalance > 0 ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  cursor: referralBalance > 0 ? "pointer" : "not-allowed",
                  display: "grid",
                  placeContent: "center",
                  transition: "background-color 0.2s ease",
                }}
              >
                {isClaiming ? <Loader2 size={14} className="animate-spin" /> : "CLAIM"}
              </button>
            </div>
          </div>

          {/* Section: Your referral code */}
          <div style={{ marginBottom: "26px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                lineHeight: "16px",
                fontWeight: 500,
                color: "#8c95a0",
                marginBottom: "8px",
              }}
            >
              Your referral code:
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#16191e",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "6px 8px 6px 14px",
                gap: "8px",
              }}
            >
              <input
                type="text"
                readOnly
                value={referralCode}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 500,
                  outline: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
              <button
                onClick={handleCopyCode}
                type="button"
                aria-label={copied ? "Referral code copied" : "Copy referral code"}
                title={copied ? "Copied" : "Copy referral code"}
                style={{
                  backgroundColor: "#4763f0",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  width: "36px",
                  height: "36px",
                  padding: 0,
                  cursor: "pointer",
                  display: "grid",
                  placeContent: "center",
                  flexShrink: 0,
                  transition: "background-color 0.2s ease, transform 0.1s ease",
                }}
              >
                {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
              </button>
            </div>
          </div>

          {/* Statistics Section */}
          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                lineHeight: "16px",
                fontWeight: 500,
                color: "#8c95a0",
                marginBottom: "10px",
              }}
            >
              Statistics
            </label>
            <div
              style={{
                backgroundColor: "#16191e",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "10px",
                padding: "16px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "#8c95a0",
                    margin: "0 0 6px 0",
                  }}
                >
                  Friends invited
                </p>
                <p
                  style={{
                    fontSize: "20px",
                    lineHeight: "24px",
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  {friendsInvited}
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "#8c95a0",
                    margin: "0 0 6px 0",
                  }}
                >
                  Rewards claimed
                </p>
                <span
                  style={{
                    fontSize: "20px",
                    lineHeight: "24px",
                    fontWeight: 700,
                    color: "#ffffff",
                    display: "inline-block",
                  }}
                >
                  ${rewardsClaimed.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Referrals Section */}
          <div style={{ marginTop: "6px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                lineHeight: "16px",
                fontWeight: 500,
                color: "#8c95a0",
                marginBottom: "10px",
              }}
            >
              Referrals
            </label>

            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#16191e",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "10px 14px",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <Search size={16} strokeWidth={1.5} color="#8c95a0" />
              <input
                type="text"
                placeholder="Search for a referral"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {/* List or Empty State */}
            {filteredReferrals.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "36px 16px",
                  textAlign: "center",
                  color: "#8c95a0",
                }}
              >
                {/* Replica exact SVG empty state icon */}
                <svg
                  style={{ width: "32px", height: "32px", marginBottom: "12px", opacity: 0.6 }}
                  viewBox="0 0 25 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.132 6.06h10"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.352 2.5h5.56c1.78 0 2.22.44 2.22 2.2v4.11c0 1.76-.44 2.2-2.22 2.2h-5.56c-1.78 0-2.22-.44-2.22-2.2V4.7c0-1.76.44-2.2 2.22-2.2Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.132 17.56h10"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.352 14h5.56c1.78 0 2.22.44 2.22 2.2v4.11c0 1.76-.44 2.2-2.22 2.2h-5.56c-1.78 0-2.22-.44-2.22-2.2V16.2c0-1.76.44-2.2 2.22-2.2ZM22.132 15.5c0 3.87-3.13 7-7 7l1.05-1.75"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.05 4.1 3.738 7.414M3.732 4.1l3.314 3.314"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <p style={{ fontSize: "13px", lineHeight: "16px", margin: 0 }}>
                  No referrals yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredReferrals.map((ref) => (
                  <div
                    key={ref.id}
                    style={{
                      backgroundColor: "#16191e",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>
                        {ref.username || ref.email}
                      </p>
                      <p style={{ fontSize: "11px", color: "#8c95a0", margin: "2px 0 0 0" }}>
                        Joined {ref.date}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#10b981",
                          display: "block",
                        }}
                      >
                        +${ref.rewardEarned.toFixed(2)}
                      </span>
                      <span style={{ fontSize: "11px", color: "#8c95a0" }}>
                        {ref.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
