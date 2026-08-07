import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../../${path}`, import.meta.url), "utf8"); }

test("Sprint 8C shton dokumente private të lidhura me automjetin dhe reminder-in", async () => {
  const schema=await source("prisma/schema.prisma");
  const migration=await source("prisma/migrations/20260807133000_customer_vehicle_documents_reminders/migration.sql");
  assert.match(schema,/enum CustomerVehicleDocumentType\s*\{/);
  assert.match(schema,/model CustomerVehicleDocument\s*\{/);
  assert.match(schema,/documents\s+CustomerVehicleDocument\[\]/);
  assert.match(schema,/documentId\s+String\?\s+@unique/);
  assert.match(schema,/notificationSentAt\s+DateTime\?/);
  assert.match(migration,/CREATE TABLE "CustomerVehicleDocument"/);
  assert.match(migration,/CustomerVehicleReminder_documentId_fkey/);
});

test("upload kufizon formatin, madhësinë dhe ruan në storage privat me path jo të parashikueshëm", async () => {
  const service=await source("src/services/customer-vehicle-document-service.js");
  assert.match(service,/10 \* 1024 \* 1024/);
  assert.match(service,/application\/pdf/);
  assert.match(service,/randomUUID\(\)/);
  assert.match(service,/customer-vehicles\/\$\{profileId\}\/\$\{vehicleId\}/);
  assert.match(service,/storage\.from\(bucket\)\.upload/);
  assert.match(service,/getCustomerVehicleDocumentStorage/);
  assert.match(service,/customerVehicle:\s*\{ profileId \}/);
});

test("download verifikon user-in pronar dhe përdor signed URL të shkurtër", async () => {
  const route=await source("src/app/api/customer/vehicles/[vehicleId]/documents/[documentId]/download/route.js");
  assert.match(route,/globalRole!=="CUSTOMER"/);
  assert.match(route,/profile:\{userId:session\.user\.id\}/);
  assert.match(route,/createSignedUrl\(doc\.storagePath,60/);
});

test("cron-i krijon vetëm një bell notification kur dokumenti hyn në dritaren e reminder-it", async () => {
  const service=await source("src/services/customer-vehicle-reminder-notification-service.js");
  const vercel=await source("vercel.json");
  assert.match(service,/notificationSentAt:null/);
  assert.match(service,/daysLeft>reminder\.remindDaysBefore/);
  assert.match(service,/notificationSentAt:now/);
  assert.match(service,/entityType:"DOCUMENT"/);
  assert.match(service,/customer-vehicle:/);
  assert.match(vercel,/api\/cron\/customer-vehicle-reminders/);
});

test("reminder manual standard nuk çaktivizon reminder-at e dokumenteve", async () => {
  const service=await source("src/services/customer-vehicle-maintenance-service.js");
  assert.match(service,/documentId:\s*null/);
});


test("storage refuzon bucket publik për dokumentet e klientit", async () => {
  const storage=await source("src/lib/customer-vehicle-document-storage.js");
  assert.match(storage,/storage\.getBucket\(bucket\)/);
  assert.match(storage,/if \(data\.public\)/);
  assert.match(storage,/duhet të jetë privat/);
});
