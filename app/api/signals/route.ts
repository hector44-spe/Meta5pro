import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface SignalItem {
  id: string;
  name: string;
  title: string;
  price: number;
  strength: number;
  placeholder: number;
}

const DEFAULT_SIGNALS: SignalItem[] = [
  {
    id: "gold-1",
    name: "Gold signal",
    title: "Gold signal",
    price: 2000,
    strength: 20,
    placeholder: 2000,
  },
  {
    id: "gold-2",
    name: "Gold signal II",
    title: "Gold signal II",
    price: 3000,
    strength: 30,
    placeholder: 3000,
  },
  {
    id: "gold-x",
    name: "Gold x",
    title: "Gold x",
    price: 5000,
    strength: 50,
    placeholder: 5000,
  },
  {
    id: "acd-pro",
    name: "ACD-Pro",
    title: "ACD-Pro",
    price: 2000,
    strength: 10,
    placeholder: 2000,
  },
  {
    id: "cd-v5-pro",
    name: "CD V5 Pro",
    title: "CD V5 Pro",
    price: 3000,
    strength: 43,
    placeholder: 3000,
  },
  {
    id: "bc-irs",
    name: "BC-IRS",
    title: "BC-IRS",
    price: 7000,
    strength: 83,
    placeholder: 7000,
  },
];

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    const setting = await prisma.appSetting.findUnique({
      where: { key: "trading_signals" },
    });

    let signals: SignalItem[] = DEFAULT_SIGNALS;
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      signals = setting.value as unknown as SignalItem[];
    }

    return NextResponse.json({
      success: true,
      signals,
      isAdmin,
    });
  } catch (error) {
    console.error("Fetch signals error:", error);
    return NextResponse.json({
      success: true,
      signals: DEFAULT_SIGNALS,
      isAdmin: false,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required to edit signals" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, signal, signalId } = body;

    const setting = await prisma.appSetting.findUnique({
      where: { key: "trading_signals" },
    });

    let currentSignals: SignalItem[] = DEFAULT_SIGNALS;
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      currentSignals = setting.value as unknown as SignalItem[];
    }

    let updatedSignals: SignalItem[];

    if (action === "save") {
      const idx = currentSignals.findIndex((s) => s.id === signal.id);
      if (idx !== -1) {
        updatedSignals = [...currentSignals];
        updatedSignals[idx] = { ...updatedSignals[idx], ...signal };
      } else {
        updatedSignals = [...currentSignals, signal];
      }
    } else if (action === "delete") {
      updatedSignals = currentSignals.filter((s) => s.id !== signalId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.appSetting.upsert({
      where: { key: "trading_signals" },
      update: { value: updatedSignals as any },
      create: { key: "trading_signals", value: updatedSignals as any },
    });

    return NextResponse.json({
      success: true,
      signals: updatedSignals,
    });
  } catch (error: any) {
    console.error("Save signal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save signal" },
      { status: 500 }
    );
  }
}
