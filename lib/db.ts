import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "broker.db");

// Singleton connection across Next.js reloads and production workers
const globalForDb = globalThis as unknown as {
  sqliteDb: DatabaseSync | undefined;
  sqliteInitialized: boolean | undefined;
};

export const sqlite =
  globalForDb.sqliteDb ?? new DatabaseSync(dbPath);

globalForDb.sqliteDb = sqlite;

function ensureInitialized() {
  if (globalForDb.sqliteInitialized) return;

  try {
    sqlite.exec(`
      PRAGMA busy_timeout = 30000;
      PRAGMA journal_mode = WAL;

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

      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        action TEXT NOT NULL,
        ipAddress TEXT,
        details TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS deposit_addresses (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        symbol TEXT NOT NULL,
        network TEXT NOT NULL,
        address TEXT NOT NULL,
        memo TEXT,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS positions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        entryPrice REAL NOT NULL,
        leverage INTEGER DEFAULT 1,
        status TEXT DEFAULT 'OPEN',
        pnl REAL DEFAULT 0.0,
        closedAt TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expiresAt TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Auto-seed default deposit addresses if any missing
    const defaultAddrs = [
      { token: "Ripple", symbol: "XRP", network: "XRP", address: "rsKcLv4k9jkWSFqjEmEnCMn6pMC3LZMTn1", memo: "" },
      { token: "Ethereum", symbol: "ETH", network: "ERC-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7", memo: "" },
      { token: "USD Coin", symbol: "USDC", network: "ERC-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7", memo: "" },
      { token: "USD Coin", symbol: "USDC", network: "BEP-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7", memo: "" },
      { token: "USD Coin", symbol: "USDC", network: "Solana", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkkD88V5K1kGqXz999", memo: "" },
      { token: "Tether", symbol: "USDT", network: "TRC-20", address: "TJY6ZpB8E7WcEKnLq3h74V75tKjM9zD5eR", memo: "" },
      { token: "Tether", symbol: "USDT", network: "BEP-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7", memo: "" },
      { token: "Tether", symbol: "USDT", network: "ERC-20", address: "0x71C6944e5B889498b31B5c26b65389Da205f14E7", memo: "" },
      { token: "Solana", symbol: "SOL", network: "Solana", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkkD88V5K1kGqXz999", memo: "" },
      { token: "Bitcoin", symbol: "BTC", network: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", memo: "" },
    ];

    const checkStmt = sqlite.prepare("SELECT id FROM deposit_addresses WHERE symbol = ? AND network = ?");
    const insertAddr = sqlite.prepare(`
      INSERT INTO deposit_addresses (id, token, symbol, network, address, memo, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const item of defaultAddrs) {
      const existing = checkStmt.get(item.symbol, item.network);
      if (!existing) {
        insertAddr.run(generateId(), item.token, item.symbol, item.network, item.address, item.memo, now);
      }
    }

    globalForDb.sqliteInitialized = true;
  } catch (err: any) {
    if (!err?.message?.includes("already exists")) {
      console.warn("[DB] Initialization notice:", err?.message || err);
    }
    globalForDb.sqliteInitialized = true;
  }
}

ensureInitialized();

function generateId(): string {
  return "id_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
}

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  phoneNumber: string | null;
  passwordHash: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  wallet?: WalletRecord | null;
}

export interface WalletRecord {
  id: string;
  userId: string;
  mainBalance: number;
  interestBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  updatedAt: string;
}

export interface PlanRecord {
  id: string;
  name: string;
  minDeposit: number;
  maxDeposit: number;
  dailyRoiPercentage: number;
  durationDays: number;
  capitalRefund: boolean;
  isActive: boolean;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  cryptoAddress: string | null;
  txHash: string | null;
  receiptUrl: string | null;
  status: string;
  approvedAt: string | null;
  createdAt: string;
}

export interface InvestmentRecord {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  accruedProfit: number;
  daysRemaining: number;
  status: string;
  lastPayoutAt: string;
  createdAt: string;
  plan?: PlanRecord;
}

export interface DepositAddressRecord {
  id: string;
  token: string;
  symbol: string;
  network: string;
  address: string;
  memo: string | null;
  updatedAt: string;
}

// Typed Database ORM Layer mirroring Prisma API
export const db = {
  user: {
    async findUnique(args: {
      where: { email?: string; id?: string };
      include?: { wallet?: boolean };
      select?: Record<string, boolean>;
    }): Promise<UserRecord | null> {
      let row: any = null;
      if (args.where.email) {
        const stmt = sqlite.prepare(
          "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        );
        row = stmt.get(args.where.email);
      } else if (args.where.id) {
        const stmt = sqlite.prepare("SELECT * FROM users WHERE id = ?");
        row = stmt.get(args.where.id);
      }
      if (!row) return null;

      const user: UserRecord = {
        id: row.id as string,
        email: row.email as string,
        username: row.username as string,
        fullName: row.fullName as string | null,
        phoneNumber: row.phoneNumber as string | null,
        passwordHash: row.passwordHash as string,
        role: row.role as string,
        status: row.status as string,
        createdAt: row.createdAt as string,
        updatedAt: row.updatedAt as string,
      };

      if (args.include?.wallet) {
        const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
        user.wallet = wallet;
      }

      return user;
    },

    async create(args: {
      data: {
        email: string;
        username: string;
        fullName?: string | null;
        phoneNumber?: string | null;
        passwordHash: string;
        role?: string;
        status?: string;
        wallet?: {
          create?: {
            mainBalance?: number;
            interestBalance?: number;
            totalDeposited?: number;
            totalWithdrawn?: number;
          };
        };
      };
      include?: { wallet?: boolean };
    }): Promise<UserRecord> {
      const id = generateId();
      const now = new Date().toISOString();
      const role = args.data.role || "INVESTOR";
      const status = args.data.status || "ACTIVE";

      const stmt = sqlite.prepare(`
        INSERT INTO users (id, email, username, fullName, phoneNumber, passwordHash, role, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        args.data.email.toLowerCase(),
        args.data.username,
        args.data.fullName || null,
        args.data.phoneNumber || null,
        args.data.passwordHash,
        role,
        status,
        now,
        now,
      );

      let wallet: WalletRecord | null = null;
      if (args.data.wallet?.create) {
        const wId = generateId();
        const wStmt = sqlite.prepare(`
          INSERT INTO wallets (id, userId, mainBalance, interestBalance, totalDeposited, totalWithdrawn, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        wStmt.run(
          wId,
          id,
          args.data.wallet.create.mainBalance ?? 0.0,
          args.data.wallet.create.interestBalance ?? 0.0,
          args.data.wallet.create.totalDeposited ?? 0.0,
          args.data.wallet.create.totalWithdrawn ?? 0.0,
          now,
        );
        wallet = {
          id: wId,
          userId: id,
          mainBalance: args.data.wallet.create.mainBalance ?? 0.0,
          interestBalance: args.data.wallet.create.interestBalance ?? 0.0,
          totalDeposited: args.data.wallet.create.totalDeposited ?? 0.0,
          totalWithdrawn: args.data.wallet.create.totalWithdrawn ?? 0.0,
          updatedAt: now,
        };
      }

      return {
        id,
        email: args.data.email,
        username: args.data.username,
        fullName: args.data.fullName || null,
        phoneNumber: args.data.phoneNumber || null,
        passwordHash: args.data.passwordHash,
        role,
        status,
        createdAt: now,
        updatedAt: now,
        wallet,
      };
    },

    async findMany(): Promise<UserRecord[]> {
      const stmt = sqlite.prepare("SELECT * FROM users ORDER BY createdAt DESC");
      const rows = stmt.all() as any[];
      return rows.map((r) => ({
        id: r.id,
        email: r.email,
        username: r.username,
        fullName: r.fullName,
        phoneNumber: r.phoneNumber,
        passwordHash: r.passwordHash,
        role: r.role,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    },
  },

  wallet: {
    async findUnique(args: {
      where: { userId: string };
    }): Promise<WalletRecord | null> {
      const stmt = sqlite.prepare("SELECT * FROM wallets WHERE userId = ?");
      const r: any = stmt.get(args.where.userId);
      if (!r) return null;
      return {
        id: r.id,
        userId: r.userId,
        mainBalance: Number(r.mainBalance),
        interestBalance: Number(r.interestBalance),
        totalDeposited: Number(r.totalDeposited),
        totalWithdrawn: Number(r.totalWithdrawn),
        updatedAt: r.updatedAt,
      };
    },

    async update(args: {
      where: { userId: string };
      data: Partial<
        Omit<WalletRecord, "id" | "userId" | "updatedAt">
      >;
    }): Promise<WalletRecord> {
      const now = new Date().toISOString();
      const current = await db.wallet.findUnique({ where: args.where });
      if (!current) throw new Error("Wallet not found");

      const mainBalance =
        args.data.mainBalance !== undefined
          ? args.data.mainBalance
          : current.mainBalance;
      const interestBalance =
        args.data.interestBalance !== undefined
          ? args.data.interestBalance
          : current.interestBalance;
      const totalDeposited =
        args.data.totalDeposited !== undefined
          ? args.data.totalDeposited
          : current.totalDeposited;
      const totalWithdrawn =
        args.data.totalWithdrawn !== undefined
          ? args.data.totalWithdrawn
          : current.totalWithdrawn;

      const stmt = sqlite.prepare(`
        UPDATE wallets
        SET mainBalance = ?, interestBalance = ?, totalDeposited = ?, totalWithdrawn = ?, updatedAt = ?
        WHERE userId = ?
      `);
      stmt.run(
        mainBalance,
        interestBalance,
        totalDeposited,
        totalWithdrawn,
        now,
        args.where.userId,
      );

      return {
        ...current,
        mainBalance,
        interestBalance,
        totalDeposited,
        totalWithdrawn,
        updatedAt: now,
      };
    },
  },

  plan: {
    async findFirst(args: { where: { name: string } }): Promise<PlanRecord | null> {
      const stmt = sqlite.prepare("SELECT * FROM plans WHERE name = ?");
      const r: any = stmt.get(args.where.name);
      if (!r) return null;
      return {
        id: r.id,
        name: r.name,
        minDeposit: Number(r.minDeposit),
        maxDeposit: Number(r.maxDeposit),
        dailyRoiPercentage: Number(r.dailyRoiPercentage),
        durationDays: Number(r.durationDays),
        capitalRefund: Boolean(r.capitalRefund),
        isActive: Boolean(r.isActive),
      };
    },

    async findMany(): Promise<PlanRecord[]> {
      const stmt = sqlite.prepare("SELECT * FROM plans WHERE isActive = 1");
      const rows = stmt.all() as any[];
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        minDeposit: Number(r.minDeposit),
        maxDeposit: Number(r.maxDeposit),
        dailyRoiPercentage: Number(r.dailyRoiPercentage),
        durationDays: Number(r.durationDays),
        capitalRefund: Boolean(r.capitalRefund),
        isActive: Boolean(r.isActive),
      }));
    },

    async create(args: { data: Omit<PlanRecord, "id"> }): Promise<PlanRecord> {
      const id = generateId();
      const stmt = sqlite.prepare(`
        INSERT INTO plans (id, name, minDeposit, maxDeposit, dailyRoiPercentage, durationDays, capitalRefund, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        args.data.name,
        args.data.minDeposit,
        args.data.maxDeposit,
        args.data.dailyRoiPercentage,
        args.data.durationDays,
        args.data.capitalRefund ? 1 : 0,
        args.data.isActive ? 1 : 0,
      );
      return { id, ...args.data };
    },
  },

  transaction: {
    async findMany(args?: {
      where?: { userId?: string; status?: string };
      orderBy?: { createdAt: "asc" | "desc" };
      take?: number;
    }): Promise<TransactionRecord[]> {
      let query = "SELECT * FROM transactions WHERE 1=1";
      const params: any[] = [];
      if (args?.where?.userId) {
        query += " AND userId = ?";
        params.push(args.where.userId);
      }
      if (args?.where?.status) {
        query += " AND status = ?";
        params.push(args.where.status);
      }
      query += ` ORDER BY createdAt ${args?.orderBy?.createdAt?.toUpperCase() || "DESC"}`;
      if (args?.take) {
        query += ` LIMIT ${args.take}`;
      }
      const stmt = sqlite.prepare(query);
      const rows = stmt.all(...params) as any[];
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        type: r.type,
        amount: Number(r.amount),
        currency: r.currency,
        cryptoAddress: r.cryptoAddress,
        txHash: r.txHash,
        receiptUrl: r.receiptUrl,
        status: r.status,
        approvedAt: r.approvedAt,
        createdAt: r.createdAt,
      }));
    },

    async create(args: {
      data: {
        userId: string;
        type: string;
        amount: number;
        currency: string;
        cryptoAddress?: string | null;
        txHash?: string | null;
        receiptUrl?: string | null;
        status?: string;
      };
    }): Promise<TransactionRecord> {
      const id = generateId();
      const now = new Date().toISOString();
      const status = args.data.status || "PENDING";
      const stmt = sqlite.prepare(`
        INSERT INTO transactions (id, userId, type, amount, currency, cryptoAddress, txHash, receiptUrl, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        args.data.userId,
        args.data.type,
        args.data.amount,
        args.data.currency,
        args.data.cryptoAddress || null,
        args.data.txHash || null,
        args.data.receiptUrl || null,
        status,
        now,
      );
      return {
        id,
        userId: args.data.userId,
        type: args.data.type,
        amount: args.data.amount,
        currency: args.data.currency,
        cryptoAddress: args.data.cryptoAddress || null,
        txHash: args.data.txHash || null,
        receiptUrl: args.data.receiptUrl || null,
        status,
        approvedAt: null,
        createdAt: now,
      };
    },

    async update(args: {
      where: { id: string };
      data: { status?: string; approvedAt?: string | null };
    }): Promise<TransactionRecord | null> {
      const stmtFind = sqlite.prepare("SELECT * FROM transactions WHERE id = ?");
      const current: any = stmtFind.get(args.where.id);
      if (!current) return null;

      const status = args.data.status ?? current.status;
      const approvedAt =
        args.data.approvedAt !== undefined
          ? args.data.approvedAt
          : current.approvedAt;

      const stmt = sqlite.prepare(
        "UPDATE transactions SET status = ?, approvedAt = ? WHERE id = ?",
      );
      stmt.run(status, approvedAt, args.where.id);

      return {
        ...current,
        status,
        approvedAt,
      };
    },
  },

  investment: {
    async findMany(args?: {
      where?: { userId?: string };
    }): Promise<InvestmentRecord[]> {
      let query = "SELECT * FROM investments WHERE 1=1";
      const params: any[] = [];
      if (args?.where?.userId) {
        query += " AND userId = ?";
        params.push(args.where.userId);
      }
      query += " ORDER BY createdAt DESC";
      const stmt = sqlite.prepare(query);
      const rows = stmt.all(...params) as any[];
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        planId: r.planId,
        amount: Number(r.amount),
        accruedProfit: Number(r.accruedProfit),
        daysRemaining: Number(r.daysRemaining),
        status: r.status,
        lastPayoutAt: r.lastPayoutAt,
        createdAt: r.createdAt,
      }));
    },

    async create(args: {
      data: {
        userId: string;
        planId: string;
        amount: number;
        daysRemaining: number;
      };
    }): Promise<InvestmentRecord> {
      const id = generateId();
      const now = new Date().toISOString();
      const stmt = sqlite.prepare(`
        INSERT INTO investments (id, userId, planId, amount, accruedProfit, daysRemaining, status, lastPayoutAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        args.data.userId,
        args.data.planId,
        args.data.amount,
        0.0,
        args.data.daysRemaining,
        "RUNNING",
        now,
        now,
      );
      return {
        id,
        userId: args.data.userId,
        planId: args.data.planId,
        amount: args.data.amount,
        accruedProfit: 0.0,
        daysRemaining: args.data.daysRemaining,
        status: "RUNNING",
        lastPayoutAt: now,
        createdAt: now,
      };
    },
  },

  depositAddress: {
    async findMany(): Promise<DepositAddressRecord[]> {
      const stmt = sqlite.prepare("SELECT * FROM deposit_addresses ORDER BY token ASC, network ASC");
      const rows = stmt.all() as any[];
      return rows.map((r) => ({
        id: r.id,
        token: r.token,
        symbol: r.symbol,
        network: r.network,
        address: r.address,
        memo: r.memo || null,
        updatedAt: r.updatedAt,
      }));
    },

    async findFirst(args: { where: { symbol?: string; network?: string; token?: string } }): Promise<DepositAddressRecord | null> {
      let query = "SELECT * FROM deposit_addresses WHERE 1=1";
      const params: any[] = [];
      if (args.where.symbol) {
        query += " AND LOWER(symbol) = LOWER(?)";
        params.push(args.where.symbol);
      }
      if (args.where.network) {
        query += " AND LOWER(network) = LOWER(?)";
        params.push(args.where.network);
      }
      if (args.where.token) {
        query += " AND LOWER(token) = LOWER(?)";
        params.push(args.where.token);
      }
      query += " LIMIT 1";
      const stmt = sqlite.prepare(query);
      const row = stmt.get(...params) as any;
      if (!row) return null;
      return {
        id: row.id,
        token: row.token,
        symbol: row.symbol,
        network: row.network,
        address: row.address,
        memo: row.memo || null,
        updatedAt: row.updatedAt,
      };
    },

    async update(args: {
      where: { id: string };
      data: { address: string; memo?: string | null };
    }): Promise<DepositAddressRecord> {
      const now = new Date().toISOString();
      const stmt = sqlite.prepare(`
        UPDATE deposit_addresses
        SET address = ?, memo = COALESCE(?, memo), updatedAt = ?
        WHERE id = ?
      `);
      stmt.run(args.data.address, args.data.memo ?? null, now, args.where.id);
      const updated = sqlite.prepare("SELECT * FROM deposit_addresses WHERE id = ?").get(args.where.id) as any;
      return {
        id: updated.id,
        token: updated.token,
        symbol: updated.symbol,
        network: updated.network,
        address: updated.address,
        memo: updated.memo || null,
        updatedAt: updated.updatedAt,
      };
    },
  },
};
