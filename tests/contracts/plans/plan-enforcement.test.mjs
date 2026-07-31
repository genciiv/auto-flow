import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
  return readFile(new URL(`../../../${path}`, import.meta.url), "utf8");
}

test("customer dhe vehicle creation zbatojnë limitet brenda transaction", async () => {
  const [customers, vehicles] = await Promise.all([
    read("src/actions/customer-actions.js"),
    read("src/actions/vehicle-actions.js"),
  ]);

  assert.match(customers, /assertPlanLimit\(businessId, PLAN_RESOURCES\.CUSTOMERS/);
  assert.match(vehicles, /assertPlanLimit\(businessId, PLAN_RESOURCES\.VEHICLES/);
  assert.match(customers, /database: transaction/);
  assert.match(vehicles, /database: transaction/);
});

test("marketplace, inventory dhe analytics zbatojnë feature access në server", async () => {
  const [marketplace, inventory, analytics] = await Promise.all([
    read("src/actions/marketplace-actions.js"),
    read("src/actions/part-actions.js"),
    read("src/app/dashboard/analytics/page.jsx"),
  ]);

  assert.match(marketplace, /assertPlanFeature\(businessId, PLAN_FEATURES\.MARKETPLACE\)/);
  assert.match(inventory, /assertPlanFeature\(businessId, PLAN_FEATURES\.INVENTORY\)/);
  assert.match(analytics, /requireBusinessFeature\(PLAN_FEATURES\.ANALYTICS\)/);
});
