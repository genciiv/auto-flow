-- Convert platform billing monetary fields from DoublePrecision to fixed-precision Decimal.

ALTER TABLE "Plan"
  ALTER COLUMN "monthlyPrice" SET DATA TYPE DECIMAL(18,2) USING "monthlyPrice"::DECIMAL(18,2),
  ALTER COLUMN "yearlyPrice" SET DATA TYPE DECIMAL(18,2) USING "yearlyPrice"::DECIMAL(18,2);

ALTER TABLE "Subscription"
  ALTER COLUMN "price" SET DATA TYPE DECIMAL(18,2) USING "price"::DECIMAL(18,2);

ALTER TABLE "SubscriptionPlanRequest"
  ALTER COLUMN "requestedPrice" SET DATA TYPE DECIMAL(18,2) USING "requestedPrice"::DECIMAL(18,2);

ALTER TABLE "Payment"
  ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2) USING "amount"::DECIMAL(18,2);