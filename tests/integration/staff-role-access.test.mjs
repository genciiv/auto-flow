import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { hasPermission, PERMISSIONS } from "../../src/lib/permissions.js";

test("matrica e roleve kufizon faturimin, financën, stafin dhe abonimin", () => {
  assert.equal(hasPermission("OWNER", PERMISSIONS.BILLING_MANAGE), true);
  assert.equal(hasPermission("MANAGER", PERMISSIONS.BILLING_MANAGE), false);
  assert.equal(hasPermission("MECHANIC", PERMISSIONS.INVOICES_VIEW), false);
  assert.equal(hasPermission("MECHANIC", PERMISSIONS.FINANCE_VIEW), false);
  assert.equal(hasPermission("ACCOUNTANT", PERMISSIONS.FINANCE_VIEW), true);
  assert.equal(hasPermission("ACCOUNTANT", PERMISSIONS.STAFF_UPDATE), false);
  assert.equal(hasPermission("WAREHOUSE", PERMISSIONS.PURCHASES_RECEIVE), true);
});

test("faqet kritike përdorin permission guards server-side", async () => {
  const checks = [
    ["src/app/dashboard/page.jsx", /requireBusinessPermission\([\s\S]*PERMISSIONS\.DASHBOARD_VIEW/],
    ["src/app/dashboard/analytics/page.jsx", /requireBusinessPermission\(PERMISSIONS\.ANALYTICS_VIEW\)/],
    ["src/app/dashboard/invoices/page.jsx", /requireBusinessPermission\([\s\S]*PERMISSIONS\.INVOICES_VIEW/],
    ["src/app/dashboard/invoices/[id]/page.jsx", /requireBusinessPermission\(PERMISSIONS\.INVOICES_VIEW\)/],
    ["src/app/dashboard/settings/subscription/actions.js", /requireBusinessActionPermission\([\s\S]*PERMISSIONS\.BILLING_MANAGE/],
  ];

  for (const [file, pattern] of checks) {
    const source = await readFile(file, "utf8");
    assert.match(source, pattern, file);
  }
});

test("mekaniku ridrejtohet te workspace dhe shërbimet filtrohen sipas caktimit", async () => {
  const dashboard = await readFile("src/app/dashboard/page.jsx", "utf8");
  const serviceDetails = await readFile("src/app/dashboard/services/[id]/page.jsx", "utf8");
  const operations = await readFile("src/actions/service-operation-actions.js", "utf8");

  assert.match(dashboard, /redirect\("\/dashboard\/workspace"\)/);
  assert.match(serviceDetails, /businessRole === "MECHANIC"[\s\S]*assignedUserId: userId/);
  assert.match(operations, /context\.businessRole === "MECHANIC"[\s\S]*assignedUserId: context\.userId/);
});

test("ndryshimi i rolit te stafit ruan zgjedhjen gjate server action", async () => {
  const component = await readFile("src/components/staff/StaffManager.jsx", "utf8");

  assert.match(component, /useState/);
  assert.match(component, /value=\{selectedRole\}/);
  assert.match(component, /onChange=\{\(event\) => setSelectedRole\(event\.target\.value\)\}/);
  assert.doesNotMatch(component, /defaultValue=\{member\.role\}/);
});
