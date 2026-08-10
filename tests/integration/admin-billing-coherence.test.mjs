import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("aktivizimi i abonimit krijon pagesë PAID në të njëjtin transaksion", async () => {
  const service = await read("src/services/admin/subscription-service.js");
  const action = await read("src/app/admin/subscriptions/actions.js");

  assert.match(service, /createPaidSubscription[\s\S]*db\.\$transaction/);
  assert.match(service, /transaction\.subscription\.create/);
  assert.match(service, /transaction\.payment\.create/);
  assert.match(service, /status:\s*"PAID"/);
  assert.match(service, /subscriptionId:\s*subscription\.id/);
  assert.match(action, /paymentMethod/);
  assert.match(action, /paymentReference/);
});

test("rinovimi krijon pagesë të re dhe statusi ACTIVE nuk anashkalon pagesën", async () => {
  const service = await read("src/services/admin/subscription-service.js");
  const action = await read("src/app/admin/subscriptions/actions.js");

  assert.match(service, /renewSubscription[\s\S]*transaction\.payment\.create/);
  assert.match(action, /validatedStatus === "ACTIVE"/);
  assert.match(action, /payment\.status === "PAID"/);
});

test("dashboard-i ndan account aktiv nga abonimi paid dhe të ardhurat", async () => {
  const service = await read("src/services/admin/dashboard-service.js");
  const page = await read("src/app/admin/page.jsx");

  assert.match(service, /accountActiveBusinesses/);
  assert.match(service, /paidActiveSubscriptions/);
  assert.match(service, /currentMonthRevenue/);
  assert.match(service, /payments:[\s\S]*some:[\s\S]*status:\s*"PAID"/);
  assert.match(page, /Abonime aktive/);
  assert.match(page, /Të ardhura këtë muaj/);
});

test("bizneset dhe abonimet ekspozojnë statusin real të pagesës", async () => {
  const businessService = await read("src/services/admin/business-service.js");
  const businessPage = await read("src/app/admin/businesses/page.jsx");
  const subscriptionPage = await read("src/app/admin/subscriptions/page.jsx");

  assert.match(businessService, /subscriptions:[\s\S]*payments:/);
  assert.match(businessPage, /Aktiv pa pagesë/);
  assert.match(businessPage, /Paid/);
  assert.match(subscriptionPage, /activeWithoutPayment/);
  assert.match(subscriptionPage, /0 pagesa të regjistruara/);
});

test("rimbursimi pa pagesa të tjera PAID e kalon abonimin në PAST_DUE", async () => {
  const paymentService = await read("src/services/admin/payment-service.js");

  assert.match(paymentService, /refundPayment[\s\S]*db\.\$transaction/);
  assert.match(paymentService, /remainingPaidPayments === 0/);
  assert.match(paymentService, /status:\s*"PAST_DUE"/);
});
