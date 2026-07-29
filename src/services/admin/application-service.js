import { db } from "@/lib/db";

import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import { getPlatformSettings } from "@/services/admin/settings-service";

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
  if (!applicationId) {
    throw new Error("ID-ja e aplikimit mungon.");
  }

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

  const platformSettings = await getPlatformSettings();

  const trialEnabled = Boolean(platformSettings.trialEnabled);

  const trialDurationDays = Math.max(
    1,
    Number(platformSettings.trialDurationDays) || 7,
  );

  const result = await db.$transaction(async (transaction) => {
    let trialPlan = null;

    if (trialEnabled) {
      trialPlan = await transaction.plan.findUnique({
        where: {
          slug: "free-trial",
        },
      });

      if (!trialPlan) {
        throw new Error(
          "Plani Free Trial nuk u gjet. Krijoje fillimisht te tabela Plan.",
        );
      }

      if (!trialPlan.isActive) {
        throw new Error("Plani Free Trial është i çaktivizuar.");
      }
    }

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

    let subscription = null;

    if (trialEnabled && trialPlan) {
      const trialStartsAt = new Date();
      const trialEndsAt = new Date(trialStartsAt);

      trialEndsAt.setDate(trialEndsAt.getDate() + trialDurationDays);

      subscription = await transaction.subscription.create({
        data: {
          businessId: business.id,
          planId: trialPlan.id,
          status: "TRIALING",
          billingInterval: "MONTHLY",
          price: 0,
          trialStartsAt,
          trialEndsAt,
          currentPeriodStart: trialStartsAt,
          currentPeriodEnd: trialEndsAt,
          cancelAtPeriodEnd: false,
        },
      });
    }

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
      subscription,
    };
  });

  const activationRequired =
    !result.ownerUser.passwordHash || !result.ownerUser.emailVerified;

  await createPlatformAuditLog({
    userId: reviewedById || null,
    businessId: result.business.id,
    action: "STATUS_CHANGE",
    entityType: "BUSINESS_APPLICATION",
    entityId: application.id,
    title: "Aplikimi u aprovua",
    description: `${application.businessName} u aprovua dhe biznesi u krijua.`,
    oldValues: {
      status: application.status,
    },
    newValues: {
      status: "APPROVED",
      approvedBusinessId: result.business.id,
      subscriptionId: result.subscription?.id || null,
      activationRequired,
    },
    metadata: {
      ownerEmail: normalizedEmail,
      trialEnabled,
      trialDurationDays: trialEnabled ? trialDurationDays : null,
    },
  });

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
  if (!applicationId) {
    throw new Error("ID-ja e aplikimit mungon.");
  }

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

  const normalizedReason = String(rejectionReason ?? "").trim();

  if (!normalizedReason) {
    throw new Error("Arsyeja e refuzimit është e detyrueshme.");
  }

  const rejectedApplication = await db.businessApplication.update({
    where: {
      id: applicationId,
    },
    data: {
      status: "REJECTED",
      rejectionReason: normalizedReason,
      reviewedAt: new Date(),
      reviewedById: reviewedById || null,
      approvedBusinessId: null,
    },
  });

  await createPlatformAuditLog({
    userId: reviewedById || null,
    action: "STATUS_CHANGE",
    entityType: "BUSINESS_APPLICATION",
    entityId: application.id,
    title: "Aplikimi u refuzua",
    description: `${application.businessName} u refuzua.`,
    oldValues: {
      status: application.status,
    },
    newValues: {
      status: rejectedApplication.status,
      rejectionReason: normalizedReason,
    },
    metadata: {
      applicantEmail: application.email,
    },
  });

  return rejectedApplication;
}
