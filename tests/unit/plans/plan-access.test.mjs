import assert from "node:assert/strict";
import test from "node:test";

import {
  assertPlanFeature,
  assertPlanLimit,
  normalizePlanFeatures,
  PLAN_FEATURES,
  PLAN_RESOURCES,
  planIncludesFeature,
} from "../../../src/services/plan-access-service.js";

const access = {
  hasAccess: true,
  plan: {
    id: "plan_1",
    slug: "starter",
    maxUsers: 2,
    maxCustomers: 3,
    maxVehicles: null,
    features: ["Klientë & automjete", "Magazinë e thjeshtë", "Raporte"],
  },
};

test("feature registry mbështet labels ekzistuese dhe keys standarde", () => {
  assert.equal(planIncludesFeature(access.plan.features, PLAN_FEATURES.INVENTORY), true);
  assert.equal(planIncludesFeature(access.plan.features, PLAN_FEATURES.ANALYTICS), true);
  assert.equal(planIncludesFeature(access.plan.features, PLAN_FEATURES.MARKETPLACE), false);
  assert.equal(planIncludesFeature(null, PLAN_FEATURES.MARKETPLACE), true);
  assert.deepEqual(normalizePlanFeatures(null), null);
});

test("assertPlanFeature bllokon feature që nuk përfshihet", async () => {
  await assert.rejects(
    () => assertPlanFeature("business_1", PLAN_FEATURES.MARKETPLACE, { access }),
    (error) => error.code === "PLAN_FEATURE_NOT_INCLUDED" && error.status === 403,
  );
});

test("assertPlanLimit bllokon krijimin kur arrihet limiti", async () => {
  const database = {
    customer: { count: async () => 3 },
  };

  await assert.rejects(
    () =>
      assertPlanLimit("business_1", PLAN_RESOURCES.CUSTOMERS, {
        access,
        database,
      }),
    (error) =>
      error.code === "PLAN_LIMIT_REACHED" &&
      error.metadata.used === 3 &&
      error.metadata.limit === 3,
  );
});

test("limit null trajtohet si unlimited pa query të panevojshëm", async () => {
  const database = {
    vehicle: {
      count: async () => {
        throw new Error("nuk duhet thirrur");
      },
    },
  };

  const result = await assertPlanLimit("business_1", PLAN_RESOURCES.VEHICLES, {
    access,
    database,
  });

  assert.equal(result.limit, null);
  assert.equal(result.remaining, null);
});
