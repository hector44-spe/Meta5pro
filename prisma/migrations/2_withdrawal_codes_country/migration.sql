-- AlterTable
ALTER TABLE "users" ADD COLUMN "country" TEXT;

-- CreateTable
CREATE TABLE "withdrawal_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdrawal_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "withdrawal_codes_userId_createdAt_idx" ON "withdrawal_codes"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "withdrawal_codes" ADD CONSTRAINT "withdrawal_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
