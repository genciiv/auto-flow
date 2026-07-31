import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("admin application approval delegon te service transactional", async () => {
  const actionCode = await source("src/app/admin/applications/actions.js");
  const serviceCode = await source("src/services/admin/application-service.js");

  assert.match(actionCode, /approveApplication\(/);
  assert.match(serviceCode, /\$transaction/);
  assert.match(serviceCode, /transaction\.business\.create/);
  assert.match(serviceCode, /transaction\.subscription\.create|transaction\.subscription\.upsert/);
  assert.match(serviceCode, /transaction\.businessUser\.create/);
});

test("owner journey mbron customer, vehicle, service dhe invoice mutations", async () => {
  const files = [
    ["src/actions/customer-actions.js", "CUSTOMERS_CREATE"],
    ["src/actions/vehicle-actions.js", "VEHICLES_CREATE"],
    ["src/actions/service-actions.js", "SERVICES_CREATE"],
    ["src/actions/invoice-actions.js", "INVOICES_CREATE"],
  ];

  for (const [file, permission] of files) {
    const code = await source(file);
    assert.match(code, new RegExp(permission), file);
    assert.match(code, /requireBusinessActionPermission/, file);
  }
});

test("marketplace journey kërkon feature access dhe izolon listing-un", async () => {
  const code = await source("src/actions/marketplace-actions.js");
  assert.match(code, /PLAN_FEATURES\.MARKETPLACE|["']marketplace["']/);
  assert.match(code, /assertPlanFeature/);
  assert.match(code, /businessId/);
});

test("proxy ndan admin, owner dhe customer routes", async () => {
  const code = await source("src/proxy.js");
  assert.match(code, /globalRole === "PLATFORM_ADMIN"/);
  assert.match(code, /globalRole === "CUSTOMER"/);
  assert.match(code, /businessId/);
  assert.match(code, /\/admin/);
  assert.match(code, /\/dashboard/);
  assert.match(code, /\/customer\/dashboard/);
});
