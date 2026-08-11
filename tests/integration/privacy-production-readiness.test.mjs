import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("eksporti i privatësisë është tenant-scoped, i autorizuar dhe auditohet", async () => {
  const [route, service] = await Promise.all([
    read("src/app/api/dashboard/privacy/export/route.js"),
    read("src/services/business-data-export-service.js"),
  ]);
  assert.match(route, /requireBusinessApiPermission\(PERMISSIONS\.SETTINGS_UPDATE\)/);
  assert.match(route, /createAuditLog/);
  assert.match(route, /cache-control["']:\s*["']no-store, private/);
  assert.match(service, /where:\s*\{\s*businessId\s*\}/);
  assert.doesNotMatch(service, /passwordHash/);
});

test("cron-i i abonimeve kërkon secret dhe përdor lifecycle-in qendror", async () => {
  const route = await read("src/app/api/cron/subscriptions/route.js");
  assert.match(route, /process\.env\.CRON_SECRET/);
  assert.match(route, /timingSafeEqual/);
  assert.match(route, /getBusinessSubscriptionAccess/);
  assert.match(route, /status:\s*\{\s*in:\s*\["TRIALING",\s*"ACTIVE",\s*"PAST_DUE"\]/);
});

test("deployment-i planifikon cron-in dhe dokumenton secret-in", async () => {
  const [vercel, env] = await Promise.all([read("vercel.json"), read(".env.example")]);
  assert.match(vercel, /"path":\s*"\/api\/cron\/subscriptions"/);
  assert.match(vercel, /"schedule":\s*"15 1 \* \* \*"/);
  assert.match(env, /CRON_SECRET/);
});
