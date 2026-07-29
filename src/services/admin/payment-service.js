import { db } from "@/lib/db";

import { getPlatformSettings } from "@/services/admin/settings-service";

const PAGE_SIZE = 10;

const VALID_STATUSES = ["all", "PENDING", "PAID", "FAILED", "REFUNDED"];

const VALID_METHODS = ["all", "CASH", "BANK_TRANSFER", "CARD", "OTHER"];

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

function normalizeMethod(method) {
  return VALID_METHODS.includes(method) ? method : "all";
}

export async function getPayments({
  search = "",
  status = "all",
  method = "all",
  page = 1,
} = {}) {
  const normalizedSearch = search.trim();
  const normalizedStatus = normalizeStatus(status);
  const normalizedMethod = normalizeMethod(method);
  const currentPage = normalizePage(page);

  const where = {
    ...(normalizedStatus !== "all"
      ? {
          status: normalizedStatus,
        }
      : {}),

    ...(normalizedMethod !== "all"
      ? {
          method: normalizedMethod,
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
              reference: {
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
            {
              subscription: {
                plan: {
                  name: {
                    contains: normalizedSearch,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [
    payments,
    totalItems,
    paidCount,
    pendingCount,
    failedCount,
    refundedCount,
    paidRevenue,
  ] = await Promise.all([
    db.payment.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        subscription: {
          select: {
            id: true,
            status: true,
            billingInterval: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
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
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),

    db.payment.count({
      where,
    }),

    db.payment.count({
      where: {
        status: "PAID",
      },
    }),

    db.payment.count({
      where: {
        status: "PENDING",
      },
    }),

    db.payment.count({
      where: {
        status: "FAILED",
      },
    }),

    db.payment.count({
      where: {
        status: "REFUNDED",
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
  ]);

  return {
    payments,

    counts: {
      paid: paidCount,
      pending: pendingCount,
      failed: failedCount,
      refunded: refundedCount,
    },

    totals: {
      revenue: Number(paidRevenue._sum.amount || 0),
    },

    filters: {
      search: normalizedSearch,
      status: normalizedStatus,
      method: normalizedMethod,
    },

    pagination: {
      currentPage,
      totalItems,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
    },
  };
}

export async function getPaymentById(paymentId) {
  if (!paymentId) {
    return null;
  }

  return db.payment.findUnique({
    where: {
      id: paymentId,
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
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });
}

export async function getPaymentFormData() {
  const [subscriptions, settings] = await Promise.all([
    db.subscription.findMany({
      where: {
        status: {
          in: ["TRIALING", "ACTIVE", "PAST_DUE", "EXPIRED"],
        },

        business: {
          isActive: true,
        },

        plan: {
          slug: {
            not: "free-trial",
          },
          isActive: true,
        },
      },

      select: {
        id: true,
        businessId: true,
        status: true,
        billingInterval: true,
        price: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,

        business: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },

        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            monthlyPrice: true,
            yearlyPrice: true,
          },
        },
      },

      orderBy: [
        {
          business: {
            name: "asc",
          },
        },
        {
          createdAt: "desc",
        },
      ],
    }),

    getPlatformSettings(),
  ]);

  const paymentMethods = [];

  if (settings.cashPaymentsEnabled) {
    paymentMethods.push({
      value: "CASH",
      label: "Cash",
    });
  }

  if (settings.bankPaymentsEnabled) {
    paymentMethods.push({
      value: "BANK_TRANSFER",
      label: "Transfertë bankare",
    });
  }

  if (settings.cardPaymentsEnabled) {
    paymentMethods.push({
      value: "CARD",
      label: "Kartë",
    });
  }

  paymentMethods.push({
    value: "OTHER",
    label: "Tjetër",
  });

  return {
    subscriptions,
    paymentMethods,
  };
}

export async function createPayment({
  businessId,
  subscriptionId,
  amount,
  currency = "ALL",
  status,
  method,
  reference,
  description,
  paidAt,
  periodStart,
  periodEnd,
}) {
  return db.payment.create({
    data: {
      businessId,
      subscriptionId: subscriptionId || null,
      amount,
      currency,
      status,
      method,
      reference: reference || null,
      description: description || null,
      paidAt: paidAt || null,
      periodStart: periodStart || null,
      periodEnd: periodEnd || null,
    },
  });
}

export async function updatePaymentStatus({ paymentId, status }) {
  const payment = await db.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new Error("Pagesa nuk u gjet.");
  }

  return db.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status,
      paidAt:
        status === "PAID"
          ? payment.paidAt || new Date()
          : status === "PENDING"
            ? null
            : payment.paidAt,
    },
  });
}

export async function refundPayment(paymentId) {
  const payment = await db.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new Error("Pagesa nuk u gjet.");
  }

  if (payment.status !== "PAID") {
    throw new Error("Vetëm një pagesë e përfunduar mund të rimbursohet.");
  }

  return db.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status: "REFUNDED",
    },
  });
}
