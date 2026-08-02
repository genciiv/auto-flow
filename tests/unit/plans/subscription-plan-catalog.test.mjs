import assert from "node:assert/strict";
import test from "node:test";

import {
  PLAN_FEATURES_BY_TIER,
  SUBSCRIPTION_PLAN_CATALOG,
  TRIAL_CONFIGURATION,
} from "../../../src/config/subscription-plans.js";

function getPlan(slug) {
  return SUBSCRIPTION_PLAN_CATALOG.find((plan) => plan.slug === slug);
}

test("katalogu përmban Starter, Professional, Business dhe Free Trial", () => {
  assert.deepEqual(
    SUBSCRIPTION_PLAN_CATALOG.map((plan) => plan.slug),
    ["free-trial", "starter", "professional", "business"],
  );
});

test("Professional përfshin inventory dhe është plani i rekomanduar", () => {
  const professional = getPlan("professional");

  assert.equal(professional.monthlyPrice, 39);
  assert.equal(professional.maxUsers, 7);
  assert.equal(professional.isRecommended, true);
  assert.ok(professional.features.includes("inventory"));
  assert.ok(professional.features.includes("marketplace"));
});

test("Starter nuk përfshin inventory, ndërsa Business ka limite të pakufizuara", () => {
  const starter = getPlan("starter");
  const business = getPlan("business");

  assert.equal(starter.features.includes("inventory"), false);
  assert.equal(business.maxCustomers, null);
  assert.equal(business.maxVehicles, null);
  assert.ok(business.features.includes("advancedAnalytics"));
});

test("Free Trial zgjat 14 ditë dhe përdor feature-t e Professional", () => {
  const trial = getPlan("free-trial");

  assert.equal(TRIAL_CONFIGURATION.durationDays, 14);
  assert.equal(TRIAL_CONFIGURATION.planSlug, "free-trial");
  assert.deepEqual(trial.features, PLAN_FEATURES_BY_TIER.professional);
  assert.equal(trial.maxUsers, 5);
});
