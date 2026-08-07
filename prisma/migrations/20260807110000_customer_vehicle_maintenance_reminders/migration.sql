-- CreateEnum
CREATE TYPE "CustomerVehicleReminderType" AS ENUM ('INSURANCE', 'TECHNICAL_INSPECTION', 'ROAD_TAX', 'CUSTOM');

-- CreateTable
CREATE TABLE "CustomerVehicleMaintenance" (
    "id" TEXT NOT NULL,
    "customerVehicleId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "title" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "mileage" INTEGER,
    "intervalKm" INTEGER,
    "nextMileage" INTEGER,
    "intervalMonths" INTEGER,
    "nextDate" TIMESTAMP(3),
    "source" "VehicleHistorySource" NOT NULL DEFAULT 'CUSTOMER',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerVehicleMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerVehicleReminder" (
    "id" TEXT NOT NULL,
    "customerVehicleId" TEXT NOT NULL,
    "type" "CustomerVehicleReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "dueMileage" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerVehicleReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerVehicleMaintenance_customerVehicleId_performedAt_idx" ON "CustomerVehicleMaintenance"("customerVehicleId", "performedAt");
CREATE INDEX "CustomerVehicleMaintenance_customerVehicleId_type_performedAt_idx" ON "CustomerVehicleMaintenance"("customerVehicleId", "type", "performedAt");
CREATE INDEX "CustomerVehicleMaintenance_nextDate_idx" ON "CustomerVehicleMaintenance"("nextDate");
CREATE INDEX "CustomerVehicleMaintenance_nextMileage_idx" ON "CustomerVehicleMaintenance"("nextMileage");
CREATE INDEX "CustomerVehicleMaintenance_source_idx" ON "CustomerVehicleMaintenance"("source");
CREATE INDEX "CustomerVehicleReminder_customerVehicleId_isActive_idx" ON "CustomerVehicleReminder"("customerVehicleId", "isActive");
CREATE INDEX "CustomerVehicleReminder_customerVehicleId_type_isActive_idx" ON "CustomerVehicleReminder"("customerVehicleId", "type", "isActive");
CREATE INDEX "CustomerVehicleReminder_dueDate_idx" ON "CustomerVehicleReminder"("dueDate");
CREATE INDEX "CustomerVehicleReminder_dueMileage_idx" ON "CustomerVehicleReminder"("dueMileage");

-- AddForeignKey
ALTER TABLE "CustomerVehicleMaintenance" ADD CONSTRAINT "CustomerVehicleMaintenance_customerVehicleId_fkey" FOREIGN KEY ("customerVehicleId") REFERENCES "CustomerVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerVehicleReminder" ADD CONSTRAINT "CustomerVehicleReminder_customerVehicleId_fkey" FOREIGN KEY ("customerVehicleId") REFERENCES "CustomerVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
