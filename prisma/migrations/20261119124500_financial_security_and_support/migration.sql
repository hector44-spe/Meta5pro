-- Capture schema that previously existed only through `db push`, then add the
-- financial-security and support structures. Every statement is safe against
-- the current production database while still creating a complete clean install.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorTempSecret" TEXT;

CREATE TABLE IF NOT EXISTS "staking_pools" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "icon" TEXT,
  "min" DECIMAL(18,4) NOT NULL,
  "max" DECIMAL(18,4) NOT NULL,
  "cycle" TEXT NOT NULL DEFAULT 'Daily',
  "roi" DECIMAL(6,2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "staking_pools_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_stakes" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "poolId" TEXT,
  "poolName" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "amount" DECIMAL(28,10) NOT NULL,
  "usdValue" DECIMAL(18,2) NOT NULL,
  "durationDays" INTEGER NOT NULL,
  "roi" DECIMAL(6,2) NOT NULL,
  "expectedReturnUsd" DECIMAL(18,2) NOT NULL,
  "accruedProfitUsd" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "daysRemaining" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lastPayoutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_stakes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "mining_pools" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "badge" TEXT NOT NULL,
  "icon" TEXT,
  "hardwareImage" TEXT,
  "min" DECIMAL(18,4) NOT NULL,
  "max" DECIMAL(18,4) NOT NULL,
  "roi" DECIMAL(6,2) NOT NULL,
  "cycle" TEXT NOT NULL DEFAULT 'Daily',
  "hashrate" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "mining_pools_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_minings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "poolId" TEXT,
  "poolName" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "amount" DECIMAL(28,10) NOT NULL,
  "usdValue" DECIMAL(18,2) NOT NULL,
  "durationDays" INTEGER NOT NULL,
  "roi" DECIMAL(6,2) NOT NULL,
  "expectedReturnUsd" DECIMAL(18,2) NOT NULL,
  "accruedProfitUsd" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "daysRemaining" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lastPayoutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_minings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "user_stakes" ADD COLUMN IF NOT EXISTS "fundingSource" TEXT NOT NULL DEFAULT 'CASH';
ALTER TABLE "user_stakes" ADD COLUMN IF NOT EXISTS "settledAt" TIMESTAMP(3);
ALTER TABLE "user_minings" ADD COLUMN IF NOT EXISTS "fundingSource" TEXT NOT NULL DEFAULT 'CASH';
ALTER TABLE "user_minings" ADD COLUMN IF NOT EXISTS "settledAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "user_stakes_userId_idx" ON "user_stakes"("userId");
CREATE INDEX IF NOT EXISTS "user_stakes_status_lastPayoutAt_idx" ON "user_stakes"("status", "lastPayoutAt");
CREATE INDEX IF NOT EXISTS "user_minings_userId_idx" ON "user_minings"("userId");
CREATE INDEX IF NOT EXISTS "user_minings_status_lastPayoutAt_idx" ON "user_minings"("status", "lastPayoutAt");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_stakes_userId_fkey') THEN
    ALTER TABLE "user_stakes" ADD CONSTRAINT "user_stakes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_stakes_poolId_fkey') THEN
    ALTER TABLE "user_stakes" ADD CONSTRAINT "user_stakes_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "staking_pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_minings_userId_fkey') THEN
    ALTER TABLE "user_minings" ADD CONSTRAINT "user_minings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_minings_poolId_fkey') THEN
    ALTER TABLE "user_minings" ADD CONSTRAINT "user_minings_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "mining_pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "placeholder" DECIMAL(18,2);
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Copy the legacy presentation catalog into the canonical purchasable plans.
INSERT INTO "plans" ("id", "name", "minDeposit", "maxDeposit", "dailyRoiPercentage", "durationDays", "capitalRefund", "isActive", "title", "placeholder", "sortOrder")
SELECT c."id", c."name", c."minimum", c."maximum",
       CASE WHEN c."duration" > 0 THEN c."roi" / c."duration" ELSE c."roi" END,
       c."duration", true, c."active", c."title", c."placeholder", c."sortOrder"
FROM "subscription_plan_configs" c
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name", "minDeposit" = EXCLUDED."minDeposit",
  "maxDeposit" = EXCLUDED."maxDeposit", "dailyRoiPercentage" = EXCLUDED."dailyRoiPercentage",
  "durationDays" = EXCLUDED."durationDays", "isActive" = EXCLUDED."isActive",
  "title" = EXCLUDED."title", "placeholder" = EXCLUDED."placeholder", "sortOrder" = EXCLUDED."sortOrder";

ALTER TABLE "signal_purchases" ADD COLUMN IF NOT EXISTS "signalId" TEXT;
ALTER TABLE "signal_purchases" ADD COLUMN IF NOT EXISTS "paymentTransactionId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "signal_purchases_paymentTransactionId_key" ON "signal_purchases"("paymentTransactionId");
CREATE INDEX IF NOT EXISTS "signal_purchases_signalId_idx" ON "signal_purchases"("signalId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'signal_purchases_signalId_fkey') THEN
    ALTER TABLE "signal_purchases" ADD CONSTRAINT "signal_purchases_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "trading_signal_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'signal_purchases_paymentTransactionId_fkey') THEN
    ALTER TABLE "signal_purchases" ADD CONSTRAINT "signal_purchases_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "targetUserId" TEXT;

CREATE TABLE IF NOT EXISTS "two_factor_backup_codes" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "two_factor_backup_codes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "two_factor_backup_codes_codeHash_key" ON "two_factor_backup_codes"("codeHash");
CREATE INDEX IF NOT EXISTS "two_factor_backup_codes_userId_usedAt_idx" ON "two_factor_backup_codes"("userId", "usedAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'two_factor_backup_codes_userId_fkey') THEN
    ALTER TABLE "two_factor_backup_codes" ADD CONSTRAINT "two_factor_backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "support_conversations" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_conversations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "support_conversations_userId_key" ON "support_conversations"("userId");
CREATE INDEX IF NOT EXISTS "support_conversations_status_updatedAt_idx" ON "support_conversations"("status", "updatedAt");

CREATE TABLE IF NOT EXISTS "support_messages" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "sender" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "support_messages_conversationId_createdAt_idx" ON "support_messages"("conversationId", "createdAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_conversations_userId_fkey') THEN
    ALTER TABLE "support_conversations" ADD CONSTRAINT "support_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_messages_conversationId_fkey') THEN
    ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "support_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
