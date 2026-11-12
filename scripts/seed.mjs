import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "broker.db");
const db = new DatabaseSync(dbPath);

console.log("Seeding SQLite database at", dbPath);

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    fullName TEXT,
    phoneNumber TEXT,
    passwordHash TEXT NOT NULL,
    role TEXT DEFAULT 'INVESTOR',
    status TEXT DEFAULT 'ACTIVE',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    mainBalance REAL DEFAULT 0.0,
    interestBalance REAL DEFAULT 0.0,
    totalDeposited REAL DEFAULT 0.0,
    totalWithdrawn REAL DEFAULT 0.0,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    minDeposit REAL NOT NULL,
    maxDeposit REAL NOT NULL,
    dailyRoiPercentage REAL NOT NULL,
    durationDays INTEGER NOT NULL,
    capitalRefund INTEGER DEFAULT 1,
    isActive INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    planId TEXT NOT NULL,
    amount REAL NOT NULL,
    accruedProfit REAL DEFAULT 0.0,
    daysRemaining INTEGER NOT NULL,
    status TEXT DEFAULT 'RUNNING',
    lastPayoutAt TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (planId) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    cryptoAddress TEXT,
    txHash TEXT,
    receiptUrl TEXT,
    status TEXT DEFAULT 'PENDING',
    approvedAt TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

async function seed() {
  const now = new Date().toISOString();

  // 1. Create Default Plans
  const plans = [
    {
      id: "plan_alpha",
      name: "Alpha Staking",
      minDeposit: 500,
      maxDeposit: 10000,
      dailyRoiPercentage: 0.8,
      durationDays: 30,
    },
    {
      id: "plan_quant",
      name: "Quant Copytrade",
      minDeposit: 2500,
      maxDeposit: 50000,
      dailyRoiPercentage: 1.4,
      durationDays: 60,
    },
    {
      id: "plan_prime",
      name: "Institutional Prime",
      minDeposit: 10000,
      maxDeposit: 500000,
      dailyRoiPercentage: 2.2,
      durationDays: 90,
    },
  ];

  for (const p of plans) {
    const existing = db
      .prepare("SELECT id FROM plans WHERE name = ?")
      .get(p.name);
    if (!existing) {
      db.prepare(`
        INSERT INTO plans (id, name, minDeposit, maxDeposit, dailyRoiPercentage, durationDays, capitalRefund, isActive)
        VALUES (?, ?, ?, ?, ?, ?, 1, 1)
      `).run(p.id, p.name, p.minDeposit, p.maxDeposit, p.dailyRoiPercentage, p.durationDays);
    }
  }

  // 2. Admin User
  const adminEmail = "admin@platform.internal";
  const existingAdmin = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(adminEmail);
  if (!existingAdmin) {
    const adminPass = await bcrypt.hash("AdminPassword123!", 12);
    const adminId = "user_admin_001";
    db.prepare(`
      INSERT INTO users (id, email, username, fullName, passwordHash, role, status, createdAt, updatedAt)
      VALUES (?, ?, 'superadmin', 'System Administrator', ?, 'ADMIN', 'ACTIVE', ?, ?)
    `).run(adminId, adminEmail, adminPass, now, now);

    db.prepare(`
      INSERT INTO wallets (id, userId, mainBalance, interestBalance, totalDeposited, totalWithdrawn, updatedAt)
      VALUES ('w_admin_001', ?, 100000.0, 0.0, 100000.0, 0.0, ?)
    `).run(adminId, now);

    console.log("✓ Admin user created: admin@platform.internal / AdminPassword123!");
  }

  // 3. Demo Investor User
  const investorEmail = "investor@platform.internal";
  let investorId = "user_investor_001";
  const existingInvestor = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(investorEmail);
  if (!existingInvestor) {
    const investorPass = await bcrypt.hash("InvestorPassword123!", 12);
    db.prepare(`
      INSERT INTO users (id, email, username, fullName, phoneNumber, passwordHash, role, status, createdAt, updatedAt)
      VALUES (?, ?, 'alexander_investor', 'Alexander Sterling', '+1 555-0199', ?, 'INVESTOR', 'ACTIVE', ?, ?)
    `).run(investorId, investorEmail, investorPass, now, now);

    db.prepare(`
      INSERT INTO wallets (id, userId, mainBalance, interestBalance, totalDeposited, totalWithdrawn, updatedAt)
      VALUES ('w_investor_001', ?, 18450.0, 1240.5, 25000.0, 6550.0, ?)
    `).run(investorId, now);

    console.log(
      "✓ Demo investor created: investor@platform.internal / InvestorPassword123!",
    );
  } else {
    investorId = existingInvestor.id;
  }

  // 4. Sample Pending Transactions for Admin Queue
  const existingTx = db.prepare("SELECT id FROM transactions LIMIT 1").get();
  if (!existingTx) {
    db.prepare(`
      INSERT INTO transactions (id, userId, type, amount, currency, cryptoAddress, txHash, status, createdAt)
      VALUES 
        ('DEP-802', ?, 'DEPOSIT', 10000.00, 'USDT (TRC-20)', 'TJY6ZpB8E7WcEKnLq3h74V75tKjM9zD5eR', 'a7f34c98b21e04...498b31B5', 'PENDING', ?),
        ('WTH-311', ?, 'WITHDRAWAL', 4500.00, 'BTC', 'bc1q9p8e7wc4knlq3h74v75tkjm9zd5er06xyz888', NULL, 'PENDING', ?)
    `).run(investorId, now, investorId, now);
    console.log("✓ Sample pending transactions seeded for admin moderation.");
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
