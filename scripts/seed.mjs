// Seeds plans, deposit addresses, an admin and a demo investor into the Prisma database.
// Run after migrations: `npm run seed` (needs DATABASE_URL in .env).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const prisma = new PrismaClient();

// Seed passwords come from the environment; otherwise a random one is generated and printed once.
function seedPassword(envVar, label) {
  const fromEnv = process.env[envVar];
  if (fromEnv) return fromEnv;
  const generated = crypto.randomBytes(12).toString("base64url");
  console.log(`Generated ${label} password (set ${envVar} to choose your own): ${generated}`);
  return generated;
}

const plans = [
  { id: "plan_alpha", name: "Alpha Staking", minDeposit: 500, maxDeposit: 10000, dailyRoiPercentage: 0.8, durationDays: 30 },
  { id: "plan_quant", name: "Quant Copytrade", minDeposit: 2500, maxDeposit: 50000, dailyRoiPercentage: 1.4, durationDays: 60 },
  { id: "plan_prime", name: "Institutional Prime", minDeposit: 10000, maxDeposit: 500000, dailyRoiPercentage: 2.2, durationDays: 90 },
];

const depositAddresses = [
  { token: "Ripple", symbol: "XRP", network: "XRP", address: "rsKcLv4k9jkWSFqjEmEnCMn6pMC3LZMTn1" },
  { token: "Ethereum", symbol: "ETH", network: "ERC-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7" },
  { token: "USD Coin", symbol: "USDC", network: "ERC-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7" },
  { token: "USD Coin", symbol: "USDC", network: "BEP-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7" },
  { token: "USD Coin", symbol: "USDC", network: "Solana", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkkD88V5K1kGqXz999" },
  { token: "Tether", symbol: "USDT", network: "TRC-20", address: "TJY6ZpB8E7WcEKnLq3h74V75tKjM9zD5eR" },
  { token: "Tether", symbol: "USDT", network: "BEP-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7" },
  { token: "Tether", symbol: "USDT", network: "ERC-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7" },
  { token: "Solana", symbol: "SOL", network: "Solana", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkkD88V5K1kGqXz999" },
  { token: "Bitcoin", symbol: "BTC", network: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
];

async function main() {
  // 1. Plans
  for (const p of plans) {
    await prisma.plan.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  console.log("✓ Plans");

  // 2. Deposit addresses (only missing ones; existing edits are kept)
  for (const a of depositAddresses) {
    await prisma.depositAddress.upsert({
      where: { symbol_network: { symbol: a.symbol, network: a.network } },
      update: {},
      create: a,
    });
  }
  console.log("✓ Deposit addresses");

  // 3. Admin
  const adminEmail = "admin@platform.internal";
  if (!(await prisma.user.findUnique({ where: { email: adminEmail } }))) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        username: "superadmin",
        fullName: "System Administrator",
        passwordHash: await bcrypt.hash(seedPassword("SEED_ADMIN_PASSWORD", "admin"), 12),
        role: "ADMIN",
        wallet: { create: {} },
      },
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  }

  // 4. Demo investor with two pending requests for the admin queue
  const investorEmail = "investor@platform.internal";
  if (!(await prisma.user.findUnique({ where: { email: investorEmail } }))) {
    await prisma.user.create({
      data: {
        email: investorEmail,
        username: "alexander_investor",
        fullName: "Alexander Sterling",
        phoneNumber: "+1 555-0199",
        passwordHash: await bcrypt.hash(seedPassword("SEED_INVESTOR_PASSWORD", "demo investor"), 12),
        wallet: {
          create: { mainBalance: 18450, interestBalance: 1240.5, totalDeposited: 25000, totalWithdrawn: 6550 },
        },
        transactions: {
          create: [
            { type: "DEPOSIT", amount: 10000, currency: "USDT (TRC-20)", cryptoAddress: "TJY6ZpB8E7WcEKnLq3h74V75tKjM9zD5eR", txHash: "a7f34c98b21e04...498b31B5" },
            { type: "WITHDRAWAL", amount: 4500, currency: "BTC", cryptoAddress: "bc1q9p8e7wc4knlq3h74v75tkjm9zd5er06xyz888" },
          ],
        },
      },
    });
    console.log(`✓ Demo investor created: ${investorEmail}`);
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
