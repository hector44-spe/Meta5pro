export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/appSettings";
import { getSession } from "@/lib/auth";

/** Signed-in investor settings, including enabled payment instructions. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [general, deposit, withdrawal, copyExperts, mining, referrals, cards, levels] = await Promise.all([
    getSettings("general"),
    getSettings("deposit"),
    getSettings("withdrawal"),
    getSettings("copyExperts"),
    getSettings("mining"),
    getSettings("referrals"),
    getSettings("cards"),
    getSettings("levels"),
  ]);

  return NextResponse.json({
    success: true,
    verificationRequired: general.lockVerification,
    cards: {
      regular: general.allowRegularCard,
      virtual: general.allowVirtualCard,
      kycRequired: cards.kycRequired,
      issuanceFee: cards.issuanceFee,
      minDepositTotal: cards.minDepositTotal,
    },
    deposit: {
      minDeposit: deposit.minDeposit,
      maxDeposit: deposit.maxDeposit,
      allowCrypto: deposit.allowCrypto,
      allowBankTransfer: deposit.allowBankTransfer,
      allowPayPal: deposit.allowPayPal,
      banks: deposit.banks,
      paypalRecipientName: deposit.paypalRecipientName,
      paypalEmail: deposit.paypalEmail,
    },
    withdrawal: {
      minWithdrawal: withdrawal.minWithdrawal,
      maxWithdrawal: withdrawal.maxWithdrawal,
      useWithdrawalCode: withdrawal.useWithdrawalCode,
      allowCrypto: withdrawal.allowCrypto,
      allowBankTransfer: withdrawal.allowBankTransfer,
      allowPayPal: withdrawal.allowPayPal,
    },
    copyExperts: {
      lockCopyExpertsPage: copyExperts.lockCopyExpertsPage,
      requireAccessCode: copyExperts.requireAccessCode,
    },
    mining: { useMinerPictures: mining.useMinerPictures },
    referrals: { usePercentage: referrals.usePercentage, percentage: referrals.percentage },
    levels: levels.levels,
  });
}
