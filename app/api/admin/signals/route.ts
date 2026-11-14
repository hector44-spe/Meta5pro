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

    // 1. Fetch all user signal purchases from app_settings
    const signalSettings = await prisma.appSetting.findMany({
      where: { key: { startsWith: "signals_" } },
    });

    const userIds = signalSettings.map((s) => s.key.replace("signals_", "")).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, username: true, fullName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const purchases: AdminSignalPurchase[] = [];
    for (const setting of signalSettings) {
      const uId = setting.key.replace("signals_", "");
      const u = userMap.get(uId);
      if (Array.isArray(setting.value)) {
        for (const item of setting.value as any[]) {
          purchases.push({
            id: item.ref || item.id || `sig_${Math.random().toString(36).slice(2)}`,
            ref: item.ref || item.id || "SIG-REF",
            userId: uId,
            userEmail: u?.email || "Unknown user",
            userFullName: u?.fullName || u?.username || "Investor",
            signalTitle: item.signal || item.signalTitle || "Trading Signal",
            amount: Number(item.price || item.amount || 0),
            strength: Number(item.strength || 50),
            status: item.status || "active",
            date: item.date || new Date().toISOString(),
          });
        }
      }
    }

    purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    const { action, userId, purchaseId, newStatus, signal, signalId } = body;

    // A. Update status of user signal purchase
    if (action === "updatePurchaseStatus") {
      if (!userId || !purchaseId || !newStatus) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      const key = `signals_${userId}`;
      const setting = await prisma.appSetting.findUnique({ where: { key } });
      if (!setting || !Array.isArray(setting.value)) {
        return NextResponse.json({ error: "Signals record not found" }, { status: 404 });
      }
      const list = setting.value as any[];
      const idx = list.findIndex((p) => p.ref === purchaseId || p.id === purchaseId);
      if (idx === -1) {
        return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
      }
      list[idx].status = newStatus;
      await prisma.appSetting.update({
        where: { key },
        data: { value: list },
      });
      return NextResponse.json({ success: true, item: list[idx] });
    }

    // B. Delete purchase record
    if (action === "deletePurchase") {
      if (!userId || !purchaseId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      const key = `signals_${userId}`;
      const setting = await prisma.appSetting.findUnique({ where: { key } });
      if (setting && Array.isArray(setting.value)) {
        const filtered = (setting.value as any[]).filter((p) => p.ref !== purchaseId && p.id !== purchaseId);
        await prisma.appSetting.update({
          where: { key },
          data: { value: filtered },
        });
      }
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
