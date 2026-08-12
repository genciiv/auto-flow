import { db } from "@/lib/db";
import { moneyToNumber } from "@/lib/money";

function getMonthStart() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getPlatformDashboardData() {
  const monthStart = getMonthStart();

  const [
    totalBusinesses,
    accountActiveBusinesses,
    totalBusinessUsers,
    platformAdmins,
    totalCustomers,
    totalVehicles,
    totalServices,
    recentBusinesses,
    paidActiveSubscriptions,
    trialingSubscriptions,
    businessesWithAccess,
    currentMonthRevenue,
  ] = await Promise.all([
    db.business.count(),

    db.business.count({
      where: {
        isActive: true,
      },
    }),

    db.businessUser.count({
      where: {
        isActive: true,
      },
    }),

    db.user.count({
      where: {
        globalRole: "PLATFORM_ADMIN",
        isActive: true,
      },
    }),

    db.customer.count(),

    db.vehicle.count(),

    db.serviceRecord.count(),

    db.business.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        users: {
          where: {
            role: "OWNER",
            isActive: true,
          },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        subscriptions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                name: true,
                slug: true,
              },
            },
            payments: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              select: {
                status: true,
                method: true,
              },
            },
          },
        },
        _count: {
          select: {
            customers: true,
            vehicles: true,
            services: true,
          },
        },
      },
    }),

    db.subscription.count({
      where: {
        status: "ACTIVE",
        plan: {
          slug: {
            not: "free-trial",
          },
        },
        payments: {
          some: {
            status: "PAID",
          },
        },
      },
    }),

    db.subscription.count({
      where: {
        status: "TRIALING",
      },
    }),

    db.subscription.findMany({
      where: {
        OR: [
          {
            status: "TRIALING",
          },
          {
            status: "ACTIVE",
            plan: {
              slug: {
                not: "free-trial",
              },
            },
            payments: {
              some: {
                status: "PAID",
              },
            },
          },
        ],
      },
      distinct: ["businessId"],
      select: {
        businessId: true,
      },
    }),

    db.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: {
          gte: monthStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const paidOrTrialBusinessCount = businessesWithAccess.length;

  return {
    totalBusinesses,
    accountActiveBusinesses,
    inactiveBusinesses: totalBusinesses - accountActiveBusinesses,
    paidActiveSubscriptions,
    trialingSubscriptions,
    businessesWithoutPaidAccess: Math.max(
      0,
      totalBusinesses - paidOrTrialBusinessCount,
    ),
    currentMonthRevenue: moneyToNumber(currentMonthRevenue._sum.amount),
    totalBusinessUsers,
    platformAdmins,
    totalCustomers,
    totalVehicles,
    totalServices,
    recentBusinesses,
  };
}
