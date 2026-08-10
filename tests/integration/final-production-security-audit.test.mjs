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
