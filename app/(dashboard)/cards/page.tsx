"use client";

import React, { useEffect } from "react";
import { useDashboard } from "@/components/DashboardShell";
import { CreditCard } from "lucide-react";

export default function CardsPage() {
  const { openModal, activeModal } = useDashboard();

  useEffect(() => {
    // Automatically open the Cards slide-over drawer when visiting /cards
    openModal("cards");
  }, [openModal]);

  return (
    <div
      style={{
        padding: "32px 24px",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "rgba(79, 107, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          border: "1px solid rgba(79, 107, 255, 0.2)",
        }}
      >
        <CreditCard size={28} color="#4F6BFF" />
      </div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
        Cards Management
      </h2>
      <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)", maxWidth: "420px", margin: "0 0 20px 0" }}>
        Manage your Regular, Virtual, and Physical cards, top up funds, view card details, and track shipping.
      </p>
      {activeModal !== "cards" && (
        <button
          type="button"
          onClick={() => openModal("cards")}
          className="cards-btn-primary"
          style={{ width: "auto", padding: "0 24px" }}
        >
          Open Cards Panel
        </button>
      )}
    </div>
  );
}
