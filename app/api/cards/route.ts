import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface UserCard {
  id: string;
  ref: string;
  userId: string;
  type: "Regular" | "Virtual" | "Physical";
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardPin: string;
  status: "active" | "pending" | "blocked";
  balance: number;
  issuanceFee: number;
  createdAt: string;
  transactions?: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
  }>;
  trackingDetails?: Array<{
    id: string;
    status: string;
    date: string;
    time: string;
  }>;
}

function generateCardNumber(prefix = "4242"): string {
  let rest = "";
  for (let i = 0; i < 12; i++) {
    rest += Math.floor(Math.random() * 10).toString();
  }
  return prefix + rest;
}

function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

function generateExpiry(): string {
  const futureYear = new Date().getFullYear() + 4;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  return `${month}/${String(futureYear).slice(-2)}`;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = `cards_${session.userId}`;
    const setting = await prisma.appSetting.findUnique({
      where: { key },
    });

    let cards: UserCard[] = [];
    if (setting && Array.isArray(setting.value)) {
      cards = setting.value as unknown as UserCard[];
    }

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error("Fetch cards error:", error);
    return NextResponse.json({
      success: true,
      cards: [],
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, cardType, cardPin, cardId, amount, newPin, newStatus } = body;
    const key = `cards_${session.userId}`;

    const setting = await prisma.appSetting.findUnique({
      where: { key },
    });

    let cards: UserCard[] = [];
    if (setting && Array.isArray(setting.value)) {
      cards = setting.value as unknown as UserCard[];
    }

    if (action === "request" || !action) {
      const type = (cardType || "Regular") as "Regular" | "Virtual" | "Physical";
      
      // Check if user already has this card type
      const existing = cards.find((c) => c.type.toLowerCase() === type.toLowerCase());
      if (existing) {
        return NextResponse.json(
          { error: `You already have a ${type} card.` },
          { status: 400 }
        );
      }

      const ref = `CRD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const newCard: UserCard = {
        id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        ref,
        userId: session.userId,
        type,
        cardNumber: generateCardNumber(),
        expiryDate: generateExpiry(),
        cvv: generateCVV(),
        cardPin: String(cardPin || "1234").trim(),
        status: "active",
        balance: 0,
        issuanceFee: 1000,
        createdAt: new Date().toISOString(),
        transactions: [],
        trackingDetails:
          type === "Physical"
            ? [
                {
                  id: "t1",
                  status: "Card requested and approved",
                  date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  time: "10:00 AM",
                },
                {
                  id: "t2",
                  status: "Production & packaging",
                  date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  time: "02:30 PM",
                },
                {
                  id: "t3",
                  status: "Dispatched with express courier",
                  date: new Date(Date.now() + 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  time: "09:15 AM",
                },
              ]
            : undefined,
      };

      cards.unshift(newCard);

      await prisma.appSetting.upsert({
        where: { key },
        update: { value: cards as any },
        create: { key, value: cards as any },
      });

      return NextResponse.json({
        success: true,
        message: "You requested a card successfully",
        cards,
        newCard,
      });
    }

    if (action === "topup") {
      const target = cards.find((c) => c.id === cardId || c.ref === cardId);
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      const topupAmount = Number(amount) || 0;
      target.balance = (target.balance || 0) + topupAmount;
      if (!target.transactions) target.transactions = [];
      target.transactions.unshift({
        id: `tx_${Date.now()}`,
        type: "top-up",
        description: "Card Top-Up",
        amount: topupAmount,
        date: new Date().toISOString(),
      });

      await prisma.appSetting.upsert({
        where: { key },
        update: { value: cards as any },
        create: { key, value: cards as any },
      });

      return NextResponse.json({ success: true, cards });
    }

    if (action === "changePin") {
      const target = cards.find((c) => c.id === cardId || c.ref === cardId);
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      target.cardPin = String(newPin || "").trim();

      await prisma.appSetting.upsert({
        where: { key },
        update: { value: cards as any },
        create: { key, value: cards as any },
      });

      return NextResponse.json({ success: true, message: "PIN changed successfully", cards });
    }

    if (action === "toggleStatus") {
      const target = cards.find((c) => c.id === cardId || c.ref === cardId);
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      target.status = (newStatus || (target.status === "blocked" ? "active" : "blocked")) as "active" | "blocked";

      await prisma.appSetting.upsert({
        where: { key },
        update: { value: cards as any },
        create: { key, value: cards as any },
      });

      return NextResponse.json({ success: true, message: `Card ${target.status} successfully`, cards });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Cards POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
