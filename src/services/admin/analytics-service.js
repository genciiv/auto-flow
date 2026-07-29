import { db } from "@/lib/db";

function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getPreviousMonthRange(date = new Date()) {
  const previousMonthDate = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1,
  );

  return {
    start: getMonthStart(previousMonthDate),
    end: getMonthEnd(previousMonthDate),
  };
}

function getCurrentMonthRange(date = new Date()) {
  return {
    start: getMonthStart(date),
    end: getMonthEnd(date),
  };
}

function calculatePercentageChange(currentValue, previousValue) {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function toMonthKey(date) {
  const value = new Date(date);

  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function getLastMonths(count = 6) {
  const months = [];
  const now = new Date();

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

    months.push({
      key: toMonthKey(date),
      label: new Intl.DateTimeFormat("sq-AL", {
        month: "short",
        year: "2-digit",
      }).format(date),
      start: getMonthStart(date),
      end: getMonthEnd(date),
    });
  }

  return months;
}

export async function getAnalytics() {
  const currentMonth = getCurrentMonthRange();
  const previousMonth = getPreviousMonthRange();
  const lastSixMonths = getLastMonths(6);

  const [
    totalBusinesses,
    activeBusinesses,
    totalSubscriptions,
    activeSubscriptions,
    trialSubscriptions,
    expiredSubscriptions,
    paidSubscriptions,
    currentMonthBusinesses,
    previousMonthBusinesses,
    currentMonthRevenue,
    previousMonthRevenue,
    allPaidPayments,
    monthlyBusinessRows,
    monthlyPaymentRows,
    subscriptionsByPlan,
  ] = await Promise.all([
    db.business.count(),

    db.business.count({
      where: {
        isActive: true,
      },
    }),

    db.subscription.count(),

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

    db.subscription.count({
      where: {
        status: "ACTIVE",
        price: {
          gt: 0,
        },
      },
    }),

    db.business.count({
      where: {
        createdAt: {
          gte: currentMonth.start,
          lte: currentMonth.end,
        },
      },
    }),

    db.business.count({
      where: {
        createdAt: {
          gte: previousMonth.start,
          lte: previousMonth.end,
        },
      },
    }),

    db.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: {
          gte: currentMonth.start,
          lte: currentMonth.end,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    db.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: {
          gte: previousMonth.start,
          lte: previousMonth.end,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    db.payment.aggregate({
      where: {
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    }),

    db.business.findMany({
      where: {
        createdAt: {
          gte: lastSixMonths[0].start,
          lte: lastSixMonths[lastSixMonths.length - 1].end,
        },
      },
      select: {
        createdAt: true,
      },
    }),

    db.payment.findMany({
      where: {
        status: "PAID",
        paidAt: {
          gte: lastSixMonths[0].start,
          lte: lastSixMonths[lastSixMonths.length - 1].end,
        },
      },
      select: {
        amount: true,
        paidAt: true,
      },
    }),

    db.subscription.groupBy({
      by: ["planId"],
      _count: {
        _all: true,
      },
      _sum: {
        price: true,
      },
      orderBy: {
        _count: {
          planId: "desc",
        },
      },
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
          isActive: true,
        },
      })
    : [];

  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  const monthlyBusinesses = new Map();
  const monthlyRevenue = new Map();

  for (const month of lastSixMonths) {
    monthlyBusinesses.set(month.key, 0);
    monthlyRevenue.set(month.key, 0);
  }

  for (const business of monthlyBusinessRows) {
    const key = toMonthKey(business.createdAt);

    monthlyBusinesses.set(key, (monthlyBusinesses.get(key) || 0) + 1);
  }

  for (const payment of monthlyPaymentRows) {
    if (!payment.paidAt) {
      continue;
    }

    const key = toMonthKey(payment.paidAt);

    monthlyRevenue.set(
      key,
      (monthlyRevenue.get(key) || 0) + Number(payment.amount || 0),
    );
  }

  const currentRevenue = Number(currentMonthRevenue._sum.amount || 0);

  const previousRevenue = Number(previousMonthRevenue._sum.amount || 0);

  const totalRevenue = Number(allPaidPayments._sum.amount || 0);

  const trialConversionRate =
    totalSubscriptions > 0 ? (paidSubscriptions / totalSubscriptions) * 100 : 0;

  const activeBusinessRate =
    totalBusinesses > 0 ? (activeBusinesses / totalBusinesses) * 100 : 0;

  const averageRevenuePerActiveSubscription =
    activeSubscriptions > 0 ? currentRevenue / activeSubscriptions : 0;

  return {
    summary: {
      totalBusinesses,
      activeBusinesses,
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      currentMonthRevenue: currentRevenue,
      previousMonthRevenue: previousRevenue,
      currentMonthBusinesses,
      previousMonthBusinesses,
      businessGrowth: calculatePercentageChange(
        currentMonthBusinesses,
        previousMonthBusinesses,
      ),
      revenueGrowth: calculatePercentageChange(currentRevenue, previousRevenue),
      trialConversionRate,
      activeBusinessRate,
      averageRevenuePerActiveSubscription,
    },

    monthlyGrowth: lastSixMonths.map((month) => ({
      month: month.key,
      label: month.label,
      businesses: monthlyBusinesses.get(month.key) || 0,
      revenue: monthlyRevenue.get(month.key) || 0,
    })),

    planPerformance: subscriptionsByPlan.map((item) => {
      const plan = planMap.get(item.planId);

      return {
        planId: item.planId,
        planName: plan?.name || "Plan i panjohur",
        planSlug: plan?.slug || "unknown",
        isActive: Boolean(plan?.isActive),
        subscriptions: item._count._all,
        contractedValue: Number(item._sum.price || 0),
      };
    }),
  };
}
