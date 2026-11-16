import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface UserCard {
  id: string;
  ref: string;
  userId: string;
  type: "Regular" | "Virtual" | "Physical";
  cardNumber: string;
  last4: string;
  expiryDate: string;
  cvv: string;
  cardPin?: string;
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

    const rows = await prisma.card.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    const cards: UserCard[] = rows.map((c) => ({
      id: c.id,
      ref: c.ref,
      userId: c.userId,
      type: c.type as "Regular" | "Virtual" | "Physical",
      cardNumber: c.cardNumber,
      last4: c.last4,
      expiryDate: c.expiryDate,
      cvv: "***",
      status: c.status as "active" | "pending" | "blocked",
      balance: c.balance.toNumber(),
      issuanceFee: c.issuanceFee.toNumber(),
      createdAt: c.createdAt.toISOString(),
      trackingDetails:
        c.type === "Physical"
          ? [
              {
                id: "t1",
                status: "Card requested and approved",
                date: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                time: "10:00 AM",
              },
              {
                id: "t2",
                status: "Production & packaging",
                date: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                time: "02:30 PM",
              },
              {
                id: "t3",
                status: "Dispatched with express courier",
                date: new Date(c.createdAt.getTime() + 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                time: "09:15 AM",
              },
            ]
          : undefined,
    }));

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
    const { action, cardType, cardPin, cardId, amount, newPin, newStatus, currency, network, txHash, receiptUrl, cryptoAddress } = body;

    if (action === "request" || !action) {
      const type = (cardType || "Regular") as "Regular" | "Virtual" | "Physical";

      // Check if user already has this card type
      const existing = await prisma.card.findFirst({
        where: { userId: session.userId, type: { equals: type, mode: "insensitive" } },
      });
      if (existing) {
        return NextResponse.json(
          { error: `You already have a ${type} card.` },
          { status: 400 },
        );
      }

      const rawNumber = generateCardNumber();
      const last4 = rawNumber.slice(-4);
      const masked = `${rawNumber.slice(0, 4)} **** **** ${last4}`;
      const ref = `CRD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const pinHash = await hashPassword(String(cardPin || "1234").trim());

      // All cards are paid for separately via fresh deposit (not from user balance)
      const card = await prisma.card.create({
        data: {
          userId: session.userId,
          ref,
          type,
          cardNumber: masked,
          last4,
          expiryDate: generateExpiry(),
          pinHash,
          status: "pending",
          balance: 0,
          issuanceFee: 1000,
        },
      });

      // Record a dedicated deposit transaction for the $1,000 card issuance payment
      await prisma.transaction.create({
        data: {
          userId: session.userId,
          type: "DEPOSIT",
          status: "PENDING",
          amount: 1000,
          currency: currency ? String(currency).toUpperCase() : "USDT",
          txHash: txHash ? String(txHash).trim() : `CRD_${Date.now().toString(36).toUpperCase()}`,
          receiptUrl: receiptUrl ? String(receiptUrl).trim() : undefined,
          cryptoAddress: cryptoAddress ? String(cryptoAddress).trim() : undefined,
        },
      });

      const newCard: UserCard = {
        id: card.id,
        ref: card.ref,
        userId: card.userId,
        type: card.type as "Regular" | "Virtual" | "Physical",
        cardNumber: card.cardNumber,
        last4: card.last4,
        expiryDate: card.expiryDate,
        cvv: generateCVV(),
        status: card.status as "active" | "pending" | "blocked",
        balance: card.balance.toNumber(),
        issuanceFee: card.issuanceFee.toNumber(),
        createdAt: card.createdAt.toISOString(),
      };

      const userCards = await prisma.card.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        message: "Card request and separate issuance deposit submitted! Your card will activate upon verification.",
        cards: userCards.map((c) => ({
          ...c,
          balance: c.balance.toNumber(),
          issuanceFee: c.issuanceFee.toNumber(),
          cvv: "***",
        })),
        newCard,
      });
    }

    if (action === "topup") {
      const target = await prisma.card.findFirst({
        where: {
          userId: session.userId,
          OR: [{ id: cardId }, { ref: cardId }],
        },
      });
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      const topupAmount = Number(amount) || 0;
      await prisma.card.update({
        where: { id: target.id },
        data: { balance: { increment: topupAmount } },
      });

      const userCards = await prisma.card.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        cards: userCards.map((c) => ({ ...c, balance: c.balance.toNumber(), issuanceFee: c.issuanceFee.toNumber() })),
      });
    }

    if (action === "changePin") {
      const target = await prisma.card.findFirst({
        where: {
          userId: session.userId,
          OR: [{ id: cardId }, { ref: cardId }],
        },
      });
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      const pinHash = await hashPassword(String(newPin || "").trim());
      await prisma.card.update({
        where: { id: target.id },
        data: { pinHash },
      });

      return NextResponse.json({ success: true, message: "PIN changed successfully" });
    }

    if (action === "toggleStatus") {
      const target = await prisma.card.findFirst({
        where: {
          userId: session.userId,
          OR: [{ id: cardId }, { ref: cardId }],
        },
      });
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      const nextStatus = newStatus || (target.status === "blocked" ? "active" : "blocked");
      const updated = await prisma.card.update({
        where: { id: target.id },
        data: { status: nextStatus },
      });

      return NextResponse.json({ success: true, message: `Card ${updated.status} successfully` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Cards POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
