import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

async function sourceFirst(paths) {
  let lastError;

  for (const path of paths) {
    try {
      return await source(path);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

test("admin application approval delegon te service transactional", async () => {
  const actionCode = await source("src/app/admin/applications/actions.js");

  const serviceCode = await source("src/services/admin/application-service.js");

  assert.match(actionCode, /approveApplication\(/);

  assert.match(serviceCode, /\$transaction/);

  assert.match(serviceCode, /transaction\.business\.create/);

  assert.match(serviceCode, /transaction\.subscription\.(create|upsert)/);

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

    assert.match(
      code,
      new RegExp(`PERMISSIONS\\.${permission}`),
      `${file} duhet tÃ« pÃ«rdorÃ« lejen ${permission}.`,
    );

    assert.match(
      code,
      /requireBusinessActionPermission/,
      `${file} duhet tÃ« kontrollojÃ« autorizimin e biznesit.`,
    );

    assert.match(code, /businessId/, `${file} duhet tÃ« pÃ«rdorÃ« businessId.`);
  }
});

test("customer creation zbaton permission, validim, plan limit dhe transaction", async () => {
  const code = await source("src/actions/customer-actions.js");

  assert.match(code, /export async function createCustomer/);

  assert.match(code, /PERMISSIONS\.CUSTOMERS_CREATE/);

  assert.match(code, /validateFormData\s*\(\s*createCustomerSchema/);

  assert.match(
    code,
    /assertPlanLimit\s*\(\s*businessId\s*,\s*PLAN_RESOURCES\.CUSTOMERS/,
  );

  assert.match(code, /db\.\$transaction/);

  assert.match(code, /transaction\.customer\.create/);

  assert.match(code, /businessId\s*,/);

  assert.match(code, /logCreate/);
});

test("vehicle creation verifikon customer ownership dhe tenant isolation", async () => {
  const code = await source("src/actions/vehicle-actions.js");

  assert.match(code, /export async function createVehicle/);

  assert.match(code, /PERMISSIONS\.VEHICLES_CREATE/);

  assert.match(code, /validateFormData\s*\(\s*createVehicleSchema/);

  assert.match(code, /validateCustomerOwnership/);

  assert.match(code, /customerId\s*,\s*businessId/);

  assert.match(code, /db\.vehicle\.findFirst/);

  assert.match(code, /businessId\s*,\s*plate/);

  assert.match(
    code,
    /assertPlanLimit\s*\(\s*businessId\s*,\s*PLAN_RESOURCES\.VEHICLES/,
  );

  assert.match(code, /transaction\.vehicle\.create/);
});

test("service creation validon inputin dhe lidhet me business context", async () => {
  const code = await source("src/actions/service-actions.js");

  assert.match(code, /export async function createService/);

  assert.match(code, /PERMISSIONS\.SERVICES_CREATE/);

  assert.match(code, /requireBusinessActionPermission/);

  assert.match(code, /validateFormData\s*\(\s*createServiceSchema/);

  assert.match(code, /businessId/);

  assert.match(code, /\$transaction/);

  assert.match(code, /serviceRecord/);
});

test("invoice nga service krijohet vetÃ«m pÃ«r service tÃ« biznesit aktiv", async () => {
  const code = await source("src/actions/invoice-payment-actions.js");

  assert.match(code, /export async function createInvoiceFromServiceAction/);

  assert.match(code, /PERMISSIONS\.INVOICES_CREATE/);

  assert.match(code, /validateObject\s*\(\s*createInvoiceFromServiceSchema/);

  assert.match(code, /transaction\.serviceRecord\.findFirst/);

  assert.match(code, /businessId:\s*context\.businessId/);

  assert.match(code, /READY_FOR_PICKUP/);

  assert.match(code, /COMPLETED/);

  assert.match(code, /DELIVERED/);

  assert.match(code, /transaction\.invoice\.create/);

  assert.match(code, /service\.laborItems\.map/);

  assert.match(code, /service\.partsUsed\.map/);

  assert.match(code, /serviceId:\s*service\.id/);
});

test("customer payment izolohet sipas tenant dhe pÃ«rditÃ«son invoice status", async () => {
  const code = await source("src/actions/invoice-payment-actions.js");

  assert.match(code, /export async function recordCustomerPaymentAction/);

  assert.match(code, /PERMISSIONS\.INVOICES_MARK_PAID/);

  assert.match(code, /validateFormData\s*\(\s*recordCustomerPaymentSchema/);

  assert.match(code, /transaction\.invoice\.findFirst/);

  assert.match(code, /id:\s*invoiceId/);

  assert.match(code, /businessId:\s*context\.businessId/);

  assert.match(code, /transaction\.customerPayment\.create/);

  assert.match(code, /recordedById:\s*context\.userId/);

  assert.match(code, /isMoneyGreaterThan\(\s*paymentAmount,\s*remaining,\s*\)/);

  assert.match(code, /transaction\.invoice\.update/);

  assert.match(code, /const\s+isPaid\s*=\s*remainingAfter\.eq\(0\)/);

  assert.match(code, /logPayment/);
});

test("core business journey ruan lidhjen customer vehicle service invoice payment", async () => {
  const customerCode = await source("src/actions/customer-actions.js");

  const vehicleCode = await source("src/actions/vehicle-actions.js");

  const serviceCode = await source("src/actions/service-actions.js");

  const invoicePaymentCode = await source(
    "src/actions/invoice-payment-actions.js",
  );

  assert.match(customerCode, /transaction\.customer\.create/);

  assert.match(vehicleCode, /customerId:\s*customerValidation\.customerId/);

  assert.match(serviceCode, /customerId/);

  assert.match(serviceCode, /vehicleId/);

  assert.match(invoicePaymentCode, /customerId:\s*service\.customerId/);

  assert.match(invoicePaymentCode, /vehicleId:\s*service\.vehicleId/);

  assert.match(invoicePaymentCode, /serviceId:\s*service\.id/);

  assert.match(invoicePaymentCode, /invoiceId/);
});

test("proxy ndan admin, owner dhe customer routes", async () => {
  const code = await sourceFirst([
    "src/proxy.js",
    "proxy.js",
    "src/middleware.js",
    "middleware.js",
  ]);

  assert.match(code, /globalRole\s*===\s*["']PLATFORM_ADMIN["']/);

  assert.match(code, /globalRole\s*===\s*["']CUSTOMER["']/);

  assert.match(code, /businessId/);

  assert.match(code, /\/admin/);

  assert.match(code, /\/dashboard/);

  assert.match(code, /\/customer\/dashboard/);
});





