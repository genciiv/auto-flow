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

test("inventari ekspozon navigimin drejt historikut te levizjeve", async () => {
  const inventoryPage = await readFile("src/app/dashboard/inventory/page.jsx", "utf8");
  const movementsPage = await readFile("src/app/dashboard/inventory/movements/page.jsx", "utf8");

  assert.match(inventoryPage, /href="\/dashboard\/inventory\/movements"/);
  assert.match(inventoryPage, /Lëvizjet e stokut/);
  assert.match(movementsPage, /requireBusinessPermission\(PERMISSIONS\.INVENTORY_VIEW\)/);
});

test("workspace kufizon audit activity me AUDIT_VIEW", async () => {
  const workspace = await readFile("src/app/dashboard/workspace/page.jsx", "utf8");

  assert.match(workspace, /hasPermission\(businessRole, PERMISSIONS\.AUDIT_VIEW\)/);
  assert.match(workspace, /canViewAudit \? db\.auditLog\.findMany/);
  assert.match(workspace, /: Promise\.resolve\(\[\]\)/);
  assert.match(workspace, /\{canViewAudit \? <section/);
  assert.doesNotMatch(workspace, /businessRole !== "MECHANIC"/);
  assert.equal(hasPermission("RECEPTIONIST", PERMISSIONS.AUDIT_VIEW), false);
  assert.equal(hasPermission("MANAGER", PERMISSIONS.AUDIT_VIEW), true);
});

test("shënimi i faturës si e paguar kërkon lejen financiare të dedikuar", async () => {
  const actions = await readFile("src/actions/invoice-actions.js", "utf8");
  const page = await readFile("src/app/dashboard/invoices/page.jsx", "utf8");
  const table = await readFile("src/components/invoices/InvoicesTable.jsx", "utf8");
  const rowActions = await readFile("src/components/invoices/InvoiceRowActions.jsx", "utf8");

  assert.match(actions, /normalizedStatus === "PAID"[\s\S]*PERMISSIONS\.INVOICES_MARK_PAID[\s\S]*PERMISSIONS\.INVOICES_UPDATE/);
  assert.doesNotMatch(actions, /requireAnyBusinessActionPermission/);
  assert.match(page, /hasPermission\([\s\S]*PERMISSIONS\.INVOICES_MARK_PAID[\s\S]*canMarkPaid=\{canMarkInvoicePaid\}/);
  assert.match(table, /canMarkPaid=\{canMarkPaid\}/);
  assert.match(rowActions, /option\.value !== "PAID" \|\| canMarkPaid/);
  assert.equal(hasPermission("RECEPTIONIST", PERMISSIONS.INVOICES_MARK_PAID), false);
  assert.equal(hasPermission("ACCOUNTANT", PERMISSIONS.INVOICES_MARK_PAID), true);
});

test("formularët e faturës nuk anashkalojnë lejen për statusin PAID", async () => {
  const actions = await readFile("src/actions/invoice-actions.js", "utf8");
  const page = await readFile("src/app/dashboard/invoices/page.jsx", "utf8");
  const table = await readFile("src/components/invoices/InvoicesTable.jsx", "utf8");
  const createModal = await readFile("src/components/invoices/CreateInvoiceModal.jsx", "utf8");
  const editModal = await readFile("src/components/invoices/EditInvoiceModal.jsx", "utf8");

  const createAction = actions.slice(actions.indexOf("export async function createInvoice"), actions.indexOf("export async function updateInvoice"));
  const updateAction = actions.slice(actions.indexOf("export async function updateInvoice"), actions.indexOf("export async function updateInvoiceStatus"));

  assert.match(createAction, /status === "PAID"[\s\S]*PERMISSIONS\.INVOICES_MARK_PAID/);
  assert.match(updateAction, /status === "PAID"[\s\S]*PERMISSIONS\.INVOICES_MARK_PAID/);
  assert.match(page, /CreateInvoiceModal[\s\S]*canMarkPaid=\{canMarkInvoicePaid\}/);
  assert.match(table, /EditInvoiceModal[\s\S]*canMarkPaid=\{canMarkPaid\}/);
  assert.match(createModal, /canMarkPaid \? <option value="PAID">/);
  assert.match(editModal, /canMarkPaid \|\| invoice\.status === "PAID"/);
});

test("financieri përdor workspace-in e ri dhe jo dashboard-in ekzekutiv", async () => {
  const dashboard = await readFile("src/app/dashboard/page.jsx", "utf8");
  const workspace = await readFile("src/app/dashboard/workspace/page.jsx", "utf8");

  assert.match(dashboard, /!\["OWNER", "MANAGER"\]\.includes\(businessRole\)[\s\S]*redirect\("\/dashboard\/workspace"\)/);
  assert.doesNotMatch(dashboard, /\["OWNER", "MANAGER", "ACCOUNTANT"\]/);
  assert.match(workspace, /ACCOUNTANT: \["Workspace i financës"/);
  assert.match(workspace, /businessRole === "ACCOUNTANT"/);
});

test("menaxhimi i shpenzimeve kërkon FINANCE_MANAGE në server dhe UI", async () => {
  const actions = await readFile("src/app/dashboard/finance/actions.js", "utf8");
  const page = await readFile("src/app/dashboard/finance/expenses/page.jsx", "utf8");
  const rowActions = await readFile("src/components/finance/ExpenseRowActions.jsx", "utf8");

  const updateAction = actions.slice(actions.indexOf("export async function updateExpenseAction"), actions.indexOf("export async function deleteExpenseAction"));
  const deleteAction = actions.slice(actions.indexOf("export async function deleteExpenseAction"), actions.indexOf("export async function createInventoryCountAction"));

  for (const source of [updateAction, deleteAction]) {
    assert.match(source, /requireBusinessActionPermission\([\s\S]*PERMISSIONS\.FINANCE_MANAGE/);
    assert.match(source, /businessId: context\.businessId/);
    assert.match(source, /entityType: "BusinessExpense"/);
  }

  assert.match(updateAction, /action: "UPDATE"/);
  assert.match(deleteAction, /action: "DELETE"/);
  assert.match(page, /canManageFinance \? <th[\s\S]*Veprime/);
  assert.match(page, /canManageFinance \? <td[\s\S]*ExpenseRowActions/);
  assert.match(rowActions, /useConfirm\(\)/);
  assert.match(rowActions, /deleteExpenseAction\(expense\.id\)/);
  assert.equal(hasPermission("ACCOUNTANT", PERMISSIONS.FINANCE_MANAGE), true);
  assert.equal(hasPermission("RECEPTIONIST", PERMISSIONS.FINANCE_MANAGE), false);
});
