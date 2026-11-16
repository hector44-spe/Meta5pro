import { prisma } from "./prisma";
import { z } from "zod";

/**
 * Admin-managed platform settings, one JSON row per group in `app_settings`.
 * Add a group by adding its schema + defaults here.
 */
export const SETTING_GROUPS = {
  general: {
    schema: z.object({
      lockVerification: z.boolean(),
      allowRegularCard: z.boolean(),
      allowVirtualCard: z.boolean(),
    }),
    defaults: { lockVerification: false, allowRegularCard: false, allowVirtualCard: false },
  },
  deposit: {
    schema: z.object({
      minDeposit: z.number().nonnegative(),
      maxDeposit: z.number().positive(),
    }),
    defaults: { minDeposit: 100, maxDeposit: 100000 },
  },
  withdrawal: {
    schema: z.object({
      minWithdrawal: z.number().nonnegative(),
      maxWithdrawal: z.number().positive(),
      useWithdrawalCode: z.boolean(),
      allowCrypto: z.boolean(),
    }),
    defaults: { minWithdrawal: 10, maxWithdrawal: 1000000, useWithdrawalCode: true, allowCrypto: true },
  },
  copyExperts: {
    schema: z.object({
      lockCopyExpertsPage: z.boolean(),
    }),
    defaults: { lockCopyExpertsPage: false },
  },
  mining: {
    schema: z.object({
      useMinerPictures: z.boolean(),
    }),
    defaults: { useMinerPictures: true },
  },
  referrals: {
    schema: z.object({
      usePercentage: z.boolean(),
      percentage: z.number().min(0).max(100),
    }),
    defaults: { usePercentage: true, percentage: 40 },
  },
  cards: {
    schema: z.object({
      kycRequired: z.boolean(),
      issuanceFee: z.number().nonnegative(),
      minDepositTotal: z.number().nonnegative(),
    }),
    defaults: { kycRequired: true, issuanceFee: 1000, minDepositTotal: 50000 },
  },
  levels: {
    schema: z.object({
      levels: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          minBalance: z.string(),
          profitLimit: z.string(),
          iconType: z.string(),
          color: z.string(),
        })
      ),
    }),
    defaults: {
      levels: [
        {
          id: "bronze",
          name: "Bronze",
          minBalance: "$300,000",
          profitLimit: "No Limit",
          iconType: "diamond",
          color: "#d97706",
        },
        {
          id: "starter",
          name: "Starter",
          minBalance: "$15,000",
          profitLimit: "$15,000",
          iconType: "diamond",
          color: "#94a3b8",
        },
        {
          id: "vip",
          name: "VIP",
          minBalance: "Unlimited",
          profitLimit: "No Limit",
          iconType: "gem",
          color: "#9333ea",
        },
        {
          id: "silver",
          name: "Silver",
          minBalance: "$500,000",
          profitLimit: "No Limit",
          iconType: "sparkle",
          color: "#cbd5e1",
        },
        {
          id: "gold",
          name: "Gold",
          minBalance: "$1,000,000",
          profitLimit: "No Limit",
          iconType: "star",
          color: "#eab308",
        },
      ],
    },
  },
} as const;

export type SettingGroup = keyof typeof SETTING_GROUPS;
export type GeneralSettings = z.infer<(typeof SETTING_GROUPS)["general"]["schema"]>;
export type DepositSettings = z.infer<(typeof SETTING_GROUPS)["deposit"]["schema"]>;
export type WithdrawalSettings = z.infer<(typeof SETTING_GROUPS)["withdrawal"]["schema"]>;
export type CopyExpertsSettings = z.infer<(typeof SETTING_GROUPS)["copyExperts"]["schema"]>;
export type MiningSettings = z.infer<(typeof SETTING_GROUPS)["mining"]["schema"]>;
export type ReferralsSettings = z.infer<(typeof SETTING_GROUPS)["referrals"]["schema"]>;
export type CardsSettings = z.infer<(typeof SETTING_GROUPS)["cards"]["schema"]>;
export type LevelsSettings = z.infer<(typeof SETTING_GROUPS)["levels"]["schema"]>;

export function isSettingGroup(g: string): g is SettingGroup {
  return Object.prototype.hasOwnProperty.call(SETTING_GROUPS, g);
}

/** Current values for a group (stored values merged over defaults). */
export async function getSettings<G extends SettingGroup>(group: G): Promise<z.infer<(typeof SETTING_GROUPS)[G]["schema"]>> {
  const def = SETTING_GROUPS[group];
  const row = await prisma.appSetting.findUnique({ where: { key: group } }).catch(() => null);
  const merged = { ...def.defaults, ...((row?.value as object) ?? {}) };
  const parsed = def.schema.safeParse(merged);
  return (parsed.success ? parsed.data : def.defaults) as z.infer<(typeof SETTING_GROUPS)[G]["schema"]>;
}
