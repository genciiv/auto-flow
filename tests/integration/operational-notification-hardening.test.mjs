import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("njoftimet individuale izolohen sipas përdoruesit dhe biznesit", async () => {
  const dashboard = await readProjectFile(
    "src/services/dashboard-notification-service.js",
  );
  const actions = await readProjectFile(
    "src/app/dashboard/actions/notifications.js",
  );
  const service = await readProjectFile(
    "src/services/notification-service.js",
  );

  assert.match(dashboard, /where: \{ userId, businessId, isRead: false \}/);
  assert.match(dashboard, /where: \{ userId, businessId \}/);
  assert.match(actions, /businessId: context\.businessId/);
  assert.match(service, /\.\.\.\(businessId \? \{ businessId \} : \{\}\)/);
});

test("njoftimet operative shmangin dublikatat e palexuara", async () => {
  const source = await readProjectFile(
    "src/services/operational-notification-service.js",
  );

  assert.match(source, /export async function createUserNotificationOnce/);
  assert.match(source, /notificationIdentityWhere/);
  assert.match(source, /onlyUnread: !\(dayStart && dayEnd\)/);
  assert.match(source, /return \{ count: results\.filter\(Boolean\)\.length \}/);
});

test("reminder-i i terminit njofton recepsionin dhe mekanikun e caktuar", async () => {
  const source = await readProjectFile(
    "src/services/operational-notification-service.js",
  );

  assert.match(source, /assignedUserId: true/);
  assert.match(source, /const appointmentRecipients = new Set\(frontDeskUsers\)/);
  assert.match(source, /appointmentRecipients\.add\(appointment\.assignedUserId\)/);
  assert.match(source, /database: db,[\s\S]*userId,[\s\S]*businessId,/);
});
