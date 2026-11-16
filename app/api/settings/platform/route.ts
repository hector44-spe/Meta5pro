export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/appSettings";

/** Public platform flags the investor UI needs (no admin-only data). */
export async function GET() {
  const [general, deposit, withdrawal, copyExperts, mining] = await Promise.all([
    getSettings("general"),
    getSettings("deposit"),
    getSettings("withdrawal"),
    getSettings("copyExperts"),
    getSettings("mining"),
  ]);

  return NextResponse.json({
    success: true,
    verificationRequired: general.lockVerification,
    cards: { regular: general.allowRegularCard, virtual: general.allowVirtualCard },
    deposit: { minDeposit: deposit.minDeposit, maxDeposit: deposit.maxDeposit },
    withdrawal: {
      minWithdrawal: withdrawal.minWithdrawal,
      maxWithdrawal: withdrawal.maxWithdrawal,
      useWithdrawalCode: withdrawal.useWithdrawalCode,
      allowCrypto: withdrawal.allowCrypto,
    },
    copyExperts: { lockCopyExpertsPage: copyExperts.lockCopyExpertsPage },
    mining: { useMinerPictures: mining.useMinerPictures },
  });
}
