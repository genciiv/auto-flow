import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const schema = await readFile(new URL("../../prisma/schema.prisma", import.meta.url), "utf8");
const actions = await readFile(new URL("../../src/actions/chat-actions.js", import.meta.url), "utf8");
const businessPage = await readFile(new URL("../../src/app/dashboard/messages/page.jsx", import.meta.url), "utf8");
const customerPage = await readFile(new URL("../../src/app/customer/messages/page.jsx", import.meta.url), "utf8");

test("chat-i lidhet me biznesin, klientin dhe automjetin e aprovuar", () => {
  assert.match(schema, /model Conversation/);
  assert.match(schema, /customerProfileId String/);
  assert.match(schema, /vehicleId\s+String/);
  assert.match(actions, /requireActiveCustomerVehicleLink/);
});

test("dërgimi i mesazheve izolohet sipas businessId dhe profileId", () => {
  assert.match(actions, /requireBusinessConversation/);
  assert.match(actions, /requireCustomerConversation/);
  assert.match(actions, /senderType: "BUSINESS"/);
  assert.match(actions, /senderType: "CUSTOMER"/);
});

test("portalet ekspozojnë listën dhe hapjen e bisedave", () => {
  assert.match(businessPage, /\/dashboard\/messages/);
  assert.match(customerPage, /\/customer\/messages/);
  assert.match(businessPage, /createBusinessConversationAction/);
  assert.match(customerPage, /createCustomerConversationAction/);
});
