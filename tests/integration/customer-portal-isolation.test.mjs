import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("customer access filters lidhin çdo resurs me profileId dhe lidhje aktive", async () => {
  const code = await source("src/lib/customer-access.js");

  assert.match(code, /customerVehicleAccessWhere/);
  assert.match(code, /activeCustomerVehicleLinkWhere/);
  assert.match(code, /customerServiceAccessWhere/);
  assert.match(code, /customerConversationAccessWhere/);
  assert.match(code, /customerProfileId:\s*profileId/);
  assert.match(code, /customerVehicle:\s*\{\s*profileId\s*\}/);
  assert.match(code, /isActive:\s*true/);
});

test("faqet e portalit përdorin filtrat qendrorë server-side", async () => {
  const expectations = [
    ["src/app/customer/services/page.jsx", /customerServiceAccessWhere\(profileId\)/],
    ["src/app/customer/services/[id]/page.jsx", /customerServiceAccessWhere\(profileId, serviceId\)/],
    ["src/app/customer/messages/page.jsx", /customerConversationAccessWhere\(profileId\)/],
    ["src/app/customer/messages/[id]/page.jsx", /customerConversationAccessWhere\(profileId, id\)/],
    ["src/app/customer/vehicles/[id]/page.jsx", /customerVehicleAccessWhere\(profileId, vehicleId\)/],
  ];

  for (const [file, pattern] of expectations) {
    assert.match(await source(file), pattern, file);
  }
});

test("qasja në bisedë kërkon profilin dhe automjetin ende të aprovuar", async () => {
  const code = await source("src/lib/chat-access.js");

  assert.match(code, /customerConversationAccessWhere/);
  assert.match(code, /activeCustomerVehicleLinkWhere/);
  assert.doesNotMatch(code, /where:\s*\{\s*id:\s*conversationId,\s*customerProfileId\s*\}/);
});
