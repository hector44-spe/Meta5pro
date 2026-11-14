"use client";

import React, { useState } from "react";
import { CreditCard, X, Loader2 } from "lucide-react";

export interface CardTypeOption {
  name: "Regular" | "Virtual" | "Physical";
  title: string;
  kycRequired: boolean;
  issuanceFee: number;
  depositTotalMinimum: number | null;
}

const CARD_OPTIONS: CardTypeOption[] = [
  {
    name: "Regular",
    title: "Regular Card",
    kycRequired: false,
    issuanceFee: 1000,
    depositTotalMinimum: null,
  },
  {
    name: "Virtual",
    title: "Virtual Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 10000,
  },
  {
    name: "Physical",
    title: "Physical Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 50000,
  },
];

interface RequestCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestCardModal({ isOpen, onClose, onSuccess }: RequestCardModalProps) {
  const [selectedCard, setSelectedCard] = useState<CardTypeOption | null>(null);
  const [cardPin, setCardPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCard = (opt: CardTypeOption) => {
    setSelectedCard(opt);
    setError(null);
  };

  const handleRequest = async () => {
    if (!selectedCard) return;
    if (cardPin.trim().length > 0 && cardPin.trim().length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          cardType: selectedCard.name,
          cardPin: cardPin.trim() || "1234",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to request card");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to request card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="request-card-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="request-card-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="request-card-header">
          <h3>Request a card</h3>
          <button
            type="button"
            className="cards-drawer-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cards Label */}
        <div className="request-card-section-label">Cards</div>

        {/* Cards Option List */}
        <div className="request-card-levels-wrapper">
          {CARD_OPTIONS.map((opt) => {
            const isSelected = selectedCard?.name === opt.name;
            return (
              <div
                key={opt.name}
                className={`request-card-level ${isSelected ? "active" : ""}`}
                onClick={() => handleSelectCard(opt)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectCard(opt);
                  }
                }}
              >
                {/* Level Top */}
                <div className="request-card-level-top">
                  <div className="request-card-level-top-left">
                    <CreditCard size={14} strokeWidth={1.5} color="#ffffff" />
                    <p>{opt.title}</p>
                  </div>
                </div>

                {/* Level Bottom */}
                <div className="request-card-level-bottom">
                  {opt.kycRequired && (
                    <div className="request-card-bottom-content">
                      <p>KYC required:</p>
                      <p>Yes</p>
                    </div>
                  )}

                  <div className="request-card-bottom-content">
                    <p>Issurance fee:</p>
                    <p>${opt.issuanceFee.toLocaleString()}</p>
                  </div>

                  <div className="request-card-bottom-content">
                    <p>Deposit total minimum:</p>
                    <p>
                      {opt.depositTotalMinimum !== null
                        ? `$${opt.depositTotalMinimum.toLocaleString()}`
                        : "No minimum"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Card Pin Input (Matches Image 3) */}
        {selectedCard && (
          <div className="request-card-pin-box">
            <label htmlFor="card-pin-input">Card pin:</label>
            <input
              id="card-pin-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={cardPin}
              onChange={(e) => setCardPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="request-card-pin-input"
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <p style={{ color: "#ff3344", fontSize: "12px", marginTop: "10px", marginInline: 0 }}>
            {error}
          </p>
        )}

        {/* Footer Action Button */}
        <div className="request-card-footer">
          <button
            type="button"
            className="cards-btn-primary"
            disabled={!selectedCard || loading}
            onClick={handleRequest}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : selectedCard ? (
              "Request card"
            ) : (
              "Select a type"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
