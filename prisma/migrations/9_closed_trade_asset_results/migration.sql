ALTER TABLE "positions"
  ADD COLUMN "fundingAsset" TEXT NOT NULL DEFAULT 'USD';

-- Existing positions did not record a separate funding asset. Attribute them
-- to their traded symbol, which is the only truthful asset information stored.
UPDATE "positions" SET "fundingAsset" = "symbol";

CREATE TABLE "closed_trade_results" (
  "id" TEXT NOT NULL,
  "positionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fundingAsset" TEXT NOT NULL,
  "marketSymbol" TEXT NOT NULL,
  "pnl" DECIMAL(18,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "closed_trade_results_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "closed_trade_results_positionId_key" ON "closed_trade_results"("positionId");
CREATE INDEX "closed_trade_results_userId_fundingAsset_createdAt_idx" ON "closed_trade_results"("userId", "fundingAsset", "createdAt");

INSERT INTO "closed_trade_results" ("id", "positionId", "userId", "fundingAsset", "marketSymbol", "pnl", "createdAt")
SELECT "id", "id", "userId", "fundingAsset", "symbol", "pnl", COALESCE("closedAt", "createdAt")
FROM "positions"
WHERE "status" = 'CLOSED';

ALTER TABLE "closed_trade_results"
  ADD CONSTRAINT "closed_trade_results_positionId_fkey"
  FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "closed_trade_results"
  ADD CONSTRAINT "closed_trade_results_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
