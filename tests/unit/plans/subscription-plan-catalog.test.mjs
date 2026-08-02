import assert from "node:assert/strict";
import test from "node:test";

import {
  LEGACY_PLAN_SLUGS,
  PLAN_FEATURES_BY_TIER,
  SUBSCRIPTION_PLAN_CATALOG,
  TRIAL_CONFIGURATION,
} from "../../../src/config/subscription-plans.js";

function getPlan(slug) {
  return SUBSCRIPTION_PLAN_CATALOG.find((plan) => plan.slug === slug);
}

test("katalogu përmban vetëm planet aktive të reja", () => {
  assert.deepEqual(
    SUBSCRIPTION_PLAN_CATALOG.map((plan) => plan.slug),
    ["free-trial", "professional", "business"],
  );
  assert.deepEqual(LEGACY_PLAN_SLUGS, ["starter"]);
});

test("çmimet ruhen në Lekë dhe Professional bashkon paketat bazë", () => {
  const professional = getPlan("professional");

  assert.equal(professional.monthlyPrice, 3900);
  assert.equal(professional.yearlyPrice, 39000);
  assert.deepEqual(professional.features, PLAN_FEATURES_BY_TIER.professional);
  assert.ok(professional.features.includes("staffRoles"));
  assert.deepEqual(professional.features, [
    "appointments",
    "customers",
    "vehicles",
    "services",
    "invoices",
  ]);
});

test("Premium Business përmban të gjitha funksionet", () => {
  const business = getPlan("business");

  assert.equal(business.name, "Premium Business");
  assert.equal(business.monthlyPrice, 6900);
  assert.equal(business.yearlyPrice, 69000);
  assert.equal(business.maxCustomers, null);
  assert.equal(business.maxVehicles, null);
  assert.deepEqual(business.features, PLAN_FEATURES_BY_TIER.business);
  assert.ok(business.features.includes("inventory"));
  assert.ok(business.features.includes("purchases"));
  assert.ok(business.features.includes("marketplace"));
  assert.ok(business.features.includes("advancedAnalytics"));
  assert.ok(business.features.includes("reports"));
  assert.ok(business.features.includes("auditLogs"));
  assert.ok(business.features.includes("staffRoles"));
  assert.ok(business.features.includes("prioritySupport"));
});

test("Free Trial zgjat 7 ditë dhe përdor funksionet e Professional", () => {
  const trial = getPlan("free-trial");

  assert.equal(TRIAL_CONFIGURATION.durationDays, 7);
  assert.equal(TRIAL_CONFIGURATION.planSlug, "free-trial");
  assert.deepEqual(trial.features, PLAN_FEATURES_BY_TIER.professional);
});
