-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "depositHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_depositHash_key" ON "transactions"("depositHash");
