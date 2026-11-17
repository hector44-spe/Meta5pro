import crypto from "node:crypto";

export interface ReferralUser {
  id: string;
  username: string;
  email: string;
  date: string;
  rewardEarned: number;
  status: "Active" | "Pending";
}

export interface UserReferralData {
  userId: string;
  referralCode: string;
  referralBalance: number;
  rewardsClaimed: number;
  referrals: ReferralUser[];
}

export function generateReferralCode(seed: string): string {
  if (!seed) return "VmDBZTVmbmtYdFBFYm5QaTZjM053WT";
  const hash = crypto.createHash("sha256").update(seed).digest("base64");
  const cleaned = hash.replace(/[^a-zA-Z0-9]/g, "");
  // Pad with canonical characters to ensure 30 characters
  return (cleaned + "VmDBZTVmbmtYdFBFYm5QaTZjM053WT").slice(0, 30);
}
