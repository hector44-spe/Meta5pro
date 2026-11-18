import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCatalogSignals } from "@/lib/relational-catalogs";

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

    const signals = await getCatalogSignals();

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

    if (action === "save") {
      if (!signal?.id || !signal?.name) return NextResponse.json({ error: "Invalid signal" }, { status: 400 });
      await prisma.tradingSignalConfig.upsert({ where: { id: signal.id }, update: { name: signal.name, title: signal.title, price: Number(signal.price), strength: Math.max(0, Math.min(100, Number(signal.strength))), placeholder: Number(signal.placeholder ?? signal.price), active: true }, create: { id: signal.id, name: signal.name, title: signal.title, price: Number(signal.price), strength: Math.max(0, Math.min(100, Number(signal.strength))), placeholder: Number(signal.placeholder ?? signal.price) } });
    } else if (action === "delete") {
      await prisma.tradingSignalConfig.updateMany({ where: { id: signalId }, data: { active: false } });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedSignals = await getCatalogSignals();

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
