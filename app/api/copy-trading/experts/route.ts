import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface CopyExpert {
  id: string;
  ref: string;
  name: string;
  username: string;
  picture: string;
  bio: string;
  winRate: number;
  profitShare: number;
  wins: number;
  losses: number;
  tradesCount: number;
  minimumStartUp: number;
  followers: number;
  tickType?: "gold" | "blue" | "none";
  subscriberList: string[];
}

const DEFAULT_EXPERTS: CopyExpert[] = [
  {
    id: "albania-fx",
    ref: "albania-fx",
    name: "Albania fx",
    username: "Support",
    picture: "/assets/copy-trading/albania_support.png",
    bio: "I can give you a life you dreamed for",
    winRate: 92,
    profitShare: 15,
    wins: 6988,
    losses: 11,
    tradesCount: 6999,
    minimumStartUp: 1000,
    followers: 13800,
    tickType: "gold",
    subscriberList: [],
  },
  {
    id: "alex-fx",
    ref: "alex-fx",
    name: "Alex",
    username: "Alexfx",
    picture: "/assets/copy-trading/alex_avatar.png",
    bio: "High probability swing trades with strict risk management.",
    winRate: 88,
    profitShare: 20,
    wins: 2140,
    losses: 312,
    tradesCount: 2452,
    minimumStartUp: 2500,
    followers: 67500,
    tickType: "gold",
    subscriberList: [],
  },
  {
    id: "Crypto1234",
    ref: "Crypto1234",
    name: "Crypto Shark",
    username: "crypto_shark",
    picture: "https://i0.wp.com/blogs.cfainstitute.org/investor/files/2022/04/Crypto-Tokens-and-Crypto-Coins-What-Drives-Performance.png?fit=1200%2C697&ssl=1",
    bio: "Trading crypto momentum and swing positions with strict capital protection.",
    winRate: 100,
    profitShare: 15,
    wins: 101,
    losses: 0,
    tradesCount: 101,
    minimumStartUp: 1500,
    followers: 8400,
    tickType: "blue",
    subscriberList: [],
  },
  {
    id: "Sky1234",
    ref: "Sky1234",
    name: "Skyital Ltc",
    username: "skyital",
    picture: "/assets/copy-trading/IMG_3760.jpeg2026-07-27T02_13_59.718Z.jpg",
    bio: "Multi-market algorithm & scalping specialist in equities and forex pairs.",
    winRate: 94,
    profitShare: 12,
    wins: 489,
    losses: 31,
    tradesCount: 520,
    minimumStartUp: 1000,
    followers: 15200,
    tickType: "gold",
    subscriberList: [],
  },
];

const SETTING_KEY = "copy_trading_experts";

async function getStoredExperts(): Promise<CopyExpert[]> {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: SETTING_KEY },
    });
    if (setting && setting.value) {
      const parsed =
        typeof setting.value === "string"
          ? JSON.parse(setting.value)
          : (setting.value as unknown);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as CopyExpert[];
      }
    }
  } catch (err) {
    console.error("Failed to read copy_trading_experts setting", err);
  }
  return DEFAULT_EXPERTS;
}

async function saveStoredExperts(experts: CopyExpert[]): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    create: {
      key: SETTING_KEY,
      value: JSON.stringify(experts),
    },
    update: {
      value: JSON.stringify(experts),
    },
  });
}

// GET: list experts and current user info
export async function GET() {
  try {
    const session = await getSession();
    const experts = await getStoredExperts();

    return NextResponse.json({
      success: true,
      experts,
      userId: session?.userId || "user_guest",
      isAdmin: session?.role === "ADMIN",
    });
  } catch (err: any) {
    console.error("Error fetching copy trading experts:", err);
    return NextResponse.json(
      { error: "Failed to fetch experts" },
      { status: 500 }
    );
  }
}

// PUT: Admin save/update or delete an expert
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin only." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, expert, expertId } = body;
    let experts = await getStoredExperts();

    if (action === "delete") {
      if (!expertId) {
        return NextResponse.json(
          { error: "Missing expertId to delete" },
          { status: 400 }
        );
      }
      experts = experts.filter(
        (e) => e.id !== expertId && e.ref !== expertId
      );
      await saveStoredExperts(experts);
      return NextResponse.json({ success: true, experts });
    }

    if (action === "save") {
      if (!expert || !expert.name) {
        return NextResponse.json(
          { error: "Invalid expert data" },
          { status: 400 }
        );
      }

      const id = expert.id || expert.ref || `expert_${Date.now()}`;
      const existingIdx = experts.findIndex(
        (e) => e.id === id || e.ref === id
      );

      const expertPayload: CopyExpert = {
        id,
        ref: expert.ref || id,
        name: expert.name,
        username: expert.username || "",
        picture: expert.picture || "/assets/copy-trading/albania_support.png",
        bio: expert.bio || "",
        winRate: Number(expert.winRate) || 0,
        profitShare: Number(expert.profitShare) || 0,
        wins: Number(expert.wins) || 0,
        losses: Number(expert.losses) || 0,
        tradesCount: Number(expert.tradesCount) || 0,
        minimumStartUp: Number(expert.minimumStartUp) || 0,
        followers: Number(expert.followers) || 0,
        tickType: expert.tickType || "none",
        subscriberList: Array.isArray(expert.subscriberList)
          ? expert.subscriberList
          : existingIdx >= 0
          ? experts[existingIdx].subscriberList
          : [],
      };

      if (existingIdx >= 0) {
        experts[existingIdx] = expertPayload;
      } else {
        experts.unshift(expertPayload);
      }

      await saveStoredExperts(experts);
      return NextResponse.json({ success: true, experts });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error managing expert:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Copy or Cancel copying an expert for the current user
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Please log in to copy an expert." },
        { status: 401 }
      );
    }

    const { expertId, action } = await req.json();
    if (!expertId || !action) {
      return NextResponse.json(
        { error: "Missing expertId or action" },
        { status: 400 }
      );
    }

    let experts = await getStoredExperts();
    const idx = experts.findIndex(
      (e) => e.id === expertId || e.ref === expertId
    );

    if (idx === -1) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }

    const target = experts[idx];
    const subList = Array.isArray(target.subscriberList)
      ? [...target.subscriberList]
      : [];

    if (action === "copy") {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { wallet: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const balance = Number(user.wallet?.mainBalance || 0);
      if (target.minimumStartUp && balance < target.minimumStartUp) {
        return NextResponse.json(
          {
            error: `Insufficient balance. Minimum startup is $${target.minimumStartUp.toLocaleString()}`,
          },
          { status: 400 }
        );
      }

      if (!subList.includes(session.userId)) {
        subList.push(session.userId);
        target.followers = Number(target.followers || 0) + 1;
      }
    } else if (action === "cancel") {
      const uIndex = subList.indexOf(session.userId);
      if (uIndex !== -1) {
        subList.splice(uIndex, 1);
        target.followers = Math.max(0, Number(target.followers || 0) - 1);
      }
    }

    target.subscriberList = subList;
    experts[idx] = target;
    await saveStoredExperts(experts);

    return NextResponse.json({
      success: true,
      message:
        action === "copy"
          ? "Expert copied successfully!"
          : "Copying cancelled successfully.",
      expert: target,
    });
  } catch (err: any) {
    console.error("Error in copy trading action:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
