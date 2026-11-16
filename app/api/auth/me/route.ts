import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phoneNumber: true,
        country: true,
        role: true,
        status: true,
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const userSafe = {
      ...user,
      wallet: user.wallet
        ? {
            ...user.wallet,
            mainBalance: Number(user.wallet.mainBalance),
            interestBalance: Number(user.wallet.interestBalance),
            totalDeposited: Number(user.wallet.totalDeposited),
            totalWithdrawn: Number(user.wallet.totalWithdrawn),
          }
        : null,
    };

    return NextResponse.json({
      authenticated: true,
      user: userSafe,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
