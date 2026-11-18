ALTER TABLE "proof_uploads"
  ALTER COLUMN "data" DROP NOT NULL,
  ADD COLUMN "objectKey" TEXT;

ALTER TABLE "expert_images"
  ALTER COLUMN "data" DROP NOT NULL,
  ADD COLUMN "objectKey" TEXT;

CREATE UNIQUE INDEX "proof_uploads_objectKey_key" ON "proof_uploads"("objectKey");
CREATE UNIQUE INDEX "expert_images_objectKey_key" ON "expert_images"("objectKey");
