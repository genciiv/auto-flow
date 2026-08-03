ALTER TYPE "ServiceStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "ServiceStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_PARTS';
ALTER TYPE "ServiceStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
ALTER TYPE "ServiceStatus" ADD VALUE IF NOT EXISTS 'DELIVERED';

ALTER TABLE "ServiceRecord"
  ADD COLUMN IF NOT EXISTS "assignedUserId" TEXT,
  ADD COLUMN IF NOT EXISTS "diagnosis" TEXT,
  ADD COLUMN IF NOT EXISTS "internalNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "customerApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "customerApprovedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "readyAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "ServiceStatusHistory" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "changedById" TEXT,
  "fromStatus" "ServiceStatus",
  "toStatus" "ServiceStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ServiceRecord_assignedUserId_idx" ON "ServiceRecord"("assignedUserId");
CREATE INDEX IF NOT EXISTS "ServiceStatusHistory_serviceId_createdAt_idx" ON "ServiceStatusHistory"("serviceId", "createdAt");
CREATE INDEX IF NOT EXISTS "ServiceStatusHistory_changedById_idx" ON "ServiceStatusHistory"("changedById");

DO $$ BEGIN
  ALTER TABLE "ServiceRecord" ADD CONSTRAINT "ServiceRecord_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ServiceStatusHistory" ADD CONSTRAINT "ServiceStatusHistory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ServiceStatusHistory" ADD CONSTRAINT "ServiceStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
