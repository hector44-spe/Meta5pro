"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, X, CreditCard, Plus, Eye, EyeOff, Settings, ShieldCheck, Truck, Clock, CheckCircle } from "lucide-react";
import RequestCardModal from "./RequestCardModal";
import "@/styles/cards.css";

export interface UserCard {
  id: string;
  ref: string;
  userId: string;
  type: "Regular" | "Virtual" | "Physical";
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardPin: string;
  status: "active" | "pending" | "blocked";
  balance: number;
  issuanceFee: number;
  createdAt: string;
  transactions?: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
  }>;
  trackingDetails?: Array<{
    id: string;
    status: string;
    date: string;
    time: string;
  }>;
}

interface CardsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function MastercardLogo() {
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="9" r="8" fill="#EB001B" />
      <circle cx="18" cy="9" r="8" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
  );
}

export default function CardsDrawer({ isOpen, onClose }: CardsDrawerProps) {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"transactions" | "tracker">("transactions");
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [changePinValue, setChangePinValue] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cards");
      const data = await res.json();
      if (data.cards) {
        setCards(data.cards);
      }
    } catch (err) {
      console.error("Error loading cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCards();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  if (!isOpen) return null;

  const currentCard = cards[activeCardIndex] || cards[0];
  const isDetailsRevealed = currentCard ? revealedCards.has(currentCard.id) : false;

  const toggleRevealDetails = (cardId: string) => {
    setRevealedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleTopUp = async () => {
    if (!currentCard || !topUpAmount || Number(topUpAmount) <= 0) return;
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "topup",
          cardId: currentCard.id,
          amount: Number(topUpAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCards(data.cards);
        setTopUpModalOpen(false);
        setTopUpAmount("");
        showToast("Funds added to card successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePin = async () => {
    if (!currentCard || changePinValue.length !== 4) return;
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changePin",
          cardId: currentCard.id,
          newPin: changePinValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCards(data.cards);
        setSettingsModalOpen(false);
        setChangePinValue("");
        showToast("Card PIN updated successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlock = async () => {
    if (!currentCard) return;
    try {
      const nextStatus = currentCard.status === "blocked" ? "active" : "blocked";
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleStatus",
          cardId: currentCard.id,
          newStatus: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCards(data.cards);
        setSettingsModalOpen(false);
        showToast(`Card ${nextStatus} successfully!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        className="cards-drawer-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="cards-drawer-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="cards-drawer-header">
            <button
              type="button"
              className="cards-drawer-header-left"
              onClick={onClose}
            >
              <ChevronLeft size={16} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className="cards-drawer-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div
              style={{
                margin: "12px 20px 0 20px",
                padding: "10px 14px",
                background: "rgba(79, 107, 255, 0.15)",
                border: "1px solid #4F6BFF",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle size={16} color="#4F6BFF" />
              <span>{notification}</span>
            </div>
          )}

          {/* Body */}
          <div className="cards-drawer-content">
            {cards.length === 0 ? (
              /* EMPTY STATE: Matches Screenshot 1 */
              <div>
                <div className="cards-empty-card">
                  <CreditCard size={14} strokeWidth={1.5} color="rgba(255, 255, 255, 0.5)" />
                  <p>No cards yet</p>
                </div>

                <div className="cards-drawer-footer">
                  <button
                    type="button"
                    className="cards-btn-primary"
                    onClick={() => setShowRequestModal(true)}
                  >
                    Request a card
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE CARDS VIEW */
              <div>
                {/* Multi-card selector if user has more than 1 card */}
                {cards.length > 1 && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto" }}>
                    {cards.map((c, idx) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveCardIndex(idx)}
                        style={{
                          background: activeCardIndex === idx ? "#4F6BFF" : "rgba(255, 255, 255, 0.05)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.type} Card
                      </button>
                    ))}
                  </div>
                )}

                {/* Card Display Card */}
                {currentCard && (
                  <div className="active-card-item">
                    <div className="active-card-top">
                      <div className="active-card-type-tag">
                        <span>{currentCard.type} Card</span>
                        <span className={`active-card-status-badge ${currentCard.status}`}>
                          {currentCard.status}
                        </span>
                      </div>
                      <CreditCard size={16} color="#ffffff" strokeWidth={1.5} />
                    </div>

                    <div className="active-card-number">
                      {isDetailsRevealed
                        ? currentCard.cardNumber.replace(/(\d{4})/g, "$1 ").trim()
                        : `${currentCard.cardNumber.slice(0, 4)} ${currentCard.cardNumber.slice(4, 6)}** **** ****`}
                    </div>

                    <div className="active-card-bottom">
                      <div className="active-card-meta">
                        <div className="active-card-meta-col">
                          <p>EXPIRY</p>
                          <p>{isDetailsRevealed ? currentCard.expiryDate : "**/**"}</p>
                        </div>
                        <div className="active-card-meta-col">
                          <p>CVV</p>
                          <p>{isDetailsRevealed ? currentCard.cvv : "***"}</p>
                        </div>
                      </div>
                      <MastercardLogo />
                    </div>
                  </div>
                )}

                {/* Card Balance and Actions */}
                {currentCard && (
                  <div className="card-actions-wrapper">
                    <div className="card-balance-box">
                      <p className="card-balance-label">Card balance</p>
                      <p className="card-balance-value">${(currentCard.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>

                    <div className="card-action-buttons">
                      <button
                        type="button"
                        className="card-utility-btn primary"
                        onClick={() => setTopUpModalOpen(true)}
                      >
                        Add funds
                      </button>
                      <button
                        type="button"
                        className="card-utility-btn"
                        onClick={() => toggleRevealDetails(currentCard.id)}
                      >
                        {isDetailsRevealed ? "Hide details" : "View details"}
                      </button>
                      <button
                        type="button"
                        className="card-utility-btn"
                        onClick={() => setSettingsModalOpen(true)}
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                )}

                {/* Request Another Card Type if user has fewer than 3 */}
                {cards.length < 3 && (
                  <div style={{ marginTop: "16px" }}>
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(true)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px dashed rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Plus size={14} />
                      <span>Request another card</span>
                    </button>
                  </div>
                )}

                {/* Tabs: Transactions / Tracker */}
                <div className="card-tabs-header">
                  <button
                    type="button"
                    className={`card-tab-btn ${activeTab === "transactions" ? "active" : ""}`}
                    onClick={() => setActiveTab("transactions")}
                  >
                    Transactions
                  </button>
                  {currentCard?.type === "Physical" && (
                    <button
                      type="button"
                      className={`card-tab-btn ${activeTab === "tracker" ? "active" : ""}`}
                      onClick={() => setActiveTab("tracker")}
                    >
                      Tracker
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div style={{ marginTop: "14px" }}>
                  {activeTab === "transactions" ? (
                    <div>
                      {currentCard?.transactions && currentCard.transactions.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {currentCard.transactions.map((tx) => (
                            <div
                              key={tx.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px",
                                background: "rgba(255, 255, 255, 0.03)",
                                borderRadius: "8px",
                                border: "1px solid rgba(255, 255, 255, 0.06)",
                              }}
                            >
                              <div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                                  {tx.description}
                                </p>
                                <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", margin: "2px 0 0 0" }}>
                                  {new Date(tx.date).toLocaleDateString()}
                                </p>
                              </div>
                              <p
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  color: tx.type === "top-up" ? "#00ff99" : "#ffffff",
                                  margin: 0,
                                }}
                              >
                                {tx.type === "top-up" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "30px 16px",
                            textAlign: "center",
                            color: "rgba(255, 255, 255, 0.45)",
                            fontSize: "13px",
                          }}
                        >
                          <CreditCard size={20} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                          <p style={{ margin: 0 }}>No transactions yet</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Tracker Tab for Physical Card */
                    <div style={{ padding: "8px 0" }}>
                      {currentCard?.trackingDetails && currentCard.trackingDetails.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                          {currentCard.trackingDetails.map((step, idx) => (
                            <div key={step.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  backgroundColor: "#4F6BFF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  fontSize: "10px",
                                  flexShrink: 0,
                                  marginTop: "2px",
                                }}
                              >
                                ✓
                              </div>
                              <div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                                  {step.status}
                                </p>
                                <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)", margin: "2px 0 0 0" }}>
                                  {step.date} • {step.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "13px" }}>
                          No tracking information available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Card Modal Popup (Matches Screenshot 2 & 3) */}
      <RequestCardModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          fetchCards();
          showToast("You requested a card successfully!");
        }}
      />

      {/* Top-up Modal */}
      {topUpModalOpen && (
        <div
          className="request-card-modal-overlay"
          onClick={() => setTopUpModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="request-card-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="request-card-header">
              <h3>Add funds to card</h3>
              <button
                type="button"
                className="cards-drawer-close-btn"
                onClick={() => setTopUpModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "14px" }}>
              Enter amount to deposit into your {currentCard?.type} card.
            </p>
            <input
              type="number"
              placeholder="Amount in USD"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="request-card-pin-input"
              style={{ letterSpacing: "normal" }}
              autoFocus
            />
            <div className="request-card-footer" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="cards-btn-primary"
                disabled={!topUpAmount || Number(topUpAmount) <= 0}
                onClick={handleTopUp}
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Settings Modal */}
      {settingsModalOpen && (
        <div
          className="request-card-modal-overlay"
          onClick={() => setSettingsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="request-card-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="request-card-header">
              <h3>Card Settings</h3>
              <button
                type="button"
                className="cards-drawer-close-btn"
                onClick={() => setSettingsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Change PIN section */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255, 255, 255, 0.5)" }}>
                  Change 4-Digit PIN
                </label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="New 4-digit PIN"
                    value={changePinValue}
                    onChange={(e) => setChangePinValue(e.target.value.replace(/\D/g, ""))}
                    className="request-card-pin-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="card-utility-btn primary"
                    style={{ height: "44px", padding: "0 14px" }}
                    disabled={changePinValue.length !== 4}
                    onClick={handleChangePin}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Block/Unblock toggle */}
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255, 255, 255, 0.5)" }}>
                  Card Status
                </label>
                <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 10px 0" }}>
                  {currentCard?.status === "blocked"
                    ? "Your card is currently blocked and cannot be used for transactions."
                    : "Block this card temporarily if you notice suspicious activity."}
                </p>
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    background: currentCard?.status === "blocked" ? "#4F6BFF" : "rgba(255, 51, 68, 0.2)",
                    color: currentCard?.status === "blocked" ? "#ffffff" : "#ff3344",
                  }}
                >
                  {currentCard?.status === "blocked" ? "Unblock Card" : "Block Card"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
