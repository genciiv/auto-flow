"use server";

import { db } from "@/lib/db";

const PAGE_SIZE = 20;
const VALID_STATUSES = ["all", "PENDING", "APPROVED", "REJECTED", "PAID"];

function normalizeStatus(status) {
  return VALID_STATUSES.includes(status) ? status : "all";
}

function normalizePage(page) {
  const parsed = Number.parseInt(page, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function getSubscriptionPlanRequests({
  status = "all",
  search = "",
  page = 1,
} = {}) {
  const normalizedStatus = normalizeStatus(status);
  const normalizedSearch = String(search || "").trim();
  const currentPage = normalizePage(page);

  const where = {
    ...(normalizedStatus !== "all" ? { status: normalizedStatus } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            {
              business: {
                name: { contains: normalizedSearch, mode: "insensitive" },
              },
            },
            {
              business: {
                email: { contains: normalizedSearch, mode: "insensitive" },
              },
            },
            {
              requestedPlan: {
                name: { contains: normalizedSearch, mode: "insensitive" },
              },
            },
            {
              requestedBy: {
                email: { contains: normalizedSearch, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const [requests, total, pending, approved, rejected, paid] = await Promise.all([
    db.subscriptionPlanRequest.findMany({
      where,
      include: {
        business: {
          select: { id: true, name: true, email: true, phone: true },
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
          select: { id: true, name: true, email: true },
        },
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
        subscription: {
          select: { id: true, status: true, currentPeriodEnd: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.subscriptionPlanRequest.count({ where }),
    db.subscriptionPlanRequest.count({ where: { status: "PENDING" } }),
    db.subscriptionPlanRequest.count({ where: { status: "APPROVED" } }),
    db.subscriptionPlanRequest.count({ where: { status: "REJECTED" } }),
    db.subscriptionPlanRequest.count({ where: { status: "PAID" } }),
  ]);

  return {
    requests,
    counts: { pending, approved, rejected, paid },
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

export async function approveSubscriptionPlanRequest({
  requestId,
  reviewedById,
  notes = null,
}) {
  const existing = await db.subscriptionPlanRequest.findUnique({
    where: { id: requestId },
    select: { status: true },
  });

  if (!existing) {
    throw new Error("Kërkesa nuk u gjet.");
  }

  if (existing.status !== "PENDING") {
    throw new Error("Vetëm kërkesat në pritje mund të aprovohen.");
  }

  return db.subscriptionPlanRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      reviewedById,
      reviewedAt: new Date(),
      notes: notes || null,
      rejectionReason: null,
    },
    include: {
      business: true,
      requestedPlan: true,
      requestedBy: true,
    },
  });
}

export async function rejectSubscriptionPlanRequest({
  requestId,
  reviewedById,
  reason,
}) {
  const existing = await db.subscriptionPlanRequest.findUnique({
    where: { id: requestId },
    select: { status: true },
  });

  if (!existing) {
    throw new Error("Kërkesa nuk u gjet.");
  }

  if (!["PENDING", "APPROVED"].includes(existing.status)) {
    throw new Error("Kjo kërkesë nuk mund të refuzohet.");
  }

  return db.subscriptionPlanRequest.update({
    where: { id: requestId },
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

export async function markSubscriptionPlanRequestPaid({
  requestId,
  reviewedById,
}) {
  return db.$transaction(async (transaction) => {
    const request = await transaction.subscriptionPlanRequest.findUnique({
      where: { id: requestId },
      include: {
        business: true,
        requestedPlan: true,
        requestedBy: true,
      },
    });

    if (!request) {
      throw new Error("Kërkesa nuk u gjet.");
    }

    if (!["PENDING", "APPROVED"].includes(request.status)) {
      throw new Error("Kjo kërkesë nuk mund të aktivizohet.");
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
        status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] },
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
      where: { id: request.id },
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
