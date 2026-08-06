import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const accessPath = new URL(
  "../../src/services/subscription-access-service.js",
  import.meta.url,
);
const planPath = new URL(
  "../../src/services/plan-access-service.js",
  import.meta.url,
);

test("abonimi kalon nga active në grace period dhe pastaj skadon", async () => {
  const source = await readFile(accessPath, "utf8");

  assert.match(source, /SUBSCRIPTION_GRACE_PERIOD_DAYS\s*=\s*3/);
  assert.match(source, /status:\s*"PAST_DUE"/);
  assert.match(source, /reason:\s*"GRACE_PERIOD"/);
  assert.match(source, /status:\s*"EXPIRED"/);
  assert.match(source, /subscription\.updateMany/);
});

test("cancel at period end mbyll aksesin pa anashkaluar periudhën", async () => {
  const source = await readFile(accessPath, "utf8");

  assert.match(source, /subscription\.cancelAtPeriodEnd/);
  assert.match(source, /status:\s*"CANCELLED"/);
  assert.match(source, /cancelledAt:\s*now/);
  assert.match(source, /reason:\s*"CANCELLED"/);
});

test("downgrade ruan të dhënat ekzistuese por shënon tejkalimin dhe bllokon krijimet", async () => {
  const source = await readFile(planPath, "utf8");

  assert.match(source, /overLimit:/);
  assert.match(source, /used\s*\+\s*requested\s*>\s*limit/);
  assert.match(source, /PLAN_LIMIT_REACHED/);
  assert.doesNotMatch(source, /deleteMany/);
});
