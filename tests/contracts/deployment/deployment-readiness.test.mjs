import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateDeploymentEnvironment } from "../../../src/lib/env-validation.mjs";

const valid = {
  DATABASE_URL: "postgresql://u:p@db.autoflow.al:5432/app",
  AUTH_SECRET: "a".repeat(40),
  NEXT_PUBLIC_APP_URL: "https://app.autoflow.al",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-value",
  SUPABASE_STORAGE_BUCKET: "autoflow",
  RESEND_API_KEY: "re_valid",
  EMAIL_FROM: "AutoFlow <noreply@autoflow.al>",
};

test("production env validation pranon konfigurim të sigurt", () => {
  assert.equal(validateDeploymentEnvironment(valid, { target: "production" }).ok, true);
});

test("production env validation bllokon localhost, HTTP dhe secret të shkurtër", () => {
  const result = validateDeploymentEnvironment({ ...valid, AUTH_SECRET: "short", NEXT_PUBLIC_APP_URL: "http://localhost:3000" }, { target: "production" });
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /HTTPS|localhost/);
});

test("deployment files përmbajnë release gate dhe rollback", async () => {
  const [pkg, runbook, rollback] = await Promise.all([readFile("package.json","utf8"), readFile("docs/production-deployment-runbook.md","utf8"), readFile("docs/rollback-runbook.md","utf8")]);
  assert.match(pkg, /deploy:verify/);
  assert.match(runbook, /db:migrate:status/);
  assert.match(rollback, /migrate reset/);
});
