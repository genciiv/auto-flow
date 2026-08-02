export const PLAN_FEATURES_BY_TIER = Object.freeze({
  professional: Object.freeze([
    "appointments",
    "customers",
    "vehicles",
    "services",
    "invoices",
    "staffRoles",
  ]),
  business: Object.freeze([
    "appointments",
    "customers",
    "vehicles",
    "services",
    "invoices",
    "inventory",
    "purchases",
    "marketplace",
    "analytics",
    "advancedAnalytics",
    "reports",
    "exports",
    "auditLogs",
    "staffRoles",
    "prioritySupport",
    "featuredListings",
  ]),
});

export const SUBSCRIPTION_PLAN_CATALOG = Object.freeze([
  Object.freeze({
    name: "Free Trial",
    slug: "free-trial",
    description: "7 ditë provë falas me funksionet e planit Professional.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxUsers: 5,
    maxCustomers: 1000,
    maxVehicles: 2000,
    features: PLAN_FEATURES_BY_TIER.professional,
    isActive: true,
    isRecommended: false,
    sortOrder: 0,
  }),
  Object.freeze({
    name: "Professional",
    slug: "professional",
    description:
      "Për servise që duan të menaxhojnë klientët, automjetet, punët e servisit, takimet dhe faturat.",
    monthlyPrice: 3900,
    yearlyPrice: 39000,
    maxUsers: 7,
    maxCustomers: 1000,
    maxVehicles: 2000,
    features: PLAN_FEATURES_BY_TIER.professional,
    isActive: true,
    isRecommended: true,
    sortOrder: 1,
  }),
  Object.freeze({
    name: "Premium Business",
    slug: "business",
    description:
      "Për servise të mëdha që duan të gjitha modulet, raporte të avancuara dhe mbështetje prioritare.",
    monthlyPrice: 6900,
    yearlyPrice: 69000,
    maxUsers: 20,
    maxCustomers: null,
    maxVehicles: null,
    features: PLAN_FEATURES_BY_TIER.business,
    isActive: true,
    isRecommended: false,
    sortOrder: 2,
  }),
]);

export const LEGACY_PLAN_SLUGS = Object.freeze(["starter"]);

export const TRIAL_CONFIGURATION = Object.freeze({
  enabled: true,
  durationDays: 7,
  planSlug: "free-trial",
});
