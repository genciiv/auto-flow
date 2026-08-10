import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("Platform Admin ka faqe të dedikuar System Health", () => {
  const page = read("src/app/admin/system-health/page.jsx");
  const sidebar = read("src/components/admin/AdminSidebar.jsx");

  assert.match(page, /System Health/);
  assert.match(page, /getSystemHealth/);
  assert.match(sidebar, /\/admin\/system-health/);
});

test("System Health kontrollon databazën dhe konfigurimet operative pa ekspozuar sekrete", () => {
  const service = read("src/services/admin/system-health-service.js");

  assert.match(service, /checkDatabase/);
  assert.match(service, /AUTH_SECRET/);
  assert.match(service, /BREVO_API_KEY/);
  assert.match(service, /SUPABASE_STORAGE_BUCKET/);
  assert.match(service, /CRON_SECRET/);
  assert.doesNotMatch(service, /value:\s*process\.env/);
});

test("System Health ekspozon endpoint-et ekzistuese të liveness dhe readiness", () => {
  const service = read("src/services/admin/system-health-service.js");

  assert.match(service, /\/api\/health\/live/);
  assert.match(service, /\/api\/health\/ready/);
  assert.match(service, /\/api\/cron\/subscriptions/);
  assert.match(service, /\/api\/cron\/customer-vehicle-reminders/);
});
