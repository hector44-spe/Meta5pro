export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

    // 2. Fetch signal offerings
    const setting = await prisma.appSetting.findUnique({
      where: { key: "trading_signals" },
    });
    let signals: AdminSignalItem[] = DEFAULT_SIGNALS;
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      signals = setting.value as unknown as AdminSignalItem[];
    }

    return NextResponse.json({
      success: true,
      purchases,
      signals,
    });
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
      if (!purchaseId || !newStatus) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const updated = await prisma.signalPurchase.updateMany({
        where: { OR: [{ id: purchaseId }, { ref: purchaseId }] },
        data: { status: newStatus },
      });

      if (updated.count === 0) {
        return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
      }

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

    // C. Save / update signal package
    if (action === "saveSignal") {
      const setting = await prisma.appSetting.findUnique({ where: { key: "trading_signals" } });
      let list: AdminSignalItem[] = DEFAULT_SIGNALS;
      if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
        list = setting.value as unknown as AdminSignalItem[];
      }
      const sId = signal.id || `sig_${Date.now()}`;
      const idx = list.findIndex((s) => s.id === sId || s.name === signal.name);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...signal, id: sId };
      } else {
        list.push({ ...signal, id: sId });
      }
      await prisma.appSetting.upsert({
        where: { key: "trading_signals" },
        update: { value: list as any },
        create: { key: "trading_signals", value: list as any },
      });
      return NextResponse.json({ success: true, signals: list });
    }

    // D. Delete signal package
    if (action === "deleteSignal") {
      const setting = await prisma.appSetting.findUnique({ where: { key: "trading_signals" } });
      let list: AdminSignalItem[] = DEFAULT_SIGNALS;
      if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
        list = setting.value as unknown as AdminSignalItem[];
      }
      list = list.filter((s) => s.id !== signalId && s.name !== signalId);
      await prisma.appSetting.upsert({
        where: { key: "trading_signals" },
        update: { value: list as any },
        create: { key: "trading_signals", value: list as any },
      });
      return NextResponse.json({ success: true, signals: list });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin signals action error:", error);
    return NextResponse.json({ error: error.message || "Failed action" }, { status: 500 });
  }
}
