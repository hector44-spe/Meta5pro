import { prisma } from "@/lib/prisma";

export interface TradeConfig {
  duration?: string;
  closeAt?: string; // ISO date string
  isCustomPnl?: boolean;
  customPnl?: number;
}

const META_PREFIX = "trade_meta_";

export async function setTradeConfig(positionId: string, config: Partial<TradeConfig>): Promise<void> {
  try {
    const key = `${META_PREFIX}${positionId}`;
    const existing = await getTradeConfig(positionId);
    const merged = { ...existing, ...config };
    await prisma.appSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(merged) },
      update: { value: JSON.stringify(merged) },
    });
  } catch (err) {
    console.error("Failed to save trade config for", positionId, err);
  }
}

export async function getTradeConfig(positionId: string): Promise<TradeConfig | null> {
  try {
    const key = `${META_PREFIX}${positionId}`;
    const setting = await prisma.appSetting.findUnique({ where: { key } });
    if (!setting?.value) return null;
    if (typeof setting.value === "string") {
      return JSON.parse(setting.value) as TradeConfig;
    }
    return setting.value as unknown as TradeConfig;
  } catch {
    return null;
  }
}

export async function deleteTradeConfig(positionId: string): Promise<void> {
  try {
    const key = `${META_PREFIX}${positionId}`;
    await prisma.appSetting.delete({ where: { key } }).catch(() => {});
  } catch {}
}
