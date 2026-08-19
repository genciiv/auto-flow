-- Add invoice subtotal, discount and VAT snapshot fields while preserving existing totals.

ALTER TABLE "Invoice"
  ADD COLUMN "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN "vatEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN "vatAmount" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- Existing invoices keep their current final total and start with no VAT/discount breakdown.
UPDATE "Invoice"
SET "subtotal" = "total";
