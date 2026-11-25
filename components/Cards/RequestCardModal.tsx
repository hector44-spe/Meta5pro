"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, X, ShieldCheck, Loader2 } from "lucide-react";
import DepositModal from "@/components/DepositModal";

export interface CardTypeOption {
  id?: string;
  name: string;
  title: string;
  kycRequired: boolean;
  issuanceFee: number;
  depositTotalMinimum: number | null;
  enabled?: boolean;
}

const DEFAULT_CARD_OPTIONS: CardTypeOption[] = [
  {
    id: "opt_regular",
    name: "Regular",
    title: "Regular Card",
    kycRequired: false,
    issuanceFee: 1000,
    depositTotalMinimum: null,
    enabled: true,
  },
  {
    id: "opt_virtual",
    name: "Virtual",
    title: "Virtual Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 10000,
    enabled: true,
  },
  {
    id: "opt_physical",
    name: "Physical",
    title: "Physical Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 50000,
    enabled: true,
  },
];

interface RequestCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cardOptions?: CardTypeOption[];
}

export default function RequestCardModal({
  isOpen,
  onClose,
  onSuccess,
  cardOptions: initialOptions,
}: RequestCardModalProps) {
  const [step, setStep] = useState<"CONFIG" | "PAYMENT">("CONFIG");
  const [options, setOptions] = useState<CardTypeOption[]>(
    initialOptions && initialOptions.length > 0 ? initialOptions : DEFAULT_CARD_OPTIONS
  );
  const [selectedCard, setSelectedCard] = useState<CardTypeOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOptions && initialOptions.length > 0) {
      setOptions(initialOptions.filter((o) => o.enabled !== false));
    }
  }, [initialOptions]);

  useEffect(() => {
    if (isOpen) {
      setStep("CONFIG");
      setSelectedCard(null);
      setError(null);
      setLoading(true);

      // Always fetch latest card tiers & fees configured in admin panel
      fetch("/api/cards", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.cardOptions && Array.isArray(data.cardOptions) && data.cardOptions.length > 0) {
            const active = data.cardOptions.filter((o: any) => o.enabled !== false);
            if (active.length > 0) {
              setOptions(active);
            }
          }
        })
        .catch(() => null)
        .finally(() => setLoading(false));
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

  // If in PAYMENT step, use the standard multi-step DepositModal with exact issuance fee
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

  const activeTiers = options.filter((o) => o.enabled !== false);
  const minFee = activeTiers.length > 0 ? Math.min(...activeTiers.map((o) => Number(o.issuanceFee) || 0)) : 1000;
  const maxFee = activeTiers.length > 0 ? Math.max(...activeTiers.map((o) => Number(o.issuanceFee) || 0)) : 1000;
  const feeNoticeText =
    minFee === maxFee
      ? `($${minFee.toLocaleString()})`
      : `(from $${minFee.toLocaleString()})`;

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
            className="cards-drawer-close-btn dm-close-btn close_btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
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
            All cards require an issuance fee {feeNoticeText} paid via fresh deposit. Card PIN is configured once your card is approved and active.
          </p>
        </div>

        {/* Cards Label */}
        <div className="request-card-section-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Cards</span>
          {loading && <Loader2 size={13} className="spin" style={{ color: "#818cf8" }} />}
        </div>

        {/* Cards Option List */}
        <div className="request-card-levels-wrapper">
          {activeTiers.map((opt) => {
            const isSelected = selectedCard?.id === opt.id || selectedCard?.name === opt.name;
            return (
              <div
                key={opt.id || opt.name}
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
                    <p>{opt.title || `${opt.name} Card`}</p>
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
                    <p style={{ color: "#34d399", fontWeight: 700 }}>
                      ${Number(opt.issuanceFee || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="request-card-bottom-content">
                    <p>Deposit total minimum:</p>
                    <p>
                      {opt.depositTotalMinimum !== null && Number(opt.depositTotalMinimum) > 0
                        ? `$${Number(opt.depositTotalMinimum).toLocaleString()}`
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
            {selectedCard
              ? `Proceed to Separate Payment ($${Number(selectedCard.issuanceFee || 0).toLocaleString()})`
              : "Select a card type"}
          </button>
        </div>
      </div>
    </div>
  );
}
