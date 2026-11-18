CREATE TABLE "copy_experts" (
  "id" TEXT NOT NULL,
  "ref" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "username" TEXT NOT NULL DEFAULT '',
  "picture" TEXT NOT NULL,
  "bio" TEXT NOT NULL DEFAULT '',
  "winRate" DECIMAL(6,2) NOT NULL DEFAULT 0,
  "profitShare" DECIMAL(6,2) NOT NULL DEFAULT 0,
  "wins" INTEGER NOT NULL DEFAULT 0,
  "losses" INTEGER NOT NULL DEFAULT 0,
  "tradesCount" INTEGER NOT NULL DEFAULT 0,
  "minimumStartUp" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "followers" INTEGER NOT NULL DEFAULT 0,
  "tickType" TEXT NOT NULL DEFAULT 'none',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "copy_experts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "copy_experts_ref_key" ON "copy_experts"("ref");

CREATE TABLE "copy_expert_subscriptions" (
  "expertId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "copy_expert_subscriptions_pkey" PRIMARY KEY ("expertId", "userId")
);

CREATE INDEX "copy_expert_subscriptions_userId_active_idx" ON "copy_expert_subscriptions"("userId", "active");
ALTER TABLE "copy_expert_subscriptions" ADD CONSTRAINT "copy_expert_subscriptions_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "copy_experts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "copy_expert_subscriptions" ADD CONSTRAINT "copy_expert_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "subscription_plan_configs" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "minimum" DECIMAL(18,2) NOT NULL,
  "maximum" DECIMAL(18,2) NOT NULL,
  "duration" INTEGER NOT NULL,
  "roi" DECIMAL(8,2) NOT NULL,
  "placeholder" DECIMAL(18,2) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_plan_configs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "subscription_plan_configs_active_sortOrder_idx" ON "subscription_plan_configs"("active", "sortOrder");

CREATE TABLE "trading_signal_configs" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "price" DECIMAL(18,2) NOT NULL,
  "strength" INTEGER NOT NULL,
  "placeholder" DECIMAL(18,2) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "trading_signal_configs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trading_signal_configs_active_sortOrder_idx" ON "trading_signal_configs"("active", "sortOrder");
