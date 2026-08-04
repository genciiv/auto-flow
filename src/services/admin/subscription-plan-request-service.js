"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { createActionError, getErrorMessage } from "@/lib/errors";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";

const PAGE_SIZE = 20;

const PLAN_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PAID"];

const planRequestFilterStatusSchema = z.enum(["all", ...PLAN_REQUEST_STATUSES]);

const requiredIdSchema = z.string().trim().min(1, "Identifikuesi mungon.");

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => value || null);

const getRequestsInputSchema = z.object({
  status: planRequestFilterStatusSchema.catch("all"),

  search: z.string().trim().catch(""),

  page: z.coerce.number().int().positive().catch(1),
});

const approveRequestInputSchema = z.object({
  requestId: requiredIdSchema,
  reviewedById: requiredIdSchema,
  notes: optionalTextSchema,
});

const rejectRequestInputSchema = z.object({
  requestId: requiredIdSchema,
  reviewedById: requiredIdSchema,

  reason: z.string().trim().min(3, "Shkruaj arsyen e refuzimit."),
});

const markPaidInputSchema = z.object({
  requestId: requiredIdSchema,
  reviewedById: requiredIdSchema,
});

function getValidationMessage(validationResult, fallbackMessage) {
  return getFirstValidationMessage(validationResult.error, fallbackMessage);
}

function throwValidationError(validationResult, fallbackMessage) {
  throw createActionError(
    getValidationMessage(validationResult, fallbackMessage),
  );
}

export async function getSubscriptionPlanRequests(input = {}) {
  const validationResult = validateObject(getRequestsInputSchema, input);

  if (!validationResult.success) {
    throwValidationError(
      validationResult,
      "Filtrat e kërkesave nuk janë të vlefshëm.",
    );
  }

  const {
    status: normalizedStatus,
    search: normalizedSearch,
    page: currentPage,
  } = validationResult.data;

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
              requestedPlan: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },

            {
              requestedBy: {
                email: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [requests, total, pending, approved, rejected, paid] =
    await Promise.all([
      db.subscriptionPlanRequest.findMany({
        where,

        include: {
          business: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          requestedPlan: {
            select: {
              id: true,
              name: true,
              slug: true,
              monthlyPrice: true,
              yearlyPrice: true,
            },
          },

          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          reviewedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          subscription: {
            select: {
              id: true,
              status: true,
              currentPeriodEnd: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip: (currentPage - 1) * PAGE_SIZE,

        take: PAGE_SIZE,
      }),

      db.subscriptionPlanRequest.count({
        where,
      }),

      db.subscriptionPlanRequest.count({
        where: {
          status: "PENDING",
        },
      }),

      db.subscriptionPlanRequest.count({
        where: {
          status: "APPROVED",
        },
      }),

      db.subscriptionPlanRequest.count({
        where: {
          status: "REJECTED",
        },
      }),

      db.subscriptionPlanRequest.count({
        where: {
          status: "PAID",
        },
      }),
    ]);

  return {
    requests,

    counts: {
      pending,
      approved,
      rejected,
      paid,
    },

    filters: {
      status: normalizedStatus,
      search: normalizedSearch,
    },

    pagination: {
      currentPage,
      total,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    },
  };
}

export async function approveSubscriptionPlanRequest(input) {
  const validationResult = validateObject(approveRequestInputSchema, input);

  if (!validationResult.success) {
    throwValidationError(
      validationResult,
      "Të dhënat e aprovimit nuk janë të vlefshme.",
    );
  }

  const { requestId, reviewedById, notes } = validationResult.data;

  const existing = await db.subscriptionPlanRequest.findUnique({
    where: {
      id: requestId,
    },

    select: {
      status: true,
    },
  });

  if (!existing) {
    throw createActionError("Kërkesa nuk u gjet.");
  }

  if (existing.status !== "PENDING") {
    throw createActionError("Vetëm kërkesat në pritje mund të aprovohen.");
  }

  return db.subscriptionPlanRequest.update({
    where: {
      id: requestId,
    },

    data: {
      status: "APPROVED",
      reviewedById,
      reviewedAt: new Date(),
      notes,
      rejectionReason: null,
    },

    include: {
      business: true,
      requestedPlan: true,
      requestedBy: true,
    },
  });
}

export async function rejectSubscriptionPlanRequest(input) {
  const validationResult = validateObject(rejectRequestInputSchema, input);

  if (!validationResult.success) {
    throwValidationError(
      validationResult,
      "Të dhënat e refuzimit nuk janë të vlefshme.",
    );
  }

  const { requestId, reviewedById, reason } = validationResult.data;

  const existing = await db.subscriptionPlanRequest.findUnique({
    where: {
      id: requestId,
    },

    select: {
      status: true,
    },
  });

  if (!existing) {
    throw createActionError("Kërkesa nuk u gjet.");
  }

  if (!["PENDING", "APPROVED"].includes(existing.status)) {
    throw createActionError("Kjo kërkesë nuk mund të refuzohet.");
  }

  return db.subscriptionPlanRequest.update({
    where: {
      id: requestId,
    },

    data: {
      status: "REJECTED",
      reviewedById,
      reviewedAt: new Date(),
      rejectionReason: reason,
    },

    include: {
      business: true,
      requestedPlan: true,
      requestedBy: true,
    },
  });
}

export async function markSubscriptionPlanRequestPaid(input) {
  const validationResult = validateObject(markPaidInputSchema, input);

  if (!validationResult.success) {
    throwValidationError(
      validationResult,
      "Të dhënat e pagesës nuk janë të vlefshme.",
    );
  }

  const { requestId, reviewedById } = validationResult.data;

  return db.$transaction(async (transaction) => {
    const request = await transaction.subscriptionPlanRequest.findUnique({
      where: {
        id: requestId,
      },

      include: {
        business: true,
        requestedPlan: true,
        requestedBy: true,
      },
    });

    if (!request) {
      throw createActionError("Kërkesa nuk u gjet.");
    }

    if (!["PENDING", "APPROVED"].includes(request.status)) {
      throw createActionError("Kjo kërkesë nuk mund të aktivizohet.");
    }

    const periodStart = new Date();

    const periodEnd = new Date(periodStart);

    if (request.billingInterval === "YEARLY") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await transaction.subscription.updateMany({
      where: {
        businessId: request.businessId,

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

    const subscription = await transaction.subscription.create({
      data: {
        businessId: request.businessId,

        planId: request.requestedPlanId,

        status: "ACTIVE",

        billingInterval: request.billingInterval,

        price: request.requestedPrice,

        trialStartsAt: null,
        trialEndsAt: null,

        currentPeriodStart: periodStart,

        currentPeriodEnd: periodEnd,

        cancelledAt: null,
        cancelAtPeriodEnd: false,
      },
    });

    return transaction.subscriptionPlanRequest.update({
      where: {
        id: request.id,
      },

      data: {
        status: "PAID",
        reviewedById,
        reviewedAt: new Date(),
        paidAt: new Date(),

        subscriptionId: subscription.id,

        rejectionReason: null,
      },

      include: {
        business: true,
        requestedPlan: true,
        requestedBy: true,
        subscription: true,
      },
    });
  });
}
