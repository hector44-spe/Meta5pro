"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDashboard } from "@/components/DashboardShell";
import {
  Search,
  Plus,
  Copy,
  Users,
  CheckCircle2,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import AdminEditExpertModal from "@/components/CopyTrading/AdminEditExpertModal";
import CustomDeleteConfirmModal from "@/components/CopyTrading/CustomDeleteConfirmModal";
import CustomNotificationBar, { CustomNotificationState } from "@/components/UI/CustomNotificationBar";
import type { CopyExpert } from "@/types/copy-trading";
import "@/styles/copy-trading.css";

function formatFollowers(count: number): string {
  if (!count) return "0";
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toLocaleString();
}

function ExpertCardItem({
  expert,
  userId,
  isAdmin,
  isActionLoading,
  onView,
  onToggleCopy,
  onEdit,
}: {
  expert: CopyExpert;
  userId: string;
  isAdmin: boolean;
  isActionLoading: boolean;
  onView: (expert: CopyExpert) => void;
  onToggleCopy: (expert: CopyExpert) => void;
  onEdit?: (expert: CopyExpert) => void;
}) {
  const isCopied = Array.isArray(expert.subscriberList) && expert.subscriberList.includes(userId);
  const usernameClean = expert.username
    ? expert.username.replace(/^@/, "")
    : expert.name.replace(/\s+/g, "_").toLowerCase();

  // If tickType is gold or this is Albania fx (matching reference screenshot), render gold-tick
  const isGoldTick = expert.tickType === "gold" || expert.id === "albania-fx" || expert.name.toLowerCase().includes("albania");

  return (
    <div className="expert_card">
      <div>
        {/* Top Header Row: Profile (Avatar + Texts) on Left, Edit on Right */}
        <div className="expert_card_top_header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="expert_card_profile">
            <div className="expert_avatar_wrapper">
              <img
                src={expert.picture || "/assets/copy-trading/albania_support.png"}
                alt={expert.name}
                className="expert_avatar_img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/copy-trading/albania_support.png";
                }}
              />
            </div>

            <div className="expert_profile_info">
              <div className="expert_name_row">
                <span className="expert_name_text" title={expert.name}>
                  {expert.name}
                </span>
                {isGoldTick ? (
                  <img
                    src="/assets/copy-trading/gold-tick.svg"
                    alt="gold tick"
                    className="expert_tick_icon"
                  />
                ) : expert.tickType === "blue" ? (
                  <img
                    src="/assets/copy-trading/blue-tick.svg"
                    alt="blue tick"
                    className="expert_tick_icon"
                  />
                ) : null}
              </div>

              <p className="expert_handle_text">@{usernameClean}</p>

              <div className="expert_followers_row">
                <Copy size={13} className="expert_followers_icon" />
                <span className="expert_followers_count">{formatFollowers(expert.followers || 0)}</span>
                <span className="expert_followers_label">Followers</span>
              </div>
            </div>
          </div>

          {isAdmin && onEdit && (
            <button
              type="button"
              className="admin_edit_link"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(expert);
              }}
              style={{
                marginLeft: "auto",
                alignSelf: "flex-start",
                padding: "4px 10px",
                background: "rgba(79, 107, 255, 0.15)",
                border: "1px solid rgba(79, 107, 255, 0.35)",
                borderRadius: "6px",
                color: "#7a94ff",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              Edit
            </button>
          )}
        </div>

        {/* Bio */}
        <p className="expert_bio_text" title={expert.bio}>
          {expert.bio || "I can give you a life you dreamed for"}
        </p>
      </div>

      {/* Metrics Grid & Action Buttons */}
      <div>
        <div className="expert_metrics_grid">
          {/* Row 1 */}
          <div className="expert_metric_col">
            <span className="expert_metric_label">Win rate</span>
            <span className="expert_metric_value expert_metric_winrate">{expert.winRate}%</span>
          </div>

          <div className="expert_metric_col">
            <span className="expert_metric_label">Profit share</span>
            <span className="expert_metric_value expert_metric_profitshare">{expert.profitShare}%</span>
          </div>

          <div className="expert_metric_col expert_col_right">
            <span className="expert_metric_label">Wins</span>
            <span className="expert_metric_value">{expert.wins?.toLocaleString() || 0}</span>
          </div>

          {/* Row 2 */}
          <div className="expert_metric_col">
            <span className="expert_metric_label">Losses</span>
            <span className="expert_metric_value">{expert.losses?.toLocaleString() || 0}</span>
          </div>

          <div className="expert_metric_col">
            <span className="expert_metric_label">Trades</span>
            <span className="expert_metric_value">{expert.tradesCount?.toLocaleString() || 0}</span>
          </div>

          <div className="expert_metric_col expert_col_right">
            <span className="expert_metric_label">Min. startup</span>
            <span className="expert_metric_value">${Number(expert.minimumStartUp || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Buttons: View & Copy */}
        <div className="expert_actions_footer">
          <button
            type="button"
            className="expert_btn_view"
            onClick={() => onView(expert)}
          >
            View
          </button>

          {isCopied ? (
            <button
              type="button"
              className="expert_btn_cancel"
              disabled={isActionLoading}
              onClick={() => onToggleCopy(expert)}
            >
              {isActionLoading ? (
                <Loader2 size={16} className="animate-spin" color="#ffffff" />
              ) : (
                "Cancel"
              )}
            </button>
          ) : (
            <button
              type="button"
              className="expert_btn_copy"
              disabled={isActionLoading}
              onClick={() => onToggleCopy(expert)}
            >
              {isActionLoading ? (
                <Loader2 size={16} className="animate-spin" color="#ffffff" />
              ) : (
                "Copy"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CopyTradingPage() {
  const { currentBalance, refreshBalance } = useDashboard();

  const [activeTab, setActiveTab] = useState<"top_experts" | "copying" | "how_it_works">("top_experts");
  const [experts, setExperts] = useState<CopyExpert[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom notification state
  const [notification, setNotification] = useState<CustomNotificationState | null>(null);

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedExpertForView, setSelectedExpertForView] = useState<CopyExpert | null>(null);

  // Admin Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<CopyExpert | null>(null);
  const [deletingExpert, setDeletingExpert] = useState<CopyExpert | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
  };

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/copy-trading/experts");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.experts)) {
          setExperts(data.experts);
        }
        if (typeof data.isAdmin === "boolean") {
          setIsAdmin(data.isAdmin);
        }
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          if (
            params.get("admin") === "true" ||
            localStorage.getItem("mg5_admin_preview") === "true" ||
            localStorage.getItem("admin_preview") === "true"
          ) {
            setIsAdmin(true);
          }
        }
        if (data.userId) {
          setUserId(data.userId);
        }
      }
    } catch (err) {
      console.error("Failed to load experts", err);
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    fetchExperts();
  }, []);

  const filteredExperts = useMemo(() => {
    if (!searchQuery.trim()) return experts;
    const q = searchQuery.toLowerCase();
    return experts.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.username && e.username.toLowerCase().includes(q)) ||
        (e.bio && e.bio.toLowerCase().includes(q))
    );
  }, [experts, searchQuery]);

  const copiedExperts = useMemo(() => {
    return experts.filter((e) => Array.isArray(e.subscriberList) && e.subscriberList.includes(userId));
  }, [experts, userId]);

  // Handle Copy / Cancel
  const handleToggleCopy = async (expert: CopyExpert) => {
    const isCurrentlyCopied = Array.isArray(expert.subscriberList) && expert.subscriberList.includes(userId);
    const action = isCurrentlyCopied ? "cancel" : "copy";

    if (action === "copy") {
      if (expert.minimumStartUp && currentBalance < expert.minimumStartUp) {
        showNotification(
          "error",
          `Insufficient balance! Minimum startup required is $${expert.minimumStartUp.toLocaleString()}, but your balance is $${currentBalance.toLocaleString()}.`
        );
        return;
      }
    }

    try {
      setActionLoadingId(expert.id || expert.ref);
      const res = await fetch("/api/copy-trading/experts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          expertId: expert.id || expert.ref,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update copying status");
      }

      showNotification(
        "success",
        action === "copy" ? `Successfully copying ${expert.name}!` : `Stopped copying ${expert.name}.`
      );
      await fetchExperts();
      if (refreshBalance) refreshBalance();
    } catch (err: any) {
      showNotification("error", err.message || "An error occurred");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Custom Delete confirmation handler
  const handleConfirmDelete = async () => {
    if (!deletingExpert) return;

    try {
      setDeleteLoading(true);
      const res = await fetch("/api/copy-trading/experts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          expertId: deletingExpert.id || deletingExpert.ref,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete expert");
      }

      showNotification("success", `${deletingExpert.name} was successfully deleted.`);
      setDeletingExpert(null);
      await fetchExperts();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to delete expert");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="copy_trading_page">
      {/* Custom Notification Bar */}
      <CustomNotificationBar
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Page Header (Matches Image 1 & Image 3) */}
      <div className="copy_trading_header">
        <h1 className="copy_trading_title">Copy trading</h1>

        {/* Switcher Navigation: Clean text tabs with no bottom line */}
        <div className="copy_trading_switcher">
          <button
            className={`copy_trading_tab_btn ${activeTab === "top_experts" ? "active" : ""}`}
            onClick={() => setActiveTab("top_experts")}
          >
            <span>Top experts</span>
          </button>

          <button
            className={`copy_trading_tab_btn ${activeTab === "copying" ? "active" : ""}`}
            onClick={() => setActiveTab("copying")}
          >
            <span>Copying</span>
            {copiedExperts.length > 0 && (
              <span className="copy_trading_tab_badge">{copiedExperts.length}</span>
            )}
          </button>

          <button
            className={`copy_trading_tab_btn ${activeTab === "how_it_works" ? "active" : ""}`}
            onClick={() => setActiveTab("how_it_works")}
          >
            <span>How it works</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: TOP EXPERTS ===================== */}
      {activeTab === "top_experts" && (
        <div>
          {/* Section heading: Matches Image 3 */}
          <h2 className="copy_section_title">Top experts</h2>

          {/* Search bar & Add Expert Button (Matches Image 3) */}
          <div className="copy_trading_actions_row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div className="copy_trading_search_box" style={{ flex: "1 1 240px" }}>
              <Search size={16} color="rgba(255, 255, 255, 0.4)" />
              <input
                type="text"
                placeholder="Search for experts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isAdmin && (
              <button
                type="button"
                className="btn_add_expert"
                onClick={() => {
                  setEditingExpert(null);
                  setIsEditModalOpen(true);
                }}
                style={{
                  background: "#4F6BFF",
                  color: "#ffffff",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                + Add Expert
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} className="animate-spin" color="#4F6BFF" style={{ margin: "0 auto" }} />
              <p style={{ marginTop: "12px", color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                Loading experts...
              </p>
            </div>
          ) : filteredExperts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}>
                No experts found matching &quot;{searchQuery}&quot;.
              </p>
            </div>
          ) : (
            <div className="copy_trading_grids">
              {filteredExperts.map((expert) => (
                <ExpertCardItem
                  key={expert.id || expert.ref}
                  expert={expert}
                  userId={userId}
                  isAdmin={isAdmin}
                  isActionLoading={actionLoadingId === (expert.id || expert.ref)}
                  onView={(exp) => setSelectedExpertForView(exp)}
                  onToggleCopy={(exp) => handleToggleCopy(exp)}
                  onEdit={(exp) => {
                    setEditingExpert(exp);
                    setIsEditModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: COPYING ===================== */}
      {activeTab === "copying" && (
        <div>
          {copiedExperts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                maxWidth: "600px",
                margin: "40px auto",
              }}
            >
              <Users size={44} color="rgba(255, 255, 255, 0.2)" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
                Not Copying Any Experts
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: "22px",
                  color: "rgba(255, 255, 255, 0.5)",
                  marginBottom: "24px",
                }}
              >
                Browse top performing traders with verified track records and start mirroring their trades.
              </p>
              <button
                className="btn_add_expert"
                onClick={() => setActiveTab("top_experts")}
                style={{ margin: "0 auto" }}
              >
                <span>Browse Top Experts</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="copy_trading_grids">
              {copiedExperts.map((expert) => (
                <ExpertCardItem
                  key={expert.id || expert.ref}
                  expert={expert}
                  userId={userId}
                  isAdmin={isAdmin}
                  isActionLoading={actionLoadingId === (expert.id || expert.ref)}
                  onView={(exp) => setSelectedExpertForView(exp)}
                  onToggleCopy={(exp) => handleToggleCopy(exp)}
                  onEdit={(exp) => {
                    setEditingExpert(exp);
                    setIsEditModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: HOW IT WORKS ===================== */}
      {activeTab === "how_it_works" && (
        <div className="copy_how_it_works_wrapper">
          <div className="copy_how_card">
            <h3>1. Choose an Expert Trader</h3>
            <p>
              Browse our roster of vetted traders. Review their historical win rates, past trade performance,
              follower count, and profit share requirements before deciding whom to follow.
            </p>
          </div>

          <div className="copy_how_card">
            <h3>2. Meet the Minimum Startup</h3>
            <p>
              Each expert has a set minimum startup balance required to copy their positions proportionately.
              Ensure your account balance meets or exceeds this amount.
            </p>
          </div>

          <div className="copy_how_card">
            <h3>3. Real-Time Automated Execution</h3>
            <p>
              When your chosen expert opens or closes a position in crypto or forex, the trade is automatically
              replicated in your account with matching ratio and risk protection.
            </p>
          </div>

          <div className="copy_how_card">
            <h3>4. Fair Profit Sharing</h3>
            <p>
              You only pay a profit share percentage on successful profitable trades generated by the expert.
              There are no hidden recurring monthly fees.
            </p>
          </div>
        </div>
      )}

      {/* ===================== EXPERT DETAIL DRAWER ===================== */}
      {mounted && typeof document !== "undefined" && selectedExpertForView
        ? createPortal(
            <div
              className="expert_view_overlay"
              onClick={() => setSelectedExpertForView(null)}
            >
              <div
                className="expert_view_drawer"
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Expert Overview
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedExpertForView(null)}
                    style={{ background: "transparent", border: "none", color: "rgba(255, 255, 255, 0.5)", cursor: "pointer", padding: "4px" }}
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "20px" }}>
                  <img
                    src={selectedExpertForView.picture || "/assets/copy-trading/albania_support.png"}
                    alt={selectedExpertForView.name}
                    style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/copy-trading/albania_support.png";
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                        {selectedExpertForView.name}
                      </h3>
                      {selectedExpertForView.tickType === "gold" && (
                        <img src="/assets/copy-trading/gold-tick.svg" alt="gold" style={{ width: "18px", height: "18px" }} />
                      )}
                      {selectedExpertForView.tickType === "blue" && (
                        <img src="/assets/copy-trading/blue-tick.svg" alt="blue" style={{ width: "18px", height: "18px" }} />
                      )}
                    </div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
                      {selectedExpertForView.username ? `@${selectedExpertForView.username}` : `@${selectedExpertForView.name.toLowerCase()}`}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: "13.5px", lineHeight: "20px", color: "rgba(255,255,255,0.7)", marginBottom: "24px" }}>
                  {selectedExpertForView.bio || "I can give you a life you dreamed for"}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", display: "block" }}>Win Rate</span>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#00d68f", display: "block", marginTop: "4px" }}>
                      {selectedExpertForView.winRate}%
                    </span>
                  </div>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", display: "block" }}>Profit Share</span>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", display: "block", marginTop: "4px" }}>
                      {selectedExpertForView.profitShare}%
                    </span>
                  </div>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", display: "block" }}>Wins / Losses</span>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", display: "block", marginTop: "4px" }}>
                      {selectedExpertForView.wins?.toLocaleString()} / {selectedExpertForView.losses?.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", display: "block" }}>Min. Startup</span>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", display: "block", marginTop: "4px" }}>
                      ${Number(selectedExpertForView.minimumStartUp || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                  {Array.isArray(selectedExpertForView.subscriberList) &&
                  selectedExpertForView.subscriberList.includes(userId) ? (
                    <button
                      className="btn_cancel"
                      style={{ width: "100%", height: "46px" }}
                      onClick={() => {
                        handleToggleCopy(selectedExpertForView);
                        setSelectedExpertForView(null);
                      }}
                    >
                      <p>Cancel Copying</p>
                    </button>
                  ) : (
                    <button
                      className="btn_copy"
                      style={{ width: "100%", height: "46px" }}
                      onClick={() => {
                        handleToggleCopy(selectedExpertForView);
                        setSelectedExpertForView(null);
                      }}
                    >
                      <p>Copy Expert (${Number(selectedExpertForView.minimumStartUp || 0).toLocaleString()} Min.)</p>
                    </button>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {/* Admin Edit Expert Modal */}
      <AdminEditExpertModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpert(null);
        }}
        expert={editingExpert}
        onSaved={() => {
          setIsEditModalOpen(false);
          setEditingExpert(null);
          fetchExperts();
          showNotification("success", "Expert saved successfully!");
        }}
        onRequestDelete={async (exp) => {
          setIsEditModalOpen(false);
          setEditingExpert(null);
          try {
            setDeleteLoading(true);
            const res = await fetch("/api/copy-trading/experts", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "delete",
                expertId: exp.id || exp.ref,
              }),
            });
            if (res.ok) {
              fetchExperts();
              showNotification("success", `${exp.name} deleted successfully`);
            } else {
              showNotification("error", "Failed to delete expert");
            }
          } catch {
            showNotification("error", "Failed to delete expert");
          } finally {
            setDeleteLoading(false);
          }
        }}
      />

      {/* View Details Drawer */}
    </div>
  );
}
