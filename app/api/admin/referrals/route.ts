export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateReferralCode, UserReferralData } from "@/lib/referralData";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const referralUsers = await Promise.all(
      users.map(async (u) => {
        const key = `user_referrals_${u.id}`;
        const setting = await prisma.appSetting.findUnique({ where: { key } });
        let data: UserReferralData;
        if (setting?.value && typeof setting.value === "object") {
          data = setting.value as unknown as UserReferralData;
        } else {
          data = {
            userId: u.id,
            referralCode: generateReferralCode(u.id),
            referralBalance: 0,
            rewardsClaimed: 0,
            referrals: [],
          };
        }
        return {
          id: u.id,
          email: u.email,
          username: u.username,
          referralCode: data.referralCode || generateReferralCode(u.id),
          referralBalance: data.referralBalance || 0,
          rewardsClaimed: data.rewardsClaimed || 0,
          friendsInvited: data.referrals?.length || 0,
          createdAt: u.createdAt,
        };
      })
    );

    return NextResponse.json({ success: true, referralUsers });
  } catch (error) {
    console.error("Admin referrals GET error:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, referralBalance } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const key = `user_referrals_${userId}`;
    const setting = await prisma.appSetting.findUnique({ where: { key } });
    let data: UserReferralData = (setting?.value as unknown as UserReferralData) || {
      userId,
      referralCode: generateReferralCode(userId),
      referralBalance: 0,
      rewardsClaimed: 0,
      referrals: [],
    };

    data.referralBalance = Number(referralBalance) || 0;

    await prisma.appSetting.upsert({
      where: { key },
      create: { key, value: data as any },
      update: { value: data as any },
    });

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error("Admin referrals POST error:", error);
    return NextResponse.json({ error: "Failed to update referral" }, { status: 500 });
  }
}
