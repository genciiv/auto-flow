-- CreateEnum
CREATE TYPE "VehicleHistorySource" AS ENUM ('CUSTOMER', 'SERVICE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CustomerVehicleExpenseType" AS ENUM ('FUEL', 'INSURANCE', 'TAX', 'TIRES', 'PARKING', 'WASH', 'REPAIR', 'PARTS', 'TOLL', 'OTHER');

-- CreateTable
CREATE TABLE "CustomerVehicleMileage" (
    "id" TEXT NOT NULL,
    "customerVehicleId" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "source" "VehicleHistorySource" NOT NULL DEFAULT 'CUSTOMER',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerVehicleMileage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerVehicleExpense" (
    "id" TEXT NOT NULL,
    "customerVehicleId" TEXT NOT NULL,
    "type" "CustomerVehicleExpenseType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ALL',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "mileage" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerVehicleExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerVehicleMileage_customerVehicleId_recordedAt_idx" ON "CustomerVehicleMileage"("customerVehicleId", "recordedAt");
CREATE INDEX "CustomerVehicleMileage_customerVehicleId_mileage_idx" ON "CustomerVehicleMileage"("customerVehicleId", "mileage");
CREATE INDEX "CustomerVehicleMileage_source_idx" ON "CustomerVehicleMileage"("source");
CREATE INDEX "CustomerVehicleExpense_customerVehicleId_occurredAt_idx" ON "CustomerVehicleExpense"("customerVehicleId", "occurredAt");
CREATE INDEX "CustomerVehicleExpense_customerVehicleId_type_idx" ON "CustomerVehicleExpense"("customerVehicleId", "type");

-- AddForeignKey
ALTER TABLE "CustomerVehicleMileage" ADD CONSTRAINT "CustomerVehicleMileage_customerVehicleId_fkey" FOREIGN KEY ("customerVehicleId") REFERENCES "CustomerVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerVehicleExpense" ADD CONSTRAINT "CustomerVehicleExpense_customerVehicleId_fkey" FOREIGN KEY ("customerVehicleId") REFERENCES "CustomerVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
