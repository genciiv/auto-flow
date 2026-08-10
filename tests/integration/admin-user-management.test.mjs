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

test("User Management v2 shton kontrolle sigurie, profil, email dhe sesione", async () => {
  const [actions, component, schema] = await Promise.all([
    read("src/app/admin/users/actions.js"),
    read("src/components/admin/users/UserAdminActions.jsx"),
    read("src/schemas/admin-user-schema.js"),
  ]);

  assert.match(actions, /updateAdminUserProfileAction/);
  assert.match(actions, /changeAdminUserVerificationAction/);
  assert.match(actions, /revokeAdminUserSessionsAction/);
  assert.match(actions, /sendAdminPasswordResetAction/);
  assert.match(actions, /sendAdminVerificationEmailAction/);
  assert.match(component, /Dil nga të gjitha pajisjet/);
  assert.match(component, /Dërgo reset password/);
  assert.match(schema, /adminUserProfileSchema/);
  assert.match(schema, /adminUserVerificationSchema/);
});

test("rolet e biznesit mbrojnë pronarin e fundit dhe revokojnë sesionet", async () => {
  const [actions, service, component] = await Promise.all([
    read("src/app/admin/users/actions.js"),
    read("src/services/admin/user-service.js"),
    read("src/components/admin/users/UserAdminActions.jsx"),
  ]);

  assert.match(actions, /changeAdminBusinessMembershipRoleAction/);
  assert.match(actions, /removeAdminBusinessMembershipAction/);
  assert.match(actions, /pronari i fundit aktiv/);
  assert.match(actions, /revokeAdminUserSessions/);
  assert.match(service, /countOtherActiveOwners/);
  assert.match(component, /Rolet në biznese/);
});

test("danger zone lejon fshirje vetëm për llogari pa të dhëna të lidhura", async () => {
  const [actions, service, details] = await Promise.all([
    read("src/app/admin/users/actions.js"),
    read("src/services/admin/user-service.js"),
    read("src/app/admin/users/[userId]/page.jsx"),
  ]);

  assert.match(actions, /deleteAdminUserAction/);
  assert.match(actions, /target\.canDelete/);
  assert.match(service, /deleteBlockers/);
  assert.match(service, /subscriptionPlanRequestsCreated/);
  assert.match(details, /recentSecurityEvents/);
  assert.match(details, /Aktiviteti i sigurisë/);
});
