"use client";

import React from "react";
import DepositModal from "@/components/DepositModal";

interface SignalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: {
    id: string;
    title: string;
    strength: number;
    price: number;
  } | null;
  amount: number;
  onSuccess: (result: any) => void;
}

export default function SignalDepositModal({
  isOpen,
  onClose,
  signal,
  amount,
  onSuccess,
}: SignalDepositModalProps) {
  if (!isOpen || !signal) return null;

  return (
    <DepositModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      context="signal"
      signal={signal}
      fixedAmount={amount || signal.price}
    />
  );
}
