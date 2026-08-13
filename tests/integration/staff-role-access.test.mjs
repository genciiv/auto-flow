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

test("menaxhimi i vehicle claims kerkon vehicles update ne cdo shtrese", async () => {
  assert.equal(hasPermission("OWNER", PERMISSIONS.VEHICLES_UPDATE), true);
  assert.equal(hasPermission("MANAGER", PERMISSIONS.VEHICLES_UPDATE), true);
  assert.equal(hasPermission("RECEPTIONIST", PERMISSIONS.VEHICLES_UPDATE), true);
  assert.equal(hasPermission("MECHANIC", PERMISSIONS.VEHICLES_UPDATE), false);

  const sidebar = await readFile("src/components/dashboard/Sidebar.jsx", "utf8");
  const page = await readFile("src/app/dashboard/vehicle-claims/page.jsx", "utf8");
  const actions = await readFile("src/app/dashboard/vehicle-claims/actions.js", "utf8");

  assert.match(sidebar, /href: "\/dashboard\/vehicle-claims"[\s\S]*permission: PERMISSIONS\.VEHICLES_UPDATE/);
  assert.match(page, /requireBusinessPermission\(PERMISSIONS\.VEHICLES_UPDATE\)/);
  assert.equal(actions.match(/requireBusinessPermission\(PERMISSIONS\.VEHICLES_UPDATE\)/g)?.length, 2);
  assert.doesNotMatch(actions, /requireBusinessContext/);
});

test("sidebar ndan workspace e mekanikut nga paneli i roleve te tjera", async () => {
  const sidebar = await readFile("src/components/dashboard/Sidebar.jsx", "utf8");

  assert.match(sidebar, /name: "Hapësira ime"[\s\S]*?roles: \["MECHANIC"\]/);
  assert.match(sidebar, /name: "Paneli kryesor"[\s\S]*?roles: \["OWNER", "MANAGER", "RECEPTIONIST", "WAREHOUSE", "ACCOUNTANT"\]/);
});

test("global search respekton permissions dhe kontraten e API", async () => {
  const route = await readFile("src/app/api/search/route.js", "utf8");
  const component = await readFile("src/components/dashboard/SearchCommand.jsx", "utf8");

  for (const permission of ["CUSTOMERS_VIEW", "VEHICLES_VIEW", "INVOICES_VIEW", "SERVICES_VIEW", "INVENTORY_VIEW"]) {
    assert.equal(route.includes(`hasPermission(businessRole, PERMISSIONS.${permission})`), true, permission);
  }

  assert.equal(route.includes('businessRole === "MECHANIC" ? { assignedUserId: session.user.id } : {}'), true);
  assert.equal(route.includes("Promise.resolve([])"), true);
  assert.equal(component.includes("data?.data?.results"), true);
  assert.equal(component.includes("data.results"), false);
});

test("njoftimet filtrojne vehicle claims dhe kategorite sipas rolit", async () => {
  const service = await readFile("src/services/dashboard-notification-service.js", "utf8");
  const layout = await readFile("src/components/dashboard/DashboardLayout.jsx", "utf8");
  const topbar = await readFile("src/components/dashboard/Topbar.jsx", "utf8");
  const dropdown = await readFile("src/components/dashboard/NotificationDropdown.jsx", "utf8");

  assert.equal(service.includes("PERMISSIONS.VEHICLES_UPDATE"), true);
  assert.equal(service.includes("canManageVehicleClaims"), true);
  assert.equal(service.includes("Promise.resolve(0)"), true);
  assert.equal(service.includes("Promise.resolve([])"), true);
  assert.equal(service.includes("PAYMENT: PERMISSIONS.INVOICES_VIEW"), true);
  assert.equal(service.includes("SUBSCRIPTION: PERMISSIONS.BILLING_MANAGE"), true);
  assert.equal(service.includes("allowedBusinessNotifications"), true);
  assert.equal(service.includes("allowedUserNotifications"), true);
  assert.equal(layout.includes("user.businessRole"), true);
  assert.equal(topbar.includes("canManageVehicleClaims={canManageVehicleClaims}"), true);
  assert.equal(dropdown.includes("canManageVehicleClaims ? ("), true);
});

test("faqja e stafit ridrejton rolet pa leje ne vend te ekranit bosh", async () => {
  const page = await readFile("src/app/dashboard/staff/page.jsx", "utf8");

  assert.match(page, /requireBusinessPermission\(PERMISSIONS\.STAFF_VIEW\)/);
  assert.match(page, /requireBusinessPermission[\s\S]*requireBusinessFeature/);
  assert.doesNotMatch(page, /return null/);
});
