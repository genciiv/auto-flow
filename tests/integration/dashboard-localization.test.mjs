import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("dashboard-i përdor etiketa shqip dhe formatin kohor të Tiranës", async () => {
  const [
    dateTime,
    vehiclesPage,
    servicesPage,
    inventoryPage,
    purchasesPage,
    analyticsPage,
    appointmentCalendar,
    auditLog,
  ] = await Promise.all([
    readProjectFile("src/lib/date-time.js"),
    readProjectFile("src/app/dashboard/vehicles/page.jsx"),
    readProjectFile("src/app/dashboard/services/page.jsx"),
    readProjectFile("src/app/dashboard/inventory/page.jsx"),
    readProjectFile("src/app/dashboard/purchases/page.jsx"),
    readProjectFile("src/app/dashboard/analytics/page.jsx"),
    readProjectFile("src/components/appointments/AppointmentCalendar.jsx"),
    readProjectFile("src/components/audit/AuditLogClient.jsx"),
  ]);

  assert.match(dateTime, /APP_LOCALE = "sq-AL"/);
  assert.match(dateTime, /APP_TIME_ZONE = "Europe\/Tirane"/);
  assert.match(dateTime, /hour12:\s*false/);

  assert.match(vehiclesPage, />Automjetet</);
  assert.match(servicesPage, /Shërbimet/);
  assert.match(inventoryPage, /Inventari/);
  assert.match(purchasesPage, /Porositë/);
  assert.match(analyticsPage, />Analitika</);

  assert.doesNotMatch(vehiclesPage, />Vehicles</);
  assert.doesNotMatch(servicesPage, />\s*Services\s*</);
  assert.doesNotMatch(inventoryPage, />\s*Inventory\s*</);
  assert.doesNotMatch(purchasesPage, />\s*Purchases\s*</);
  assert.doesNotMatch(analyticsPage, />Analytics</);

  assert.match(appointmentCalendar, /formatAppTime/);
  assert.match(appointmentCalendar, /formatAppDate/);
  assert.match(auditLog, /formatAppDateTime/);
});
