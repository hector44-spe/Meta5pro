"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, X, ShieldCheck } from "lucide-react";
import DepositModal from "@/components/DepositModal";

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
  const [step, setStep] = useState<"CONFIG" | "PAYMENT">("CONFIG");
  const [selectedCard, setSelectedCard] = useState<CardTypeOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep("CONFIG");
      setSelectedCard(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectCard = (opt: CardTypeOption) => {
    setSelectedCard(opt);
    setError(null);
  };

  const handleProceedToPayment = () => {
    if (!selectedCard) return;
    setError(null);
    setStep("PAYMENT");
  };

  // If in PAYMENT step, use the standard multi-step DepositModal
  if (step === "PAYMENT" && selectedCard) {
    return (
      <DepositModal
        isOpen={isOpen}
        onClose={() => setStep("CONFIG")}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
        context="card"
        card={selectedCard}
        fixedAmount={selectedCard.issuanceFee}
      />
    );
  }

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
        style={{ maxWidth: "480px" }}
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

        {/* Policy Notice: Paid separately */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            backgroundColor: "rgba(79, 107, 255, 0.08)",
            border: "1px solid rgba(79, 107, 255, 0.25)",
            borderRadius: "8px",
            padding: "10px 12px",
            marginBottom: "14px",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <ShieldCheck size={18} color="#4F6BFF" style={{ flexShrink: 0, marginTop: "1px" }} />
          <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.45", color: "#e0e7ff" }}>
            All cards require an issuance fee ($1,000) paid via fresh deposit. Card PIN is configured once your card is approved and active.
          </p>
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
                    <p>Issuance fee:</p>
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
            disabled={!selectedCard}
            onClick={handleProceedToPayment}
          >
            {selectedCard ? "Proceed to Separate Payment ($1,000)" : "Select a card type"}
          </button>
        </div>
      </div>
    </div>
  );
}
