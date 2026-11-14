export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface CardOption {
  id: string;
  name: "Regular" | "Virtual" | "Physical" | string;
  title: string;
  kycRequired: boolean;
  issuanceFee: number;
  depositTotalMinimum: number | null;
  enabled: boolean;
}

const DEFAULT_CARD_OPTIONS: CardOption[] = [
  {
    id: "opt_regular",
    name: "Regular",
    title: "Regular Card",
    kycRequired: false,
    issuanceFee: 1000,
    depositTotalMinimum: null,
    enabled: true,
  },
  {
    id: "opt_virtual",
    name: "Virtual",
    title: "Virtual Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 10000,
    enabled: true,
  },
  {
    id: "opt_physical",
    name: "Physical",
    title: "Physical Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 50000,
    enabled: true,
  },
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all user cards from app_settings where key starts with "cards_"
    const cardSettings = await prisma.appSetting.findMany({
      where: {
        key: {
          startsWith: "cards_",
        },
      },
    });

    const userIds = cardSettings.map((s) => s.key.replace("cards_", "")).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, username: true, fullName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const allCards: any[] = [];
    for (const setting of cardSettings) {
      const uId = setting.key.replace("cards_", "");
      const u = userMap.get(uId);
      if (Array.isArray(setting.value)) {
        for (const card of setting.value as any[]) {
          allCards.push({
            ...card,
            userId: uId,
            userEmail: u?.email || "Unknown",
            userFullName: u?.fullName || u?.username || "Investor",
          });
        }
      }
    }

    allCards.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // 2. Fetch card options
    const optionsSetting = await prisma.appSetting.findUnique({
      where: { key: "card_options" },
    });
    let cardOptions: CardOption[] = DEFAULT_CARD_OPTIONS;
    if (optionsSetting && Array.isArray(optionsSetting.value) && optionsSetting.value.length > 0) {
      cardOptions = optionsSetting.value as unknown as CardOption[];
    }

    return NextResponse.json({
      success: true,
      cards: allCards,
      cardOptions,
    });
  } catch (error) {
    console.error("Fetch admin cards error:", error);
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
    const { action, userId, cardId, newStatus, cardOption, optionId } = body;

    // A. Update card request status (active, blocked, pending)
    if (action === "updateCardStatus") {
      if (!userId || !cardId || !newStatus) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      const key = `cards_${userId}`;
      const setting = await prisma.appSetting.findUnique({ where: { key } });
      if (!setting || !Array.isArray(setting.value)) {
        return NextResponse.json({ error: "Card setting not found" }, { status: 404 });
      }

      const cards = setting.value as any[];
      const idx = cards.findIndex((c) => c.id === cardId || c.ref === cardId);
      if (idx === -1) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      cards[idx].status = newStatus;
      await prisma.appSetting.update({
        where: { key },
        data: { value: cards },
      });

      return NextResponse.json({ success: true, card: cards[idx] });
    }

    // B. Delete a user card request
    if (action === "deleteCard") {
      if (!userId || !cardId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      const key = `cards_${userId}`;
      const setting = await prisma.appSetting.findUnique({ where: { key } });
      if (setting && Array.isArray(setting.value)) {
        const filtered = (setting.value as any[]).filter((c) => c.id !== cardId && c.ref !== cardId);
        await prisma.appSetting.update({
          where: { key },
          data: { value: filtered },
        });
      }
      return NextResponse.json({ success: true });
    }

    // C. Save card option (Regular, Virtual, Physical product settings)
    if (action === "saveCardOption") {
      const optionsSetting = await prisma.appSetting.findUnique({ where: { key: "card_options" } });
      let currentOptions: CardOption[] = DEFAULT_CARD_OPTIONS;
      if (optionsSetting && Array.isArray(optionsSetting.value) && optionsSetting.value.length > 0) {
        currentOptions = optionsSetting.value as unknown as CardOption[];
      }

      let updatedOptions: CardOption[];
      const idx = currentOptions.findIndex((o) => o.id === cardOption.id || o.name === cardOption.name);
      if (idx !== -1) {
        updatedOptions = [...currentOptions];
        updatedOptions[idx] = { ...updatedOptions[idx], ...cardOption };
      } else {
        updatedOptions = [...currentOptions, cardOption];
      }

      await prisma.appSetting.upsert({
        where: { key: "card_options" },
        update: { value: updatedOptions as any },
        create: { key: "card_options", value: updatedOptions as any },
      });

      return NextResponse.json({ success: true, cardOptions: updatedOptions });
    }

    // D. Delete card option
    if (action === "deleteCardOption") {
      const optionsSetting = await prisma.appSetting.findUnique({ where: { key: "card_options" } });
      let currentOptions: CardOption[] = DEFAULT_CARD_OPTIONS;
      if (optionsSetting && Array.isArray(optionsSetting.value) && optionsSetting.value.length > 0) {
        currentOptions = optionsSetting.value as unknown as CardOption[];
      }

      const updatedOptions = currentOptions.filter((o) => o.id !== optionId && o.name !== optionId);
      await prisma.appSetting.upsert({
        where: { key: "card_options" },
        update: { value: updatedOptions as any },
        create: { key: "card_options", value: updatedOptions as any },
      });

      return NextResponse.json({ success: true, cardOptions: updatedOptions });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin cards action error:", error);
    return NextResponse.json({ error: error.message || "Failed action" }, { status: 500 });
  }
}
