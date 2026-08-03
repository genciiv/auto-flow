CREATE TYPE "SubscriptionPlanRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

CREATE TABLE "SubscriptionPlanRequest" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "requestedPlanId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "reviewedById" TEXT,
  "subscriptionId" TEXT,
  "status" "SubscriptionPlanRequestStatus" NOT NULL DEFAULT 'PENDING',
  "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
  "requestedPrice" DOUBLE PRECISION NOT NULL,
  "currentPlanName" TEXT,
  "notes" TEXT,
  "rejectionReason" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SubscriptionPlanRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SubscriptionPlanRequest_businessId_status_idx" ON "SubscriptionPlanRequest"("businessId", "status");
CREATE INDEX "SubscriptionPlanRequest_requestedPlanId_idx" ON "SubscriptionPlanRequest"("requestedPlanId");
CREATE INDEX "SubscriptionPlanRequest_requestedById_idx" ON "SubscriptionPlanRequest"("requestedById");
CREATE INDEX "SubscriptionPlanRequest_reviewedById_idx" ON "SubscriptionPlanRequest"("reviewedById");
CREATE INDEX "SubscriptionPlanRequest_subscriptionId_idx" ON "SubscriptionPlanRequest"("subscriptionId");
CREATE INDEX "SubscriptionPlanRequest_status_createdAt_idx" ON "SubscriptionPlanRequest"("status", "createdAt");

ALTER TABLE "SubscriptionPlanRequest"
  ADD CONSTRAINT "SubscriptionPlanRequest_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubscriptionPlanRequest"
  ADD CONSTRAINT "SubscriptionPlanRequest_requestedPlanId_fkey"
  FOREIGN KEY ("requestedPlanId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SubscriptionPlanRequest"
  ADD CONSTRAINT "SubscriptionPlanRequest_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SubscriptionPlanRequest"
  ADD CONSTRAINT "SubscriptionPlanRequest_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SubscriptionPlanRequest"
  ADD CONSTRAINT "SubscriptionPlanRequest_subscriptionId_fkey"
  FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
