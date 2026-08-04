/*
  Warnings:

  - You are about to alter the column `vat` on the `Business` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `amount` on the `BusinessExpense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `amount` on the `CustomerPayment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `unitCost` on the `InventoryCountItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `expectedValue` on the `InventoryCountItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `actualValue` on the `InventoryCountItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `differenceValue` on the `InventoryCountItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `total` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `quantity` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,3)`.
  - You are about to alter the column `unitPrice` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `total` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `buyPrice` on the `Part` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `sellPrice` on the `Part` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `total` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `unitPrice` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `total` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `quantity` on the `ServiceLaborItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,3)`.
  - You are about to alter the column `unitPrice` on the `ServiceLaborItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `total` on the `ServiceLaborItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `unitPrice` on the `ServicePartUsage` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `total` on the `ServicePartUsage` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `total` on the `ServiceRecord` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.

*/
-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "vat" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "BusinessExpense" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "CustomerPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "InventoryCountItem" ALTER COLUMN "unitCost" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "expectedValue" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "actualValue" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "differenceValue" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "total" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "Part" ALTER COLUMN "buyPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "sellPrice" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "total" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "PurchaseOrderItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "ServiceLaborItem" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "ServicePartUsage" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "ServiceRecord" ALTER COLUMN "total" SET DATA TYPE DECIMAL(18,2);
