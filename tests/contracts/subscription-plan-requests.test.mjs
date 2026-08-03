import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
const businessAction = fs.readFileSync(
  "src/app/dashboard/settings/subscription/actions.js",
  "utf8",
);
const adminActions = fs.readFileSync(
  "src/app/admin/plan-requests/actions.js",
  "utf8",
);
const adminPage = fs.readFileSync(
  "src/app/admin/plan-requests/page.jsx",
  "utf8",
);

test("plan requests ruhen në databazë dhe kanë workflow të kontrolluar", () => {
  assert.match(schema, /model SubscriptionPlanRequest/);
  assert.match(
    schema,
    /enum SubscriptionPlanRequestStatus[\s\S]*PENDING[\s\S]*APPROVED[\s\S]*REJECTED[\s\S]*PAID/,
  );
  assert.match(businessAction, /subscriptionPlanRequest\.create/);
  assert.match(businessAction, /status: \{ in: \["PENDING", "APPROVED"\] \}/);
  assert.match(adminActions, /approvePlanRequestAction/);
  assert.match(adminActions, /rejectPlanRequestAction/);
  assert.match(adminActions, /markPlanRequestPaidAction/);
  assert.match(adminPage, /Konfirmo pagesën dhe aktivizo/);
});
