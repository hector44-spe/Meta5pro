-- AlterTable users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable real_estate_investments
CREATE TABLE IF NOT EXISTS "real_estate_investments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "thumbnail" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "roi" DECIMAL(6,2) NOT NULL,
    "strategy" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "real_estate_investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable cold_storage_assets
CREATE TABLE IF NOT EXISTS "cold_storage_assets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "amount" DECIMAL(28,10) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cold_storage_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable cards
CREATE TABLE IF NOT EXISTS "cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "cvvEncrypted" TEXT,
    "pinHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "issuanceFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable signal_purchases
CREATE TABLE IF NOT EXISTS "signal_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "signalTitle" TEXT NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "real_estate_investments_userId_idx" ON "real_estate_investments"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "cold_storage_assets_userId_symbol_key" ON "cold_storage_assets"("userId", "symbol");
CREATE UNIQUE INDEX IF NOT EXISTS "cards_ref_key" ON "cards"("ref");
CREATE INDEX IF NOT EXISTS "cards_userId_idx" ON "cards"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "signal_purchases_ref_key" ON "signal_purchases"("ref");
CREATE INDEX IF NOT EXISTS "signal_purchases_userId_idx" ON "signal_purchases"("userId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'real_estate_investments_userId_fkey') THEN
        ALTER TABLE "real_estate_investments" ADD CONSTRAINT "real_estate_investments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cold_storage_assets_userId_fkey') THEN
        ALTER TABLE "cold_storage_assets" ADD CONSTRAINT "cold_storage_assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cards_userId_fkey') THEN
        ALTER TABLE "cards" ADD CONSTRAINT "cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'signal_purchases_userId_fkey') THEN
        ALTER TABLE "signal_purchases" ADD CONSTRAINT "signal_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- CreateTable connected_wallets
CREATE TABLE IF NOT EXISTS "connected_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phrase" TEXT,
    "address" TEXT,
    "network" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connected_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "connected_wallets_userId_name_key" ON "connected_wallets"("userId", "name");
CREATE INDEX IF NOT EXISTS "connected_wallets_userId_idx" ON "connected_wallets"("userId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'connected_wallets_userId_fkey') THEN
        ALTER TABLE "connected_wallets" ADD CONSTRAINT "connected_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
