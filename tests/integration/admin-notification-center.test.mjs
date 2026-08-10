import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("Platform Admin ka qendër të plotë njoftimesh me histori dhe filtra", async () => {
  const [page, sidebar, dropdown] = await Promise.all([
    read("src/app/admin/notifications/page.jsx"),
    read("src/components/admin/AdminSidebar.jsx"),
    read("src/components/admin/AdminNotificationDropdown.jsx"),
  ]);

  assert.match(page, /getAdminNotificationCenter/);
  assert.match(page, /Të palexuara/);
  assert.match(page, /Kërko në njoftime/);
  assert.match(sidebar, /href: "\/admin\/notifications"/);
  assert.match(dropdown, /Shiko të gjitha njoftimet/);
});

test("historiku i adminit ruhet pa migration të ri dhe read state mbetet për user", async () => {
  const service = await read("src/services/admin/admin-notification-service.js");

  assert.match(service, /ADMIN_HISTORY_PREFIX/);
  assert.match(service, /syncAdminNotificationHistory/);
  assert.match(service, /createMany/);
  assert.match(service, /markAdminNotificationRead/);
  assert.match(service, /markAllAdminNotificationsRead/);
  assert.match(service, /userId/);
});

test("Qendra e njoftimeve mbështet mark all read dhe navigim drejt entitetit", async () => {
  const [actions, client] = await Promise.all([
    read("src/app/admin/actions/notifications.js"),
    read("src/components/admin/notifications/AdminNotificationCenterActions.jsx"),
  ]);

  assert.match(actions, /markAllAdminNotificationsReadAction/);
  assert.match(actions, /requirePlatformAdmin/);
  assert.match(client, /Shëno të gjitha të lexuara/);
  assert.match(client, /router\.push\(notification\.href\)/);
});
