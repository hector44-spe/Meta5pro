-- Remove recovery phrases previously collected by the application. Seed phrases must never
-- be accepted or retained by a custodial or portfolio application.
ALTER TABLE "connected_wallets" DROP COLUMN IF EXISTS "phrase";

-- Existing rows contain raw bearer tokens. Invalidate them rather than leaving usable secrets at rest.
UPDATE "password_reset_tokens" SET "used" = TRUE WHERE "used" = FALSE;

-- Cross-instance authentication rate limits.
CREATE TABLE IF NOT EXISTS "auth_rate_limits" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "auth_rate_limits_pkey" PRIMARY KEY ("key")
);
CREATE INDEX IF NOT EXISTS "auth_rate_limits_resetAt_idx" ON "auth_rate_limits"("resetAt");

-- Immutable double-entry journal for wallet balance movements.
CREATE TABLE IF NOT EXISTS "ledger_entries" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "userId" TEXT,
    "account" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "referenceType" TEXT,
    "referenceId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ledger_entries_transferId_idx" ON "ledger_entries"("transferId");
CREATE INDEX IF NOT EXISTS "ledger_entries_userId_createdAt_idx" ON "ledger_entries"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ledger_entries_account_createdAt_idx" ON "ledger_entries"("account", "createdAt");

-- Canonical per-asset balances used by conversions. Client-calculated output amounts are never trusted.
CREATE TABLE IF NOT EXISTS "asset_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "amount" DECIMAL(28,10) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "asset_balances_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "asset_balances_userId_symbol_key" ON "asset_balances"("userId", "symbol");
CREATE INDEX IF NOT EXISTS "asset_balances_userId_idx" ON "asset_balances"("userId");
ALTER TABLE "asset_balances" ADD CONSTRAINT "asset_balances_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
