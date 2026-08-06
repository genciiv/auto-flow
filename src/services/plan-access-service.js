import { db } from "@/lib/db";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { getBusinessSubscriptionAccess } from "@/services/subscription-access-service";

export const PLAN_FEATURES = Object.freeze({
  INVENTORY: "inventory",
  ANALYTICS: "analytics",
  STAFF: "staff",
});

export const PLAN_RESOURCES = Object.freeze({
  USERS: "users",
  CUSTOMERS: "customers",
  VEHICLES: "vehicles",
});

const FEATURE_ALIASES = Object.freeze({
  inventory: ["inventory", "inventar", "magazine", "magazina", "stock"],
  analytics: ["analytics", "analitika", "raporte", "reports"],
  staff: ["staff", "punonjes", "punonjës", "users", "perdorues", "përdorues"],
});

const RESOURCE_CONFIG = Object.freeze({
  users: {
    limitField: "maxUsers",
    label: "përdoruesve",
    count: (database, businessId) =>
      database.businessUser.count({ where: { businessId, isActive: true } }),
  },
  customers: {
    limitField: "maxCustomers",
    label: "klientëve",
    count: (database, businessId) =>
      database.customer.count({ where: { businessId } }),
  },
  vehicles: {
    limitField: "maxVehicles",
    label: "automjeteve",
    count: (database, businessId) =>
      database.vehicle.count({ where: { businessId } }),
  },
});

function normalizeFeatureValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function normalizePlanFeatures(features) {
  if (features == null) {
    return null;
  }

  if (!Array.isArray(features)) {
    return [];
  }

  return features
    .filter((feature) => typeof feature === "string")
    .map(normalizeFeatureValue)
    .filter(Boolean);
}

export function planIncludesFeature(features, feature) {
  const normalizedFeatures = normalizePlanFeatures(features);

  // Compatibility: planet e vjetra pa `features` nuk bllokohen papritur.
  if (normalizedFeatures === null) {
    return true;
  }

  const normalizedFeature = normalizeFeatureValue(feature);
  const aliases = FEATURE_ALIASES[normalizedFeature] || [normalizedFeature];

  return normalizedFeatures.some((configuredFeature) =>
    aliases.some(
      (alias) =>
        configuredFeature === alias || configuredFeature.includes(alias),
    ),
  );
}

export async function getBusinessPlanAccess(businessId) {
  const subscriptionAccess = await getBusinessSubscriptionAccess(businessId);

  if (!subscriptionAccess.hasAccess || !subscriptionAccess.subscription?.id) {
    return {
      ...subscriptionAccess,
      plan: null,
    };
  }

  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionAccess.subscription.id },
    include: { plan: true },
  });

  return {
    ...subscriptionAccess,
    subscription,
    plan: subscription?.plan || null,
  };
}

function createPlanError({ code, message, metadata }) {
  return new AppError({
    code,
    message,
    status: 403,
    metadata,
  });
}

export async function assertPlanFeature(
  businessId,
  feature,
  { access = null } = {},
) {
  const planAccess = access || (await getBusinessPlanAccess(businessId));

  if (!planAccess.hasAccess || !planAccess.plan) {
    throw createPlanError({
      code: ERROR_CODES.SUBSCRIPTION_INACTIVE,
      message: "Abonimi aktiv kërkohet për këtë veçori.",
      metadata: { businessId, feature },
    });
  }

  if (!planIncludesFeature(planAccess.plan.features, feature)) {
    throw createPlanError({
      code: ERROR_CODES.PLAN_FEATURE_NOT_INCLUDED,
      message: "Kjo veçori nuk përfshihet në planin aktual. Përmirëso planin për të vazhduar.",
      metadata: {
        businessId,
        feature,
        planId: planAccess.plan.id,
        planSlug: planAccess.plan.slug,
      },
    });
  }

  return planAccess;
}

export async function getPlanUsage(businessId, { database = db } = {}) {
  const access = await getBusinessPlanAccess(businessId);

  if (!access.plan) {
    return { access, usage: null };
  }

  const [users, customers, vehicles] = await Promise.all([
    RESOURCE_CONFIG.users.count(database, businessId),
    RESOURCE_CONFIG.customers.count(database, businessId),
    RESOURCE_CONFIG.vehicles.count(database, businessId),
  ]);

  return {
    access,
    usage: {
      users: {
        used: users,
        limit: access.plan.maxUsers,
        overLimit:
          access.plan.maxUsers != null && users > Number(access.plan.maxUsers),
      },
      customers: {
        used: customers,
        limit: access.plan.maxCustomers,
        overLimit:
          access.plan.maxCustomers != null &&
          customers > Number(access.plan.maxCustomers),
      },
      vehicles: {
        used: vehicles,
        limit: access.plan.maxVehicles,
        overLimit:
          access.plan.maxVehicles != null &&
          vehicles > Number(access.plan.maxVehicles),
      },
    },
  };
}

export async function assertPlanLimit(
  businessId,
  resource,
  { increment = 1, database = db, access = null } = {},
) {
  const config = RESOURCE_CONFIG[resource];

  if (!config) {
    throw new TypeError(`Plan resource i panjohur: ${resource}`);
  }

  const planAccess = access || (await getBusinessPlanAccess(businessId));

  if (!planAccess.hasAccess || !planAccess.plan) {
    throw createPlanError({
      code: ERROR_CODES.SUBSCRIPTION_INACTIVE,
      message: "Abonimi aktiv kërkohet për këtë veprim.",
      metadata: { businessId, resource },
    });
  }

  const rawLimit = planAccess.plan[config.limitField];

  // null = unlimited. Zero është limit real.
  if (rawLimit == null) {
    return { access: planAccess, used: null, limit: null, remaining: null };
  }

  const limit = Number(rawLimit);
  const used = await config.count(database, businessId);
  const requested = Math.max(1, Number(increment) || 1);

  if (used + requested > limit) {
    throw createPlanError({
      code: ERROR_CODES.PLAN_LIMIT_REACHED,
      message: `Ke arritur limitin e ${config.label} për planin aktual. Përmirëso planin për të vazhduar.`,
      metadata: {
        businessId,
        resource,
        used,
        requested,
        limit,
        planId: planAccess.plan.id,
        planSlug: planAccess.plan.slug,
      },
    });
  }

  return {
    access: planAccess,
    used,
    limit,
    remaining: Math.max(0, limit - used - requested),
  };
}
