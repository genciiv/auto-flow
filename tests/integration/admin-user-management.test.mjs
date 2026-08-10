import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("Platform Admin ka qendër të dedikuar për menaxhimin e përdoruesve", async () => {
  const [page, details, sidebar] = await Promise.all([
    read("src/app/admin/users/page.jsx"),
    read("src/app/admin/users/[userId]/page.jsx"),
    read("src/components/admin/AdminSidebar.jsx"),
  ]);

  assert.match(sidebar, /href: "\/admin\/users"/);
  assert.match(page, /getAdminUsers/);
  assert.match(page, /Platform Admin/);
  assert.match(page, /Përdorues biznesi/);
  assert.match(details, /UserAdminActions/);
  assert.match(details, /Aksesi në biznese/);
});

test("menaxhimi i user-it mbron administratorin aktual dhe administratorin e fundit", async () => {
  const [actions, service] = await Promise.all([
    read("src/app/admin/users/actions.js"),
    read("src/services/admin/user-service.js"),
  ]);

  assert.match(actions, /requirePlatformAdmin/);
  assert.match(actions, /Nuk mund ta çaktivizosh llogarinë tënde/);
  assert.match(actions, /administratori i fundit aktiv/);
  assert.match(actions, /Nuk mund t'i heqësh vetes rolin Platform Admin/);
  assert.match(service, /sessionVersion: \{ increment: 1 \}/);
  assert.match(service, /countOtherActivePlatformAdmins/);
});

test("ndryshimet e user-it auditohen dhe zhbllokimi pastron lockout-in", async () => {
  const [actions, service] = await Promise.all([
    read("src/app/admin/users/actions.js"),
    read("src/services/admin/user-service.js"),
  ]);

  assert.match(actions, /createPlatformAuditLog/);
  assert.match(actions, /entityType: "USER"/);
  assert.match(actions, /unlockAdminUserAction/);
  assert.match(service, /failedLoginAttempts: 0/);
  assert.match(service, /lockedUntil: null/);
});
