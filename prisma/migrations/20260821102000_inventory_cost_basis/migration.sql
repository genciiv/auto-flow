-- Add historical cost snapshots for parts used in services.

ALTER TABLE "ServicePartUsage"
  ADD COLUMN "costUnitPrice" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN "costTotal" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- Existing usages did not store historical cost.
-- Use the part's current buy price as the best available approximation.
UPDATE "ServicePartUsage" AS spu
SET
  "costUnitPrice" = COALESCE(p."buyPrice", 0),
  "costTotal" = ROUND(COALESCE(p."buyPrice", 0) * spu."quantity", 2)
FROM "Part" AS p
WHERE p."id" = spu."partId";