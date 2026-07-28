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
  const validStatuses = ["all", "PENDING", "APPROVED", "REJECTED"];

  return validStatuses.includes(status) ? status : "all";
}

export async function getApplications({
  search = "",
  status = "all",
  page = 1,
} = {}) {
  const currentPage = normalizePage(page);
  const normalizedSearch = search.trim();
  const normalizedStatus = normalizeStatus(status);

  const where = {
    ...(normalizedStatus !== "all"
      ? {
          status: normalizedStatus,
        }
      : {}),

    ...(normalizedSearch
      ? {
          OR: [
            {
              businessName: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              ownerName: {
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
              city: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [applications, totalItems, pendingCount, approvedCount, rejectedCount] =
    await Promise.all([
      db.businessApplication.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),

      db.businessApplication.count({
        where,
      }),

      db.businessApplication.count({
        where: {
          status: "PENDING",
        },
      }),

      db.businessApplication.count({
        where: {
          status: "APPROVED",
        },
      }),

      db.businessApplication.count({
        where: {
          status: "REJECTED",
        },
      }),
    ]);

  return {
    applications,
    counts: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
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

export async function getApplicationById(applicationId) {
  if (!applicationId) {
    return null;
  }

  return db.businessApplication.findUnique({
    where: {
      id: applicationId,
    },
  });
}

export async function getApplicationActivationDetails(applicationId) {
  if (!applicationId) {
    throw new Error("ID-ja e aplikimit mungon.");
  }

  const application = await db.businessApplication.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      status: true,
      businessName: true,
      email: true,
      approvedBusinessId: true,
    },
  });

  if (!application) {
    throw new Error("Aplikimi nuk u gjet.");
  }

  if (application.status !== "APPROVED") {
    throw new Error(
      "Email-i i aktivizimit mund të ridërgohet vetëm për aplikime të aprovuara.",
    );
  }

  if (!application.approvedBusinessId) {
    throw new Error("Aplikimi nuk ka një biznes të aprovuar.");
  }

  const membership = await db.businessUser.findFirst({
    where: {
      businessId: application.approvedBusinessId,
      role: "OWNER",
      isActive: true,
      business: {
        isActive: true,
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          emailVerified: true,
          isActive: true,
        },
      },
      business: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  if (!membership?.user || !membership?.business) {
    throw new Error("Pronari aktiv i biznesit nuk u gjet.");
  }

  const activationRequired =
    !membership.user.passwordHash || !membership.user.emailVerified;

  return {
    application,
    business: membership.business,
    ownerUser: membership.user,
    activationRequired,
  };
}

export async function approveApplication({ applicationId, reviewedById }) {
  const application = await db.businessApplication.findUnique({
    where: {
      id: applicationId,
    },
  });

  if (!application) {
    throw new Error("Aplikimi nuk u gjet.");
  }

  if (application.status !== "PENDING") {
    throw new Error("Vetëm aplikimet në pritje mund të aprovohen.");
  }

  const normalizedEmail = application.email.trim().toLowerCase();

  const existingUser = await db.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      emailVerified: true,
      isActive: true,
    },
  });

  const result = await db.$transaction(async (transaction) => {
    let ownerUser;

    if (existingUser) {
      ownerUser = await transaction.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: existingUser.name || application.ownerName,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          emailVerified: true,
        },
      });
    } else {
      ownerUser = await transaction.user.create({
        data: {
          name: application.ownerName,
          email: normalizedEmail,
          passwordHash: null,
          emailVerified: null,
          globalRole: null,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          emailVerified: true,
        },
      });
    }

    const business = await transaction.business.create({
      data: {
        name: application.businessName,
        city: application.city,
        address: application.address,
        phone: application.phone,
        email: normalizedEmail,
        isActive: true,
      },
    });

    await transaction.businessUser.create({
      data: {
        userId: ownerUser.id,
        businessId: business.id,
        role: "OWNER",
        isActive: true,
      },
    });

    await transaction.businessApplication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: reviewedById || null,
        approvedBusinessId: business.id,
        rejectionReason: null,
      },
    });

    return {
      business,
      ownerUser,
    };
  });

  const activationRequired =
    !result.ownerUser.passwordHash || !result.ownerUser.emailVerified;

  return {
    ...result,
    activationRequired,
  };
}

export async function rejectApplication({
  applicationId,
  reviewedById,
  rejectionReason,
}) {
  const application = await db.businessApplication.findUnique({
    where: {
      id: applicationId,
    },
  });

  if (!application) {
    throw new Error("Aplikimi nuk u gjet.");
  }

  if (application.status !== "PENDING") {
    throw new Error("Vetëm aplikimet në pritje mund të refuzohen.");
  }

  return db.businessApplication.update({
    where: {
      id: applicationId,
    },
    data: {
      status: "REJECTED",
      rejectionReason: rejectionReason.trim(),
      reviewedAt: new Date(),
      reviewedById: reviewedById || null,
      approvedBusinessId: null,
    },
  });
}
