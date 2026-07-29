import { db } from "@/lib/db";

function normalizeDate(value, fallback) {
  if (!value) {
    return fallback;
  }

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? fallback : date;
}

function getDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
}

function getDateRange({ startDate, endDate } = {}) {
  const defaults = getDefaultDateRange();

  const normalizedStartDate = normalizeDate(startDate, defaults.startDate);

  const normalizedEndDate = normalizeDate(endDate, defaults.endDate);

  normalizedStartDate.setHours(0, 0, 0, 0);
  normalizedEndDate.setHours(23, 59, 59, 999);

  if (normalizedStartDate > normalizedEndDate) {
    return defaults;
  }

  return {
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
  };
}

function toDateInputValue(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getDateKey(date) {
  return toDateInputValue(new Date(date));
}

function createDailyRevenueSeries({ startDate, endDate, payments }) {
  const totalsByDate = new Map();

  for (const payment of payments) {
    const key = getDateKey(payment.paidAt || payment.createdAt);

    totalsByDate.set(
      key,
      (totalsByDate.get(key) || 0) + Number(payment.amount || 0),
    );
  }

  const series = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const key = toDateInputValue(currentDate);

    series.push({
      date: key,
      revenue: totalsByDate.get(key) || 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return series;
}

export async function getReports({ startDate, endDate } = {}) {
  const range = getDateRange({
    startDate,
    endDate,
  });

  const paymentDateFilter = {
    status: "PAID",
    paidAt: {
      gte: range.startDate,
      lte: range.endDate,
    },
  };

  const [
    paidPayments,
    totalRevenueResult,
    paidPaymentsCount,
    pendingPaymentsCount,
    activeSubscriptionsCount,
    trialSubscriptionsCount,
    expiredSubscriptionsCount,
    activeBusinessesCount,
    newBusinessesCount,
    revenueByMethod,
    subscriptionsByPlan,
    recentPaidPayments,
  ] = await Promise.all([
    db.payment.findMany({
      where: paymentDateFilter,
      select: {
        id: true,
        amount: true,
        paidAt: true,
        createdAt: true,
      },
      orderBy: {
        paidAt: "asc",
      },
    }),

    db.payment.aggregate({
      where: paymentDateFilter,
      _sum: {
        amount: true,
      },
    }),

    db.payment.count({
      where: paymentDateFilter,
    }),

    db.payment.count({
      where: {
        status: "PENDING",
        createdAt: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
    }),

    db.subscription.count({
      where: {
        status: "ACTIVE",
      },
    }),

    db.subscription.count({
      where: {
        status: "TRIALING",
      },
    }),

    db.subscription.count({
      where: {
        status: "EXPIRED",
      },
    }),

    db.business.count({
      where: {
        isActive: true,
      },
    }),

    db.business.count({
      where: {
        createdAt: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
    }),

    db.payment.groupBy({
      by: ["method"],
      where: paymentDateFilter,
      _count: {
        _all: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    }),

    db.subscription.groupBy({
      by: ["planId"],
      where: {
        status: {
          in: ["TRIALING", "ACTIVE", "PAST_DUE"],
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          planId: "desc",
        },
      },
    }),

    db.payment.findMany({
      where: paymentDateFilter,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
        subscription: {
          select: {
            id: true,
            plan: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
      take: 10,
    }),
  ]);

  const planIds = subscriptionsByPlan.map((item) => item.planId);

  const plans = planIds.length
    ? await db.plan.findMany({
        where: {
          id: {
            in: planIds,
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      })
    : [];

  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  const revenueSeries = createDailyRevenueSeries({
    startDate: range.startDate,
    endDate: range.endDate,
    payments: paidPayments,
  });

  return {
    filters: {
      startDate: toDateInputValue(range.startDate),
      endDate: toDateInputValue(range.endDate),
    },

    summary: {
      revenue: Number(totalRevenueResult._sum.amount || 0),
      paidPayments: paidPaymentsCount,
      pendingPayments: pendingPaymentsCount,
      activeSubscriptions: activeSubscriptionsCount,
      trialSubscriptions: trialSubscriptionsCount,
      expiredSubscriptions: expiredSubscriptionsCount,
      activeBusinesses: activeBusinessesCount,
      newBusinesses: newBusinessesCount,
    },

    revenueSeries,

    revenueByMethod: revenueByMethod.map((item) => ({
      method: item.method,
      count: item._count._all,
      revenue: Number(item._sum.amount || 0),
    })),

    subscriptionsByPlan: subscriptionsByPlan.map((item) => {
      const plan = planMap.get(item.planId);

      return {
        planId: item.planId,
        planName: plan?.name || "Plan i panjohur",
        planSlug: plan?.slug || "unknown",
        subscriptions: item._count._all,
      };
    }),

    recentPaidPayments,
  };
}
