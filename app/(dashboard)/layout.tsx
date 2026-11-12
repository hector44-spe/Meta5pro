import React from "react";
import DashboardShell from "@/components/DashboardShell";
import "@/styles/dashboard.css";
import "@/styles/cold-storage-page.css";
import "@/styles/transactions-page.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
