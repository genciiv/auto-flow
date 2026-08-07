import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getCustomerVehicleDueState } from "../../src/lib/customer-vehicle-maintenance.js";

async function source(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("schema dhe migration ruajnë mirëmbajtjen dhe kujtesat e automjetit", async () => {
  const schema = await source("prisma/schema.prisma");
  const migration = await source(
    "prisma/migrations/20260807110000_customer_vehicle_maintenance_reminders/migration.sql",
  );

  assert.match(schema, /model CustomerVehicleMaintenance\s*\{/);
  assert.match(schema, /model CustomerVehicleReminder\s*\{/);
  assert.match(schema, /enum CustomerVehicleReminderType\s*\{/);
  assert.match(schema, /maintenanceHistory\s+CustomerVehicleMaintenance\[\]/);
  assert.match(schema, /reminders\s+CustomerVehicleReminder\[\]/);
  assert.match(migration, /CREATE TABLE "CustomerVehicleMaintenance"/);
  assert.match(migration, /CREATE TABLE "CustomerVehicleReminder"/);
  assert.match(migration, /ON DELETE CASCADE/);
});

test("maintenance actions marrin profileId nga customer context dhe validojnë inputin", async () => {
  const actions = await source("src/app/customer/vehicles/maintenance-actions.js");
  const service = await source("src/services/customer-vehicle-maintenance-service.js");
  const validation = await source("src/schemas/customer-vehicle-maintenance-schema.js");

  assert.match(actions, /requireCustomerActionContext\(\)/);
  assert.match(actions, /validateFormData/);
  assert.match(actions, /createCustomerVehicleMaintenanceSchema/);
  assert.match(actions, /createCustomerVehicleReminderSchema/);
  assert.match(service, /id:\s*vehicleId,\s*profileId/);
  assert.match(service, /customerVehicle:\s*\{\s*profileId/);
  assert.match(validation, /Vendos një datë ose një kilometrazh për kujtesën/);
});

test("service llogarit afatet e mirëmbajtjes dhe ruan vetëm një reminder aktiv standard", async () => {
  const service = await source("src/services/customer-vehicle-maintenance-service.js");

  assert.match(service, /mileage \+ intervalKm/);
  assert.match(service, /addMonthsClamped\(performedAt, intervalMonths\)/);
  assert.match(service, /customerVehicleReminder\.updateMany/);
  assert.match(service, /isActive:\s*false/);
  assert.match(service, /type !== "CUSTOM"/);
});

test("statusi i afatit dallon OK, afër afatit, duhet kryer dhe të kaluar", () => {
  const now = new Date("2026-08-07T10:00:00.000Z");

  assert.equal(
    getCustomerVehicleDueState({
      currentMileage: 140000,
      nextMileage: 150000,
      now,
    }).status,
    "OK",
  );
  assert.equal(
    getCustomerVehicleDueState({
      currentMileage: 149100,
      nextMileage: 150000,
      now,
    }).status,
    "SOON",
  );
  assert.equal(
    getCustomerVehicleDueState({
      currentMileage: 149800,
      nextMileage: 150000,
      now,
    }).status,
    "DUE",
  );
  assert.equal(
    getCustomerVehicleDueState({
      nextDate: new Date("2026-08-01T12:00:00.000Z"),
      now,
    }).status,
    "OVERDUE",
  );
});

test("vehicle detail bashkon maintenance të pronarit, reminder-at dhe të dhënat e verifikuara nga servisi", async () => {
  const page = await source("src/app/customer/vehicles/[id]/page.jsx");
  const overview = await source(
    "src/components/customer/CustomerVehicleMaintenanceOverview.jsx",
  );
  const forms = await source(
    "src/components/customer/CustomerVehicleMaintenanceForms.jsx",
  );

  assert.match(page, /maintenanceHistory:/);
  assert.match(page, /reminders:/);
  assert.match(page, /db\.maintenanceItem\.findMany/);
  assert.match(page, /CustomerVehicleMaintenanceForms/);
  assert.match(page, /CustomerVehicleMaintenanceOverview/);
  assert.match(page, /SERVICE_MAINTENANCE/);
  assert.match(overview, /E verifikuar nga servisi/);
  assert.match(overview, /Siguracioni, kontrolli teknik, taksat/);
  assert.match(forms, /Regjistro mirëmbajtje/);
  assert.match(forms, /Shto kujtesë/);
});

test("customer dashboard shfaq mirëmbajtjen më urgjente pa ekspozuar identifikues pronësie nga browser-i", async () => {
  const dashboard = await source("src/app/customer/dashboard/page.jsx");
  const actions = await source("src/app/customer/vehicles/maintenance-actions.js");

  assert.match(dashboard, /getMostUrgentVehicleDueItem/);
  assert.match(dashboard, /Mirëmbajtja e ardhshme/);
  assert.match(dashboard, /maintenanceHistory:/);
  assert.match(dashboard, /reminders:/);
  assert.doesNotMatch(actions, /formData\.get\(["']profileId["']\)/);
});
