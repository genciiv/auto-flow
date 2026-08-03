CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

ALTER TABLE "Appointment"
  ADD COLUMN "assignedUserId" TEXT,
  ADD COLUMN "serviceId" TEXT,
  ADD COLUMN "durationMinutes" INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN "customerConfirmedAt" TIMESTAMP(3),
  ADD COLUMN "reminderSentAt" TIMESTAMP(3),
  ADD COLUMN "cancellationReason" TEXT;

ALTER TABLE "Appointment"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "AppointmentStatus"
  USING (
    CASE
      WHEN "status"::text = 'IN_PROGRESS' THEN 'IN_PROGRESS'
      WHEN "status"::text = 'COMPLETED' THEN 'COMPLETED'
      WHEN "status"::text = 'CANCELLED' THEN 'CANCELLED'
      ELSE 'PENDING'
    END
  )::"AppointmentStatus",
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE UNIQUE INDEX "Appointment_serviceId_key" ON "Appointment"("serviceId");
CREATE INDEX "Appointment_assignedUserId_idx" ON "Appointment"("assignedUserId");
CREATE INDEX "Appointment_businessId_assignedUserId_date_idx" ON "Appointment"("businessId", "assignedUserId", "date");

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
