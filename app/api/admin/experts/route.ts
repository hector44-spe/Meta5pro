export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface AdminExpertCopier {
  id: string;
  expertId: string;
  expertName: string;
  expertPicture: string;
  minimumStartUp: number;
  profitShare: number;
  userId: string;
  userEmail: string;
  userFullName: string;
  userBalance: number;
  status: string;
}

export interface CopyExpertData {
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

const DEFAULT_EXPERTS: CopyExpertData[] = [
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

async function getStoredExperts(): Promise<CopyExpertData[]> {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: "copy_trading_experts" },
    });
    if (setting && setting.value) {
      const parsed =
        typeof setting.value === "string"
          ? JSON.parse(setting.value)
          : (setting.value as unknown);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as CopyExpertData[];
      }
    }
  } catch (e) {
    console.error("Failed to read copy_trading_experts", e);
  }
  return DEFAULT_EXPERTS;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const experts = await getStoredExperts();

    // Collect all unique user IDs
    const userIds = new Set<string>();
    experts.forEach((exp) => {
      if (Array.isArray(exp.subscriberList)) {
        exp.subscriberList.forEach((uid) => userIds.add(uid));
      }
    });

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        wallet: { select: { mainBalance: true } },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const copiers: AdminExpertCopier[] = [];
    experts.forEach((exp) => {
      if (Array.isArray(exp.subscriberList)) {
        exp.subscriberList.forEach((uid) => {
          const u = userMap.get(uid);
          copiers.push({
            id: `${exp.id}_${uid}`,
            expertId: exp.id,
            expertName: exp.name,
            expertPicture: exp.picture,
            minimumStartUp: Number(exp.minimumStartUp || 0),
            profitShare: Number(exp.profitShare || 0),
            userId: uid,
            userEmail: u?.email || "Unknown user",
            userFullName: u?.fullName || u?.username || "Investor",
            userBalance: Number(u?.wallet?.mainBalance || 0),
            status: "active",
          });
        });
      }
    });

    return NextResponse.json({
      success: true,
      experts,
      copiers,
    });
  } catch (error) {
    console.error("Fetch admin experts error:", error);
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
    const { action, expertId, userId, expert } = body;
    let experts = await getStoredExperts();

    // A. Remove subscriber from expert
    if (action === "removeSubscriber") {
      if (!expertId || !userId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      const idx = experts.findIndex((e) => e.id === expertId || e.ref === expertId);
      if (idx !== -1) {
        const subList = Array.isArray(experts[idx].subscriberList) ? [...experts[idx].subscriberList] : [];
        const uIdx = subList.indexOf(userId);
        if (uIdx !== -1) {
          subList.splice(uIdx, 1);
          experts[idx].subscriberList = subList;
          experts[idx].followers = Math.max(0, Number(experts[idx].followers || 0) - 1);
          await prisma.appSetting.upsert({
            where: { key: "copy_trading_experts" },
            create: { key: "copy_trading_experts", value: JSON.stringify(experts) },
            update: { value: JSON.stringify(experts) },
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    // B. Save expert
    if (action === "saveExpert") {
      if (!expert || !expert.name) {
        return NextResponse.json({ error: "Invalid expert data" }, { status: 400 });
      }
      const id = expert.id || expert.ref || `exp_${Date.now()}`;
      const existingIdx = experts.findIndex((e) => e.id === id || e.ref === id);
      const payload: CopyExpertData = {
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
        subscriberList: existingIdx >= 0 ? experts[existingIdx].subscriberList : [],
      };

      if (existingIdx >= 0) {
        experts[existingIdx] = payload;
      } else {
        experts.unshift(payload);
      }

      await prisma.appSetting.upsert({
        where: { key: "copy_trading_experts" },
        create: { key: "copy_trading_experts", value: JSON.stringify(experts) },
        update: { value: JSON.stringify(experts) },
      });

      return NextResponse.json({ success: true, experts });
    }

    // C. Delete expert
    if (action === "deleteExpert") {
      if (!expertId) {
        return NextResponse.json({ error: "Missing expertId" }, { status: 400 });
      }
      experts = experts.filter((e) => e.id !== expertId && e.ref !== expertId);
      await prisma.appSetting.upsert({
        where: { key: "copy_trading_experts" },
        create: { key: "copy_trading_experts", value: JSON.stringify(experts) },
        update: { value: JSON.stringify(experts) },
      });
      return NextResponse.json({ success: true, experts });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin experts action error:", error);
    return NextResponse.json({ error: error.message || "Failed action" }, { status: 500 });
  }
}
