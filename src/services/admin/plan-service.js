import { db } from "@/lib/db";
import { toMoney } from "@/lib/money";

const PAGE_SIZE = 10;

function normalizePage(page) {
  const parsedPage = Number.parseInt(page, 10);

  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

function normalizeStatus(status) {
  const validStatuses = ["all", "active", "inactive"];

  return validStatuses.includes(status) ? status : "all";
}

export async function getPlans({ search = "", status = "all", page = 1 } = {}) {
  const normalizedSearch = search.trim();
  const normalizedStatus = normalizeStatus(status);
  const currentPage = normalizePage(page);

  const where = {
    ...(normalizedSearch
      ? {
          OR: [
            {
              name: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),

    ...(normalizedStatus === "active"
      ? {
          isActive: true,
        }
      : {}),

    ...(normalizedStatus === "inactive"
      ? {
          isActive: false,
        }
      : {}),
  };

  const [
    plans,
    totalItems,
    totalPlans,
    activePlans,
    inactivePlans,
    activeSubscriptions,
  ] = await Promise.all([
    db.plan.findMany({
      where,
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),

    db.plan.count({
      where,
    }),

    db.plan.count(),

    db.plan.count({
      where: {
        isActive: true,
      },
    }),

    db.plan.count({
      where: {
        isActive: false,
      },
    }),

    db.subscription.count({
      where: {
        status: {
          in: ["TRIALING", "ACTIVE"],
        },
      },
    }),
  ]);

  return {
    plans,

    counts: {
      total: totalPlans,
      active: activePlans,
      inactive: inactivePlans,
      subscriptions: activeSubscriptions,
    },

    filters: {
      search: normalizedSearch,
      status: normalizedStatus,
    },

    pagination: {
      currentPage,
      totalItems,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
    },
  };
}

export async function getPlanById(planId) {
  if (!planId) {
    return null;
  }

  return db.plan.findUnique({
    where: {
      id: planId,
    },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });
}

export async function createPlan({
  name,
  slug,
  description,
  monthlyPrice,
  yearlyPrice,
  maxUsers,
  maxCustomers,
  maxVehicles,
  features,
  isActive = true,
  isRecommended = false,
  sortOrder = 0,
}) {
  return db.plan.create({
    data: {
      name,
      slug,
      description,
      monthlyPrice: toMoney(monthlyPrice),
      yearlyPrice: toMoney(yearlyPrice),
      maxUsers,
      maxCustomers,
      maxVehicles,
      features,
      isActive,
      isRecommended,
      sortOrder,
    },
  });
}

export async function updatePlan({
  planId,
  name,
  slug,
  description,
  monthlyPrice,
  yearlyPrice,
  maxUsers,
  maxCustomers,
  maxVehicles,
  features,
  isActive,
  isRecommended,
  sortOrder,
}) {
  return db.plan.update({
    where: {
      id: planId,
    },
    data: {
      name,
      slug,
      description,
      monthlyPrice: toMoney(monthlyPrice),
      yearlyPrice: toMoney(yearlyPrice),
      maxUsers,
      maxCustomers,
      maxVehicles,
      features,
      isActive,
      isRecommended,
      sortOrder,
    },
  });
}

export async function togglePlanStatus(planId) {
  const plan = await db.plan.findUnique({
    where: {
      id: planId,
    },
    select: {
      id: true,
      slug: true,
      isActive: true,
    },
  });

  if (!plan) {
    throw new Error("Plani nuk u gjet.");
  }

  if (plan.slug === "free-trial" && plan.isActive) {
    throw new Error(
      "Plani Free Trial nuk mund të çaktivizohet sepse përdoret për bizneset e reja.",
    );
  }

  return db.plan.update({
    where: {
      id: planId,
    },
    data: {
      isActive: !plan.isActive,
    },
  });
}

export async function toggleRecommendedPlan(planId) {
  const plan = await db.plan.findUnique({
    where: {
      id: planId,
    },
    select: {
      id: true,
      slug: true,
      isActive: true,
      isRecommended: true,
    },
  });

  if (!plan) {
    throw new Error("Plani nuk u gjet.");
  }

  if (plan.slug === "free-trial") {
    throw new Error("Free Trial nuk mund të jetë plan i rekomanduar.");
  }

  if (!plan.isActive && !plan.isRecommended) {
    throw new Error(
      "Plani duhet të jetë aktiv për t'u shënuar si i rekomanduar.",
    );
  }

  return db.$transaction(async (transaction) => {
    if (!plan.isRecommended) {
      await transaction.plan.updateMany({
        where: {
          isRecommended: true,
        },
        data: {
          isRecommended: false,
        },
      });
    }

    return transaction.plan.update({
      where: {
        id: planId,
      },
      data: {
        isRecommended: !plan.isRecommended,
      },
    });
  });
}
