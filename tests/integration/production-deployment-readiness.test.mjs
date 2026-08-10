import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("production upload body limit përputhet me limitin real 10 MB", async () => {
  const [nextConfig, service, audit] = await Promise.all([
    read("next.config.mjs"),
    read("src/services/customer-vehicle-document-service.js"),
    read("scripts/audit-production-security.mjs"),
  ]);

  assert.match(nextConfig, /bodySizeLimit:\s*"12mb"/);
  assert.match(service, /MAX_FILE_BYTES\s*=\s*10\s*\*\s*1024\s*\*\s*1024/);
  assert.match(audit, /limitMb > 15/);
  assert.match(audit, /limitMb < 10/);
});

test("post-deploy check verifikon security headers dhe health cache", async () => {
  const source = await read("scripts/deploy/post-deploy-check.mjs");

  assert.match(source, /x-powered-by/);
  assert.match(source, /x-content-type-options/);
  assert.match(source, /strict-transport-security/);
  assert.match(source, /cache-control/);
  assert.match(source, /\/api\/health\/ready/);
});

test("production runbook dokumenton env, OAuth, storage, cron dhe go-no-go", async () => {
  const runbook = await read("docs/production-deployment-runbook.md");

  for (const expected of [
    "DIRECT_URL",
    "AUTH_GOOGLE_ID",
    "/api/auth/callback/google",
    "CRON_SECRET",
    "SUPABASE_STORAGE_BUCKET",
    "ENABLE_TEST_EMAIL_API=false",
    "DEPLOYMENT_URL",
    "NO-GO",
  ]) {
    assert.match(runbook, new RegExp(expected.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  }
});
