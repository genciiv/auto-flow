import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("dashboard-i, financa dhe analitika përdorin pagesat reale dhe periudhën e Tiranës", async () => {
  const [dashboard, finance, analytics, financePeriod, sharedPeriod] = await Promise.all([
    readProjectFile("src/app/dashboard/page.jsx"),
    readProjectFile("src/app/dashboard/finance/page.jsx"),
    readProjectFile("src/app/dashboard/analytics/page.jsx"),
    readProjectFile("src/lib/finance-period.js"),
    readProjectFile("src/lib/financial-period.js"),
  ]);

  assert.match(dashboard, /db\.customerPayment\.findMany/);
  assert.match(dashboard, /getAppMonthRange/);
  assert.match(finance, /db\.customerPayment\.aggregate/);
  assert.match(finance, /lt:\s*period\.endExclusive/);
  assert.match(analytics, /db\.customerPayment\.findMany/);
  assert.doesNotMatch(analytics, /status:\s*"PAID"[\s\S]{0,200}createdAt/);
  assert.match(analytics, /getAppMonthKey\(payment\.paidAt\)/);
  assert.match(financePeriod, /APP_TIME_ZONE/);
  assert.match(financePeriod, /zonedDateTimeToUtc/);
  assert.match(sharedPeriod, /Europe\/Tirane|APP_TIME_ZONE/);
});
