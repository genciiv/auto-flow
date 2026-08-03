-- Role workspaces, service labor, inventory traceability and customer payments
CREATE TYPE "ServiceLineType" AS ENUM ('LABOR', 'PART');
CREATE TYPE "InventoryMovementType" AS ENUM ('SERVICE_OUT', 'SERVICE_RETURN', 'PURCHASE_IN', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT');

CREATE TABLE "ServiceLaborItem" (
  "id" TEXT NOT NULL, "serviceId" TEXT NOT NULL, "createdById" TEXT, "description" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1, "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ServiceLaborItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "InventoryMovement" (
  "id" TEXT NOT NULL, "businessId" TEXT NOT NULL, "partId" TEXT NOT NULL, "serviceId" TEXT, "userId" TEXT,
  "type" "InventoryMovementType" NOT NULL, "quantity" INTEGER NOT NULL, "stockBefore" INTEGER NOT NULL,
  "stockAfter" INTEGER NOT NULL, "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "InvoiceItem" (
  "id" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "type" "ServiceLineType" NOT NULL, "description" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1, "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CustomerPayment" (
  "id" TEXT NOT NULL, "businessId" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "recordedById" TEXT,
  "amount" DOUBLE PRECISION NOT NULL, "method" "PaymentMethod" NOT NULL DEFAULT 'CASH', "reference" TEXT,
  "notes" TEXT, "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ServiceLaborItem_serviceId_idx" ON "ServiceLaborItem"("serviceId");
CREATE INDEX "ServiceLaborItem_createdById_idx" ON "ServiceLaborItem"("createdById");
CREATE INDEX "InventoryMovement_businessId_createdAt_idx" ON "InventoryMovement"("businessId", "createdAt");
CREATE INDEX "InventoryMovement_partId_createdAt_idx" ON "InventoryMovement"("partId", "createdAt");
CREATE INDEX "InventoryMovement_serviceId_idx" ON "InventoryMovement"("serviceId");
CREATE INDEX "InventoryMovement_userId_idx" ON "InventoryMovement"("userId");
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");
CREATE INDEX "CustomerPayment_businessId_paidAt_idx" ON "CustomerPayment"("businessId", "paidAt");
CREATE INDEX "CustomerPayment_invoiceId_paidAt_idx" ON "CustomerPayment"("invoiceId", "paidAt");
CREATE INDEX "CustomerPayment_recordedById_idx" ON "CustomerPayment"("recordedById");
ALTER TABLE "ServiceLaborItem" ADD CONSTRAINT "ServiceLaborItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceLaborItem" ADD CONSTRAINT "ServiceLaborItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
