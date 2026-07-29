import { db } from "@/lib/db";

const ALLOWED_SUBSCRIPTION_STATUSES = ["TRIALING", "ACTIVE"];

function isDateExpired(date, now = new Date()) {
  if (!date) {
    return false;
  }

  return new Date(date).getTime() <= now.getTime();
}

export async function getBusinessSubscriptionAccess(businessId) {
  if (!businessId) {
    return {
      hasAccess: false,
      reason: "NO_BUSINESS",
      subscription: null,
    };
  }

  const subscription = await db.subscription.findFirst({
    where: {
      businessId,
    },

    include: {
      plan: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return {
      hasAccess: false,
      reason: "NO_SUBSCRIPTION",
      subscription: null,
    };
  }

  const now = new Date();

  if (
    subscription.status === "TRIALING" &&
    isDateExpired(subscription.trialEndsAt, now)
  ) {
    const expiredSubscription = await db.subscription.update({
      where: {
        id: subscription.id,
      },

      data: {
        status: "EXPIRED",
      },

      include: {
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      hasAccess: false,
      reason: "TRIAL_EXPIRED",
      subscription: expiredSubscription,
    };
  }

  if (
    subscription.status === "ACTIVE" &&
    isDateExpired(subscription.currentPeriodEnd, now)
  ) {
    const expiredSubscription = await db.subscription.update({
      where: {
        id: subscription.id,
      },

      data: {
        status: "EXPIRED",
      },

      include: {
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      hasAccess: false,
      reason: "SUBSCRIPTION_EXPIRED",
      subscription: expiredSubscription,
    };
  }

  if (!ALLOWED_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
    const reasons = {
      PAST_DUE: "PAST_DUE",
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
