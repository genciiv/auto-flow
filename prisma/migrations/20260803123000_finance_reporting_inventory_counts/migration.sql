-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');
CREATE TYPE "InventoryCountStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'POSTED', 'CANCELLED');
CREATE TYPE "FinancialPeriodType" AS ENUM ('MONTHLY', 'QUARTERLY', 'SIX_MONTHS', 'YEARLY', 'CUSTOM');
CREATE TYPE "FinancialReportType" AS ENUM ('SUMMARY', 'INCOME_EXPENSES', 'INVENTORY', 'RECEIVABLES', 'FULL');

CREATE TABLE "ExpenseCategory" (
  "id" TEXT NOT NULL, "businessId" TEXT NOT NULL, "name" TEXT NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "BusinessExpense" (
  "id" TEXT NOT NULL, "businessId" TEXT NOT NULL, "categoryId" TEXT, "recordedById" TEXT,
  "status" "ExpenseStatus" NOT NULL DEFAULT 'POSTED', "description" TEXT NOT NULL, "supplier" TEXT, "documentNumber" TEXT,
  "amount" DOUBLE PRECISION NOT NULL, "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH', "expenseDate" TIMESTAMP(3) NOT NULL,
  "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessExpense_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "InventoryCount" (
  "id" TEXT NOT NULL, "businessId" TEXT NOT NULL, "createdById" TEXT, "approvedById" TEXT, "name" TEXT NOT NULL,
  "periodType" "FinancialPeriodType" NOT NULL DEFAULT 'MONTHLY', "status" "InventoryCountStatus" NOT NULL DEFAULT 'DRAFT',
  "countDate" TIMESTAMP(3) NOT NULL, "notes" TEXT, "submittedAt" TIMESTAMP(3), "approvedAt" TIMESTAMP(3), "postedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "InventoryCount_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "InventoryCountItem" (
  "id" TEXT NOT NULL, "inventoryCountId" TEXT NOT NULL, "partId" TEXT NOT NULL, "partName" TEXT NOT NULL, "partCode" TEXT,
  "expectedQuantity" INTEGER NOT NULL, "actualQuantity" INTEGER, "difference" INTEGER, "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "expectedValue" DOUBLE PRECISION NOT NULL DEFAULT 0, "actualValue" DOUBLE PRECISION, "differenceValue" DOUBLE PRECISION, "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "InventoryCountItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FinancialReportExport" (
  "id" TEXT NOT NULL, "businessId" TEXT NOT NULL, "userId" TEXT, "reportType" "FinancialReportType" NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL, "periodEnd" TIMESTAMP(3) NOT NULL, "format" TEXT NOT NULL DEFAULT 'XLSX', "fileName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "FinancialReportExport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExpenseCategory_businessId_name_key" ON "ExpenseCategory"("businessId", "name");
CREATE INDEX "ExpenseCategory_businessId_isActive_idx" ON "ExpenseCategory"("businessId", "isActive");
CREATE INDEX "BusinessExpense_businessId_expenseDate_idx" ON "BusinessExpense"("businessId", "expenseDate");
CREATE INDEX "BusinessExpense_businessId_status_idx" ON "BusinessExpense"("businessId", "status");
CREATE INDEX "BusinessExpense_categoryId_idx" ON "BusinessExpense"("categoryId");
CREATE INDEX "BusinessExpense_recordedById_idx" ON "BusinessExpense"("recordedById");
CREATE INDEX "InventoryCount_businessId_countDate_idx" ON "InventoryCount"("businessId", "countDate");
CREATE INDEX "InventoryCount_businessId_status_idx" ON "InventoryCount"("businessId", "status");
CREATE INDEX "InventoryCount_createdById_idx" ON "InventoryCount"("createdById");
CREATE UNIQUE INDEX "InventoryCountItem_inventoryCountId_partId_key" ON "InventoryCountItem"("inventoryCountId", "partId");
CREATE INDEX "InventoryCountItem_inventoryCountId_idx" ON "InventoryCountItem"("inventoryCountId");
CREATE INDEX "InventoryCountItem_partId_idx" ON "InventoryCountItem"("partId");
CREATE INDEX "FinancialReportExport_businessId_createdAt_idx" ON "FinancialReportExport"("businessId", "createdAt");
CREATE INDEX "FinancialReportExport_businessId_reportType_idx" ON "FinancialReportExport"("businessId", "reportType");
CREATE INDEX "FinancialReportExport_userId_idx" ON "FinancialReportExport"("userId");

ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessExpense" ADD CONSTRAINT "BusinessExpense_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessExpense" ADD CONSTRAINT "BusinessExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryCount" ADD CONSTRAINT "InventoryCount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryCountItem" ADD CONSTRAINT "InventoryCountItem_inventoryCountId_fkey" FOREIGN KEY ("inventoryCountId") REFERENCES "InventoryCount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinancialReportExport" ADD CONSTRAINT "FinancialReportExport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
