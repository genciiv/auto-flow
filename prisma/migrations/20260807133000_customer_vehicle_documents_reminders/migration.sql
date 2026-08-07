-- Sprint 8C: private customer vehicle documents + automated expiry reminders.
CREATE TYPE "CustomerVehicleDocumentType" AS ENUM (
  'INSURANCE',
  'TECHNICAL_INSPECTION',
  'ROAD_TAX',
  'REGISTRATION_CERTIFICATE',
  'OWNERSHIP',
  'OTHER'
);

CREATE TABLE "CustomerVehicleDocument" (
  "id" TEXT NOT NULL,
  "customerVehicleId" TEXT NOT NULL,
  "type" "CustomerVehicleDocumentType" NOT NULL,
  "title" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "issuedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerVehicleDocument_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CustomerVehicleReminder"
  ADD COLUMN "documentId" TEXT,
  ADD COLUMN "remindDaysBefore" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "notificationSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "CustomerVehicleDocument_storagePath_key" ON "CustomerVehicleDocument"("storagePath");
CREATE INDEX "CustomerVehicleDocument_customerVehicleId_createdAt_idx" ON "CustomerVehicleDocument"("customerVehicleId", "createdAt");
CREATE INDEX "CustomerVehicleDocument_customerVehicleId_type_idx" ON "CustomerVehicleDocument"("customerVehicleId", "type");
CREATE INDEX "CustomerVehicleDocument_expiresAt_idx" ON "CustomerVehicleDocument"("expiresAt");
CREATE UNIQUE INDEX "CustomerVehicleReminder_documentId_key" ON "CustomerVehicleReminder"("documentId");
DROP INDEX IF EXISTS "CustomerVehicleReminder_dueDate_idx";
CREATE INDEX "CustomerVehicleReminder_dueDate_isActive_notificationSentAt_idx" ON "CustomerVehicleReminder"("dueDate", "isActive", "notificationSentAt");

ALTER TABLE "CustomerVehicleDocument"
  ADD CONSTRAINT "CustomerVehicleDocument_customerVehicleId_fkey"
  FOREIGN KEY ("customerVehicleId") REFERENCES "CustomerVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerVehicleReminder"
  ADD CONSTRAINT "CustomerVehicleReminder_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "CustomerVehicleDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
