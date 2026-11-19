import { prisma } from "./prisma";
import { normalizeExpertPicture, normalizeExpertPictures } from "./copy-expert-image";

export interface CatalogExpert {
  id: string; ref: string; name: string; username: string; picture: string; bio: string;
  winRate: number; profitShare: number; wins: number; losses: number; tradesCount: number;
  minimumStartUp: number; followers: number; tickType?: "gold" | "blue" | "none";
  subscriberList: string[];
}
export interface CatalogPlan { id: string; name: string; title: string; minimum: number; maximum: number; duration: number; roi: number; placeholder: number }
export interface CatalogSignal { id: string; name: string; title: string; price: number; strength: number; placeholder: number }

export const DEFAULT_EXPERTS: CatalogExpert[] = [
  { id: "albania-fx", ref: "albania-fx", name: "Albania fx", username: "Support", picture: "/assets/copy-trading/albania_support.png", bio: "I can give you a life you dreamed for", winRate: 92, profitShare: 15, wins: 6988, losses: 11, tradesCount: 6999, minimumStartUp: 1000, followers: 13800, tickType: "gold", subscriberList: [] },
  { id: "alex-fx", ref: "alex-fx", name: "Alex", username: "Alexfx", picture: "/assets/copy-trading/alex_avatar.png", bio: "High probability swing trades with strict risk management.", winRate: 88, profitShare: 20, wins: 2140, losses: 312, tradesCount: 2452, minimumStartUp: 2500, followers: 67500, tickType: "gold", subscriberList: [] },
  { id: "Crypto1234", ref: "Crypto1234", name: "Crypto Shark", username: "crypto_shark", picture: "/assets/copy-trading/Crypto-Tokens-and-Crypto-Coins-What-Drives-Performance.png", bio: "Trading crypto momentum and swing positions with strict capital protection.", winRate: 100, profitShare: 15, wins: 101, losses: 0, tradesCount: 101, minimumStartUp: 1500, followers: 8400, tickType: "blue", subscriberList: [] },
  { id: "Sky1234", ref: "Sky1234", name: "Skyital Ltc", username: "skyital", picture: "/assets/copy-trading/IMG_3760.jpeg2026-07-27T02_13_59.718Z.jpg", bio: "Multi-market algorithm & scalping specialist in equities and forex pairs.", winRate: 94, profitShare: 12, wins: 489, losses: 31, tradesCount: 520, minimumStartUp: 1000, followers: 15200, tickType: "gold", subscriberList: [] },
];
export const DEFAULT_PLANS: CatalogPlan[] = [
  { id: "Starter1234", name: "Starter", title: "Starter plan", minimum: 11000, maximum: 19500, duration: 3, roi: 200, placeholder: 11000 },
  { id: "Lite1234", name: "Lite", title: "Lite plan", minimum: 20000, maximum: 49500, duration: 3, roi: 300, placeholder: 20000 },
  { id: "Classic1234", name: "Classic", title: "Classic plan", minimum: 50000, maximum: 99500, duration: 3, roi: 350, placeholder: 50000 },
  { id: "Pro1234", name: "Pro", title: "Pro plan", minimum: 100000, maximum: 1000000, duration: 3, roi: 403, placeholder: 100000 },
];
export const DEFAULT_SIGNALS: CatalogSignal[] = [
  { id: "gold-1", name: "Gold signal", title: "Gold signal", price: 2000, strength: 20, placeholder: 2000 },
  { id: "gold-2", name: "Gold signal II", title: "Gold signal II", price: 3000, strength: 30, placeholder: 3000 },
  { id: "gold-x", name: "Gold x", title: "Gold x", price: 5000, strength: 50, placeholder: 5000 },
  { id: "acd-pro", name: "ACD-Pro", title: "ACD-Pro", price: 2000, strength: 10, placeholder: 2000 },
  { id: "cd-v5-pro", name: "CD V5 Pro", title: "CD V5 Pro", price: 3000, strength: 43, placeholder: 3000 },
  { id: "bc-irs", name: "BC-IRS", title: "BC-IRS", price: 7000, strength: 83, placeholder: 7000 },
];

function legacyArray(value: unknown): unknown[] {
  if (typeof value === "string") { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
  return Array.isArray(value) ? value : [];
}

export async function ensureRelationalCatalogs() {
  const [expertCount, planCount, signalCount] = await Promise.all([
    prisma.copyExpert.count(), prisma.subscriptionPlanConfig.count(), prisma.tradingSignalConfig.count(),
  ]);
  const keys: string[] = [];
  if (!expertCount) keys.push("copy_trading_experts");
  if (!planCount) keys.push("subscription_plans");
  if (!signalCount) keys.push("trading_signals");
  const settings = keys.length ? await prisma.appSetting.findMany({ where: { key: { in: keys } } }) : [];
  const setting = new Map(settings.map((row) => [row.key, row.value]));

  if (!expertCount) {
    const raw = legacyArray(setting.get("copy_trading_experts"));
    const experts = normalizeExpertPictures((raw.length ? raw : DEFAULT_EXPERTS) as CatalogExpert[]);
    await prisma.$transaction(async (tx) => {
      for (const [sort, expert] of experts.entries()) {
        const id = expert.id || expert.ref || `expert_${sort}`;
        await tx.copyExpert.upsert({ where: { id }, update: {}, create: {
          id, ref: expert.ref || id, name: expert.name, username: expert.username || "", picture: normalizeExpertPicture(expert.picture, id), bio: expert.bio || "",
          winRate: Number(expert.winRate || 0), profitShare: Number(expert.profitShare || 0), wins: Number(expert.wins || 0), losses: Number(expert.losses || 0), tradesCount: Number(expert.tradesCount || 0), minimumStartUp: Number(expert.minimumStartUp || 0), followers: Number(expert.followers || 0), tickType: expert.tickType || "none",
        }});
        const userIds = [...new Set(Array.isArray(expert.subscriberList) ? expert.subscriberList : [])];
        const validUsers = userIds.length ? await tx.user.findMany({ where: { id: { in: userIds } }, select: { id: true } }) : [];
        if (validUsers.length) await tx.copyExpertSubscription.createMany({ data: validUsers.map((user) => ({ expertId: id, userId: user.id })), skipDuplicates: true });
      }
    });
  }
  if (!planCount) {
    const raw = legacyArray(setting.get("subscription_plans"));
    const plans = (raw.length ? raw : DEFAULT_PLANS) as CatalogPlan[];
    await prisma.subscriptionPlanConfig.createMany({ data: plans.map((p, sortOrder) => ({ ...p, placeholder: Number(p.placeholder ?? p.minimum), sortOrder })), skipDuplicates: true });
  }
  if (!signalCount) {
    const raw = legacyArray(setting.get("trading_signals"));
    const signals = (raw.length ? raw : DEFAULT_SIGNALS) as CatalogSignal[];
    await prisma.tradingSignalConfig.createMany({ data: signals.map((s, sortOrder) => ({ ...s, placeholder: Number(s.placeholder ?? s.price), strength: Math.max(0, Math.min(100, Number(s.strength))), sortOrder })), skipDuplicates: true });
  }
}

export async function getCatalogExperts(): Promise<CatalogExpert[]> {
  await ensureRelationalCatalogs();
  const rows = await prisma.copyExpert.findMany({ include: { subscribers: { where: { active: true }, select: { userId: true } } }, orderBy: { createdAt: "asc" } });
  return normalizeExpertPictures(rows.map((row) => ({ id: row.id, ref: row.ref, name: row.name, username: row.username, picture: row.picture, bio: row.bio, winRate: Number(row.winRate), profitShare: Number(row.profitShare), wins: row.wins, losses: row.losses, tradesCount: row.tradesCount, minimumStartUp: Number(row.minimumStartUp), followers: row.followers, tickType: row.tickType as CatalogExpert["tickType"], subscriberList: row.subscribers.map((s) => s.userId) })));
}
export async function getCatalogPlans(): Promise<CatalogPlan[]> {
  await ensureRelationalCatalogs();
  const rows = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { minDeposit: "asc" }],
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    title: p.title || `${p.name} plan`,
    minimum: Number(p.minDeposit),
    maximum: Number(p.maxDeposit),
    duration: p.durationDays,
    roi: Number(p.dailyRoiPercentage) * p.durationDays,
    placeholder: Number(p.placeholder ?? p.minDeposit),
  }));
}
export async function getCatalogSignals(): Promise<CatalogSignal[]> { await ensureRelationalCatalogs(); return (await prisma.tradingSignalConfig.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] })).map((s) => ({ id: s.id, name: s.name, title: s.title, price: Number(s.price), strength: s.strength, placeholder: Number(s.placeholder) })); }

export async function saveCatalogExpert(expert: CatalogExpert): Promise<void> {
  await ensureRelationalCatalogs();
  await prisma.$transaction(async (tx) => {
    await tx.copyExpert.upsert({
      where: { id: expert.id },
      create: {
        id: expert.id, ref: expert.ref, name: expert.name, username: expert.username,
        picture: expert.picture, bio: expert.bio, winRate: expert.winRate,
        profitShare: expert.profitShare, wins: expert.wins, losses: expert.losses,
        tradesCount: expert.tradesCount, minimumStartUp: expert.minimumStartUp,
        followers: expert.followers, tickType: expert.tickType ?? "none",
      },
      update: {
        ref: expert.ref, name: expert.name, username: expert.username,
        picture: expert.picture, bio: expert.bio, winRate: expert.winRate,
        profitShare: expert.profitShare, wins: expert.wins, losses: expert.losses,
        tradesCount: expert.tradesCount, minimumStartUp: expert.minimumStartUp,
        followers: expert.followers, tickType: expert.tickType ?? "none",
      },
    });
    if (Array.isArray(expert.subscriberList)) {
      const valid = await tx.user.findMany({ where: { id: { in: expert.subscriberList } }, select: { id: true } });
      await tx.copyExpertSubscription.updateMany({ where: { expertId: expert.id }, data: { active: false } });
      for (const user of valid) {
        await tx.copyExpertSubscription.upsert({
          where: { expertId_userId: { expertId: expert.id, userId: user.id } },
          create: { expertId: expert.id, userId: user.id, active: true },
          update: { active: true },
        });
      }
    }
  });
}

export async function setCatalogExpertSubscription(expertId: string, userId: string, active: boolean): Promise<boolean> {
  await ensureRelationalCatalogs();
  return prisma.$transaction(async (tx) => {
    const current = await tx.copyExpertSubscription.findUnique({ where: { expertId_userId: { expertId, userId } } });
    const changed = active ? !current?.active : current?.active === true;
    await tx.copyExpertSubscription.upsert({
      where: { expertId_userId: { expertId, userId } },
      create: { expertId, userId, active }, update: { active },
    });
    if (changed) {
      const expert = await tx.copyExpert.findUnique({ where: { id: expertId }, select: { followers: true } });
      await tx.copyExpert.update({ where: { id: expertId }, data: { followers: active ? (expert?.followers ?? 0) + 1 : Math.max(0, (expert?.followers ?? 0) - 1) } });
    }
    return changed;
  });
}
