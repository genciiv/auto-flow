import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("final production audit mbulon auth, Platform Admin, cron, env dhe CI", async () => {
  const audit = await read("scripts/audit-production-security.mjs");

  for (const expected of [
    "requirePlatformAdmin",
    "sessionVersion",
    "timingSafeEqual",
    "CRON_SECRET",
    "AUTH_GOOGLE_ID",
    "ENABLE_TEST_EMAIL_API",
    "audit:dependencies",
    "npm run build",
  ]) {
    assert.match(audit, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("production env gate kërkon database direct URL, OAuth dhe secrets të forta", async () => {
  const env = await read("src/lib/env-validation.mjs");

  assert.match(env, /"DIRECT_URL"/);
  assert.match(env, /"AUTH_GOOGLE_ID"/);
  assert.match(env, /"AUTH_GOOGLE_SECRET"/);
  assert.match(env, /"CRON_SECRET"/);
  assert.match(env, /CRON_SECRET duhet të ketë të paktën 32 karaktere/);
});

test("production hardening fsheh framework header dhe fut audit-in në CI gate", async () => {
  const [nextConfig, packageJson] = await Promise.all([
    read("next.config.mjs"),
    read("package.json"),
  ]);

  assert.match(nextConfig, /poweredByHeader:\s*false/);
  assert.match(packageJson, /"audit:production"/);
  assert.match(packageJson, /npm run audit:production/);
});

test("database seed është i mbrojtur nga ekzekutimi aksidental në production", async () => {
  const seed = await read("prisma/seed.js");

  assert.match(seed, /APP_ENV === "production"/);
  assert.match(seed, /NODE_ENV === "production"/);
  assert.match(seed, /ALLOW_DATABASE_SEED/);
  assert.match(seed, /SEED_ADMIN_PASSWORD/);
  assert.match(seed, /SEED_OWNER_PASSWORD/);
  assert.doesNotMatch(seed, /Admin123!/);
  assert.doesNotMatch(seed, /Owner123!/);
});

test("platform billing perdor Decimal(18,2) dhe money helpers ne kufijte e aplikacionit", async () => {
  const [
    schema,
    migration,
    planService,
    subscriptionService,
    paymentService,
    paymentActions,
    subscriptionActions,
  ] = await Promise.all([
    read("prisma/schema.prisma"),
    read("prisma/migrations/20260812102100_platform_billing_decimal/migration.sql"),
    read("src/services/admin/plan-service.js"),
    read("src/services/admin/subscription-service.js"),
    read("src/services/admin/payment-service.js"),
    read("src/app/admin/payments/actions.js"),
    read("src/app/dashboard/settings/subscription/actions.js"),
  ]);

  assert.ok(schema.includes("monthlyPrice Decimal @default(0) @db.Decimal(18, 2)"));
  assert.ok(schema.includes("yearlyPrice  Decimal @default(0) @db.Decimal(18, 2)"));
  assert.ok(schema.includes("price Decimal @default(0) @db.Decimal(18, 2)"));
  const requestedPriceLine = schema.split(/\r?\n/).find((line) => line.includes("requestedPrice"));
  assert.ok(requestedPriceLine?.includes("Decimal") && requestedPriceLine.includes("@db.Decimal(18, 2)"));
  assert.ok(schema.includes("amount   Decimal @db.Decimal(18, 2)"));

  for (const column of ["monthlyPrice", "yearlyPrice", "price", "requestedPrice", "amount"]) {
    assert.ok(migration.includes(`ALTER COLUMN "${column}" SET DATA TYPE DECIMAL(18,2)`));
  }

  assert.ok(planService.includes("monthlyPrice: toMoney(monthlyPrice)"));
  assert.ok(planService.includes("yearlyPrice: toMoney(yearlyPrice)"));
  assert.ok(subscriptionService.includes("const normalizedPrice = toMoney(price)"));
  assert.ok(paymentService.includes("amount: toMoney(amount)"));
  assert.ok(paymentService.includes("price: moneyToNumber(subscription.price)"));
  assert.ok(paymentActions.includes("toMoney(customAmount)"));
  assert.ok(subscriptionActions.includes("requestedPrice: toMoney(requestedPlan.monthlyPrice)"));
});
