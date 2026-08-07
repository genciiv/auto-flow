import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("schema ruan historikun e kilometrave dhe shpenzimet personale me Decimal", async () => {
  const schema = await source("prisma/schema.prisma");
  const migration = await source(
    "prisma/migrations/20260807090000_customer_vehicle_history/migration.sql",
  );

  assert.match(schema, /model CustomerVehicleMileage\s*\{/);
  assert.match(schema, /model CustomerVehicleExpense\s*\{/);
  assert.match(schema, /amount\s+Decimal\s+@db\.Decimal\(18, 2\)/);
  assert.match(schema, /mileageHistory\s+CustomerVehicleMileage\[\]/);
  assert.match(schema, /expenses\s+CustomerVehicleExpense\[\]/);
  assert.match(migration, /DECIMAL\(18,2\)/);
  assert.match(migration, /ON DELETE CASCADE/);
});

test("veprimet e historikut marrin profileId vetëm nga customer context dhe validojnë inputin", async () => {
  const actions = await source("src/app/customer/vehicles/history-actions.js");
  const service = await source("src/services/customer-vehicle-history-service.js");

  assert.match(actions, /requireCustomerActionContext\(\)/);
  assert.match(actions, /validateFormData/);
  assert.match(actions, /addCustomerVehicleMileageSchema/);
  assert.match(actions, /createCustomerVehicleExpenseSchema/);
  assert.match(service, /id:\s*vehicleId,\s*profileId/);
  assert.match(service, /customerVehicle:\s*\{\s*profileId/);
  assert.match(service, /isolationLevel:\s*"Serializable"/);
});

test("përditësimi i kilometrave ruan historikun dhe nuk lejon formularin teknik ta anashkalojë", async () => {
  const historyService = await source(
    "src/services/customer-vehicle-history-service.js",
  );
  const vehicleActions = await source("src/app/customer/vehicles/actions.js");
  const vehicleForm = await source(
    "src/components/customer/CustomerVehicleForm.jsx",
  );

  assert.match(historyService, /customerVehicleMileage\.create/);
  assert.match(historyService, /customerVehicle\.update/);
  assert.match(historyService, /mileage < vehicle\.mileage/);
  assert.match(vehicleActions, /notes:\s*"Kilometrazhi fillestar"/);
  assert.match(vehicleActions, /mileage:\s*currentVehicle\.mileage/);
  assert.match(
    vehicleForm,
    /Kilometrazhi përditësohet nga seksioni i historikut/,
  );
});

test("faqja e automjetit bashkon timeline-in e pronarit me serviset e verifikuara pa kaluar Decimal te Client Component", async () => {
  const page = await source("src/app/customer/vehicles/[id]/page.jsx");

  assert.match(page, /customerVehicleAccessWhere\(profileId, vehicleId\)/);
  assert.match(page, /mileageHistory:/);
  assert.match(page, /expenses:/);
  assert.match(page, /serviceRecord\.findMany/);
  assert.match(page, /E verifikuar nga servisi/);
  assert.match(page, /Shtuar nga pronari/);
  assert.match(page, /const vehicleFormData = \{/);
  assert.match(page, /vehicle=\{vehicleFormData\}/);
  assert.doesNotMatch(page, /vehicle=\{vehicle\}\s+submitLabel/);
});

test("dashboard-i dhe navigimi i klientit e ekspozojnë dosjen dixhitale të automjetit", async () => {
  const dashboard = await source("src/app/customer/dashboard/page.jsx");
  const sidebar = await source("src/components/customer/CustomerSidebar.jsx");

  assert.match(dashboard, /mileageHistory:/);
  assert.match(dashboard, /Shiko historikun/);
  assert.match(dashboard, /Dosja e automjetit/);
  assert.match(sidebar, /Paneli kryesor/);
  assert.match(sidebar, /Automjetet e mia/);
  assert.match(sidebar, /Shërbimet e mia/);
});
