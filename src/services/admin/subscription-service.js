import { db } from "@/lib/db";

const PAGE_SIZE = 10;

const VALID_STATUSES = [
  "all",
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
];

function normalizePage(page) {
  const parsedPage = Number.parseInt(page, 10);

  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

function normalizeStatus(status) {
  return VALID_STATUSES.includes(status) ? status : "all";
}

function normalizeBillingInterval(interval) {
  const validIntervals = ["all", "MONTHLY", "YEARLY"];

  return validIntervals.includes(interval) ? interval : "all";
}

export async function getSubscriptions({
  search = "",
  status = "all",
  billingInterval = "all",
  page = 1,
} = {}) {
  const normalizedSearch = search.trim();
  const normalizedStatus = normalizeStatus(status);
  const normalizedBillingInterval = normalizeBillingInterval(billingInterval);
  const currentPage = normalizePage(page);

  const where = {
    ...(normalizedStatus !== "all"
      ? {
          status: normalizedStatus,
        }
      : {}),

    ...(normalizedBillingInterval !== "all"
      ? {
          billingInterval: normalizedBillingInterval,
        }
      : {}),

    ...(normalizedSearch
      ? {
          OR: [
            {
              business: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
            {
              business: {
                email: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
            {
              plan: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
            {
              plan: {
                slug: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [
    subscriptions,
    totalItems,
    trialingCount,
    activeCount,
    expiredCount,
    cancelledCount,
  ] = await Promise.all([
    db.subscription.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            isActive: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            monthlyPrice: true,
            yearlyPrice: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: [
        {
          status: "asc",
        },
        {
          currentPeriodEnd: "asc",
        },
      ],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),

    db.subscription.count({
      where,
    }),

    db.subscription.count({
      where: {
        status: "TRIALING",
      },
    }),

    db.subscription.count({
      where: {
        status: "ACTIVE",
      },
    }),

    db.subscription.count({
      where: {
        status: "EXPIRED",
      },
    }),

    db.subscription.count({
      where: {
        status: "CANCELLED",
      },
    }),
  ]);

  return {
    subscriptions,

    counts: {
      trialing: trialingCount,
      active: activeCount,
      expired: expiredCount,
      cancelled: cancelledCount,
    },

    filters: {
      search: normalizedSearch,
      status: normalizedStatus,
      billingInterval: normalizedBillingInterval,
    },

    pagination: {
      currentPage,
      totalItems,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
    },
  };
}

export async function getSubscriptionById(subscriptionId) {
  if (!subscriptionId) {
    return null;
  }

  return db.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
    include: {
      business: {
        include: {
          users: {
            where: {
              role: "OWNER",
              isActive: true,
            },
            take: 1,
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      plan: true,
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function getSubscriptionFormData() {
  const [businesses, plans] = await Promise.all([
    db.business.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        subscriptions: {
          where: {
            status: {
              in: ["TRIALING", "ACTIVE", "PAST_DUE"],
            },
          },
          select: {
            id: true,
            status: true,
          },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    }),

    db.plan.findMany({
      where: {
        isActive: true,
        slug: {
          not: "free-trial",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        monthlyPrice: true,
        yearlyPrice: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),
  ]);

  return {
    businesses,
    plans,
  };
}

export async function createPaidSubscription({
  businessId,
  planId,
  billingInterval,
  price,
  periodStart,
  periodEnd,
}) {
  return db.$transaction(async (transaction) => {
    await transaction.subscription.updateMany({
      where: {
        businessId,
        status: {
          in: ["TRIALING", "ACTIVE", "PAST_DUE"],
        },
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    return transaction.subscription.create({
      data: {
        businessId,
        planId,
        status: "ACTIVE",
        billingInterval,
        price,
        trialStartsAt: null,
        trialEndsAt: null,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
        cancelAtPeriodEnd: false,
      },
    });
  });
}

export async function updateSubscriptionStatus({ subscriptionId, status }) {
  const subscription = await db.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
  });

  if (!subscription) {
    throw new Error("Abonimi nuk u gjet.");
  }

  const data = {
    status,
  };

  if (status === "CANCELLED") {
    data.cancelledAt = new Date();
    data.cancelAtPeriodEnd = false;
  } else {
    data.cancelledAt = null;
  }

  if (status === "ACTIVE") {
    data.cancelAtPeriodEnd = false;
  }

  return db.subscription.update({
    where: {
      id: subscriptionId,
    },
    data,
  });
}

export async function renewSubscription({
  subscriptionId,
  billingInterval,
  price,
  periodStart,
  periodEnd,
}) {
  const subscription = await db.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
  });

  if (!subscription) {
    throw new Error("Abonimi nuk u gjet.");
  }

  return db.subscription.update({
    where: {
      id: subscriptionId,
    },
    data: {
      status: "ACTIVE",
      billingInterval,
      price,
      trialStartsAt: null,
      trialEndsAt: null,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelledAt: null,
      cancelAtPeriodEnd: false,
    },
  });
}
