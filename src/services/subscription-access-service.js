import { db } from "@/lib/db";

export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3;

const ACCESSIBLE_SUBSCRIPTION_STATUSES = ["TRIALING", "ACTIVE", "PAST_DUE"];
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isDateExpired(date, now = new Date()) {
  const parsedDate = toDate(date);
  return parsedDate ? parsedDate.getTime() <= now.getTime() : false;
}

function addGracePeriod(date) {
  const parsedDate = toDate(date);

  if (!parsedDate) {
    return null;
  }

  return new Date(
    parsedDate.getTime() + SUBSCRIPTION_GRACE_PERIOD_DAYS * MILLISECONDS_PER_DAY,
  );
}

function selectCurrentSubscription(subscriptions) {
  return (
    subscriptions.find((subscription) =>
      ACCESSIBLE_SUBSCRIPTION_STATUSES.includes(subscription.status),
    ) || subscriptions[0] || null
  );
}

async function transitionSubscriptionStatus({
  subscription,
  status,
  now,
  database = db,
}) {
  if (subscription.status === status) {
    return subscription;
  }

  const claimed = await database.subscription.updateMany({
    where: {
      id: subscription.id,
      status: subscription.status,
    },
    data: {
      status,
      ...(status === "CANCELLED"
        ? { cancelledAt: now, cancelAtPeriodEnd: false }
        : {}),
    },
  });

  if (claimed.count === 1) {
    return {
      ...subscription,
      status,
      ...(status === "CANCELLED"
        ? { cancelledAt: now, cancelAtPeriodEnd: false }
        : {}),
    };
  }

  return database.subscription.findUnique({
    where: { id: subscription.id },
    include: {
      plan: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function getBusinessSubscriptionAccess(
  businessId,
  { now = new Date(), database = db } = {},
) {
  if (!businessId) {
    return { hasAccess: false, reason: "NO_BUSINESS", subscription: null };
  }

  const subscriptions = await database.subscription.findMany({
    where: { businessId },
    include: {
      plan: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  let subscription = selectCurrentSubscription(subscriptions);

  if (!subscription) {
    return { hasAccess: false, reason: "NO_SUBSCRIPTION", subscription: null };
  }

  if (
    subscription.status === "TRIALING" &&
    isDateExpired(subscription.trialEndsAt, now)
  ) {
    subscription = await transitionSubscriptionStatus({
      subscription,
      status: "EXPIRED",
      now,
      database,
    });

    return { hasAccess: false, reason: "TRIAL_EXPIRED", subscription };
  }

  const periodExpired = isDateExpired(subscription.currentPeriodEnd, now);

  if (
    periodExpired &&
    subscription.cancelAtPeriodEnd &&
    ["ACTIVE", "PAST_DUE"].includes(subscription.status)
  ) {
    subscription = await transitionSubscriptionStatus({
      subscription,
      status: "CANCELLED",
      now,
      database,
    });

    return { hasAccess: false, reason: "CANCELLED", subscription };
  }

  if (subscription.status === "ACTIVE" && periodExpired) {
    subscription = await transitionSubscriptionStatus({
      subscription,
      status: "PAST_DUE",
      now,
      database,
    });
  }

  if (subscription.status === "PAST_DUE") {
    const gracePeriodEnd = addGracePeriod(subscription.currentPeriodEnd);

    if (!gracePeriodEnd || isDateExpired(gracePeriodEnd, now)) {
      subscription = await transitionSubscriptionStatus({
        subscription,
        status: "EXPIRED",
        now,
        database,
      });

      return {
        hasAccess: false,
        reason: "SUBSCRIPTION_EXPIRED",
        subscription,
        gracePeriodEnd,
      };
    }

    return {
      hasAccess: true,
      reason: "GRACE_PERIOD",
      subscription,
      gracePeriodEnd,
    };
  }

  if (!["TRIALING", "ACTIVE"].includes(subscription.status)) {
    const reasons = {
      CANCELLED: "CANCELLED",
      EXPIRED: "SUBSCRIPTION_EXPIRED",
    };

    return {
      hasAccess: false,
      reason: reasons[subscription.status] || "INACTIVE",
      subscription,
    };
  }

  return {
    hasAccess: true,
    reason:
      subscription.status === "TRIALING"
        ? "TRIAL_ACTIVE"
        : "SUBSCRIPTION_ACTIVE",
    subscription,
  };
}
