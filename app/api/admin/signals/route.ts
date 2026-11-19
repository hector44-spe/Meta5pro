export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCatalogSignals } from "@/lib/relational-catalogs";
import { atomic, settlePending } from "@/lib/ledger";
import { notify } from "@/lib/notify";

export interface AdminSignalPurchase {
  id: string;
  ref: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  signalTitle: string;
  amount: number;
  strength: number;
  status: string;
  date: string;
}

export interface AdminSignalItem {
  id: string;
  name: string;
  title: string;
  price: number;
  strength: number;
  placeholder?: number;
}

const DEFAULT_SIGNALS: AdminSignalItem[] = [
  { id: "gold-1", name: "Gold signal", title: "Gold signal", price: 2000, strength: 20, placeholder: 2000 },
  { id: "gold-2", name: "Gold signal II", title: "Gold signal II", price: 3000, strength: 30, placeholder: 3000 },
  { id: "gold-x", name: "Gold x", title: "Gold x", price: 5000, strength: 50, placeholder: 5000 },
  { id: "acd-pro", name: "ACD-Pro", title: "ACD-Pro", price: 2000, strength: 10, placeholder: 2000 },
  { id: "cd-v5-pro", name: "CD V5 Pro", title: "CD V5 Pro", price: 3000, strength: 43, placeholder: 3000 },
  { id: "bc-irs", name: "BC-IRS", title: "BC-IRS", price: 7000, strength: 83, placeholder: 7000 },
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all user signal purchases from relational table
    const rows = await prisma.signalPurchase.findMany({
      include: {
        user: { select: { email: true, fullName: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const purchases: AdminSignalPurchase[] = rows.map((r) => ({
      id: r.id,
      ref: r.ref,
      userId: r.userId,
      userEmail: r.user?.email || "Unknown user",
      userFullName: r.user?.fullName || r.user?.username || "Investor",
      signalTitle: r.signalTitle,
      amount: r.price.toNumber(),
      strength: r.strength,
      status: r.status,
      date: r.createdAt.toISOString(),
    }));

    const signals = await getCatalogSignals();

    return NextResponse.json(
      {
        success: true,
        purchases,
        signals,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch admin signals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, purchaseId, newStatus, signal, signalId } = body;

    // A. Update status of user signal purchase
    if (action === "updatePurchaseStatus") {
      if (!purchaseId || !["active", "rejected"].includes(newStatus)) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      const purchase = await prisma.signalPurchase.findFirst({ where: { OR: [{ id: purchaseId }, { ref: purchaseId }] } });
      if (!purchase) {
        return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
      }

      const changed = await atomic(async (tx) => {
        const claimed = await tx.signalPurchase.updateMany({
          where: { id: purchase.id, status: "pending" },
          data: { status: newStatus },
        });
        if (claimed.count !== 1) return false;
        if (purchase.paymentTransactionId) {
          const paymentStatus = newStatus === "active" ? "APPROVED" : "REJECTED";
          if (!(await settlePending(tx, purchase.paymentTransactionId, paymentStatus))) {
            throw new Error("The linked signal payment is already settled");
          }
        }
        await notify(
          purchase.userId,
          "investment",
          newStatus === "active" ? "Signal activated" : "Signal payment rejected",
          newStatus === "active"
            ? `${purchase.signalTitle} is now active on your account.`
            : `The payment submitted for ${purchase.signalTitle} could not be verified.`,
          tx,
        );
        return true;
      });
      if (!changed) return NextResponse.json({ error: "Purchase is already settled" }, { status: 409 });

      return NextResponse.json({ success: true });
    }

    // B. Delete purchase record
    if (action === "deletePurchase") {
      if (!purchaseId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      await prisma.signalPurchase.deleteMany({
        where: { OR: [{ id: purchaseId }, { ref: purchaseId }] },
      });

      return NextResponse.json({ success: true });
    }

    // C. Update strength of user signal purchase
    if (action === "updatePurchaseStrength") {
      const { strength } = body;
      if (!purchaseId || strength === undefined || isNaN(Number(strength))) {
        return NextResponse.json({ error: "Missing purchaseId or strength" }, { status: 400 });
      }

      const clampedStrength = Math.min(100, Math.max(0, Math.round(Number(strength))));

      const updated = await prisma.signalPurchase.updateMany({
        where: { OR: [{ id: purchaseId }, { ref: purchaseId }] },
        data: { strength: clampedStrength },
      });

      if (updated.count === 0) {
        return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, strength: clampedStrength });
    }

    // C. Save / update signal package
    if (action === "saveSignal") {
      const sId = signal.id || `sig_${Date.now()}`;
      await prisma.tradingSignalConfig.upsert({ where: { id: sId }, update: { name: signal.name, title: signal.title, price: Number(signal.price), strength: Math.max(0, Math.min(100, Number(signal.strength))), placeholder: Number(signal.placeholder ?? signal.price), active: true }, create: { id: sId, name: signal.name, title: signal.title, price: Number(signal.price), strength: Math.max(0, Math.min(100, Number(signal.strength))), placeholder: Number(signal.placeholder ?? signal.price) } });
      const list = await getCatalogSignals();
      return NextResponse.json({ success: true, signals: list });
    }

    // D. Delete signal package
    if (action === "deleteSignal") {
      await prisma.tradingSignalConfig.updateMany({ where: { OR: [{ id: signalId }, { name: signalId }] }, data: { active: false } });
      const list = await getCatalogSignals();
      return NextResponse.json({ success: true, signals: list });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin signals action error:", error);
    return NextResponse.json({ error: error.message || "Failed action" }, { status: 500 });
  }
}
