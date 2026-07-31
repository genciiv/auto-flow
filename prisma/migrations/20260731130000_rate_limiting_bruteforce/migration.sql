ALTER TABLE "User"
ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastFailedLoginAt" TIMESTAMP(3),
ADD COLUMN "lockedUntil" TIMESTAMP(3);

CREATE INDEX "User_lockedUntil_idx" ON "User"("lockedUntil");

CREATE TABLE "RateLimitBucket" (
  "id" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "blockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RateLimitBucket_keyHash_key" ON "RateLimitBucket"("keyHash");
CREATE INDEX "RateLimitBucket_scope_expiresAt_idx" ON "RateLimitBucket"("scope", "expiresAt");
CREATE INDEX "RateLimitBucket_blockedUntil_idx" ON "RateLimitBucket"("blockedUntil");
