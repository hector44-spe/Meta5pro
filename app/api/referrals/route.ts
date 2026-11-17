export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateReferralCode, UserReferralData } from "@/lib/referralData";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = `user_referrals_${session.userId}`;
    const setting = await prisma.appSetting.findUnique({
      where: { key },
    });

    let data: UserReferralData;
    if (setting && setting.value && typeof setting.value === "object") {
      data = setting.value as unknown as UserReferralData;
      if (!data.referralCode) {
        data.referralCode = generateReferralCode(session.userId);
      }
    } else {
      data = {
        userId: session.userId,
        referralCode: generateReferralCode(session.userId),
        referralBalance: 0,
        rewardsClaimed: 0,
        referrals: [],
      };
      // Save default
      await prisma.appSetting.upsert({
        where: { key },
        create: {
          key,
          value: data as any,
        },
        update: {
          value: data as any,
        },
      });
    }

    return NextResponse.json({
      success: true,
      referralCode: data.referralCode,
      referralBalance: data.referralBalance || 0,
      rewardsClaimed: data.rewardsClaimed || 0,
      friendsInvited: data.referrals?.length || 0,
      referrals: data.referrals || [],
    });
  } catch (error) {
    console.error("Referral GET error:", error);
    return NextResponse.json(
      {
        success: true,
        referralCode: "VmDBZTVmbmtYdFBFYm5QaTZjM053WT",
        referralBalance: 0,
        rewardsClaimed: 0,
        friendsInvited: 0,
        referrals: [],
      },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "claim";

    const key = `user_referrals_${session.userId}`;
    const setting = await prisma.appSetting.findUnique({
      where: { key },
    });

    const data: UserReferralData = (setting?.value as unknown as UserReferralData) || {
      userId: session.userId,
      referralCode: generateReferralCode(session.userId),
      referralBalance: 0,
      rewardsClaimed: 0,
      referrals: [],
    };

    if (action === "claim") {
      const balanceToClaim = Number(data.referralBalance || 0);
      if (balanceToClaim <= 0) {
        return NextResponse.json(
          { error: "No referral balance available to claim." },
          { status: 400 }
        );
      }

      // Credit to user's wallet
      await prisma.$transaction(async (tx) => {
        await tx.wallet.upsert({
          where: { userId: session.userId },
          create: {
            userId: session.userId,
            mainBalance: balanceToClaim,
          },
          update: {
            mainBalance: { increment: balanceToClaim },
          },
        });

        // Record a transaction
        await tx.transaction.create({
          data: {
            userId: session.userId,
            type: "COMMISSION",
            amount: balanceToClaim,
            currency: "USD",
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });
      });

      // Update referral state
      data.rewardsClaimed = (data.rewardsClaimed || 0) + balanceToClaim;
      data.referralBalance = 0;

      await prisma.appSetting.upsert({
        where: { key },
        create: {
          key,
          value: data as any,
        },
        update: {
          value: data as any,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully claimed $${balanceToClaim.toFixed(2)} in referral rewards!`,
        claimedAmount: balanceToClaim,
        newReferralBalance: 0,
        rewardsClaimed: data.rewardsClaimed,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Referral POST error:", error);
    return NextResponse.json({ error: "Failed to process referral request" }, { status: 500 });
  }
}
