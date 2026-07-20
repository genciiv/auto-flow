import { db } from "@/lib/db";

const PAGE_SIZE = 10;

function normalizePage(page) {
  const parsedPage = Number.parseInt(page, 10);

  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

function normalizeStatus(status) {
  if (status === "active" || status === "inactive") {
    return status;
  }

  return "all";
}

export async function getBusinesses({
  search = "",
  status = "all",
  city = "all",
  page = 1,
} = {}) {
  const currentPage = normalizePage(page);
  const normalizedStatus = normalizeStatus(status);
  const normalizedSearch = search.trim();
  const normalizedCity = city.trim();

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
              city: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              users: {
                some: {
                  role: "OWNER",
                  user: {
                    OR: [
                      {
                        name: {
                          contains: normalizedSearch,
                          mode: "insensitive",
                        },
                      },
                      {
                        email: {
                          contains: normalizedSearch,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                },
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

    ...(normalizedCity && normalizedCity !== "all"
      ? {
          city: normalizedCity,
        }
      : {}),
  };

  const [businesses, totalBusinesses, cities] = await Promise.all([
    db.business.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        users: {
          where: {
            role: "OWNER",
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
            customers: true,
            vehicles: true,
            services: true,
            invoices: true,
          },
        },
      },
    }),

    db.business.count({
      where,
    }),

    db.business.findMany({
      where: {
        city: {
          not: null,
        },
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
      select: {
        city: true,
      },
    }),
  ]);

  return {
    businesses,
    cities: cities.map((item) => item.city).filter(Boolean),
    pagination: {
      currentPage,
      pageSize: PAGE_SIZE,
      totalItems: totalBusinesses,
      totalPages: Math.max(1, Math.ceil(totalBusinesses / PAGE_SIZE)),
    },
    filters: {
      search: normalizedSearch,
      status: normalizedStatus,
      city: normalizedCity || "all",
    },
  };
}

export async function getBusinessById(businessId) {
  if (!businessId) {
    return null;
  }

  return db.business.findUnique({
    where: {
      id: businessId,
    },
    include: {
      users: {
        orderBy: [
          {
            role: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true,
            },
          },
        },
      },
      customers: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          city: true,
          createdAt: true,
        },
      },
      vehicles: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          plate: true,
          brand: true,
          model: true,
          year: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      services: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          total: true,
          createdAt: true,
          vehicle: {
            select: {
              id: true,
              plate: true,
              brand: true,
              model: true,
            },
          },
        },
      },
      invoices: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          users: true,
          customers: true,
          vehicles: true,
          services: true,
          appointments: true,
          parts: true,
          invoices: true,
          purchaseOrders: true,
        },
      },
    },
  });
}

export async function getBusinessFinancialSummary(businessId) {
  const [invoiceSummary, paidInvoiceSummary, serviceSummary] =
    await Promise.all([
      db.invoice.aggregate({
        where: {
          businessId,
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      }),

      db.invoice.aggregate({
        where: {
          businessId,
          status: "PAID",
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      }),

      db.serviceRecord.aggregate({
        where: {
          businessId,
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

  return {
    invoiceTotal: invoiceSummary._sum.total ?? 0,
    paidRevenue: paidInvoiceSummary._sum.total ?? 0,
    serviceTotal: serviceSummary._sum.total ?? 0,
    invoiceCount: invoiceSummary._count.id,
    paidInvoiceCount: paidInvoiceSummary._count.id,
    serviceCount: serviceSummary._count.id,
  };
}

export async function updateBusinessStatus({ businessId, isActive }) {
  return db.business.update({
    where: {
      id: businessId,
    },
    data: {
      isActive,
    },
  });
}
