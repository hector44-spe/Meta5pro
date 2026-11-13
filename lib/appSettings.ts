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
} as const;

export type SettingGroup = keyof typeof SETTING_GROUPS;
export type GeneralSettings = z.infer<(typeof SETTING_GROUPS)["general"]["schema"]>;

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
