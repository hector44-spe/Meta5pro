CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "verification_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "frontObjectKey" TEXT NOT NULL,
    "frontContentType" TEXT NOT NULL,
    "backObjectKey" TEXT,
    "backContentType" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "verification_submissions_frontObjectKey_key" ON "verification_submissions"("frontObjectKey");
CREATE UNIQUE INDEX "verification_submissions_backObjectKey_key" ON "verification_submissions"("backObjectKey");
CREATE INDEX "verification_submissions_userId_createdAt_idx" ON "verification_submissions"("userId", "createdAt");
CREATE INDEX "verification_submissions_status_createdAt_idx" ON "verification_submissions"("status", "createdAt");

ALTER TABLE "verification_submissions"
ADD CONSTRAINT "verification_submissions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
