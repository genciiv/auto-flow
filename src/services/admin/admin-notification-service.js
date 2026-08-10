import { db } from "@/lib/db";

const DEFAULT_LIMIT = 12;
const ADMIN_READ_MARKER_TITLE = "__ADMIN_NOTIFICATION_READ__";
const ADMIN_HISTORY_PREFIX = "__ADMIN_HISTORY__:";
const ADMIN_HISTORY_ENTITY_PREFIX = "admin-history:";

function normalizeLimit(value, fallback = DEFAULT_LIMIT, maximum = 100) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.min(parsedValue, maximum);
}

function normalizePage(value) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function getDaysRemaining(date) {
  if (!date) {
    return null;
  }

  const currentDate = new Date();
  const targetDate = new Date(date);
  const difference = targetDate.getTime() - currentDate.getTime();

  return Math.ceil(difference / 86_400_000);
}

function historyEntityId(sourceId) {
  return `${ADMIN_HISTORY_ENTITY_PREFIX}${sourceId}`;
}

function sourceIdFromHistory(record) {
  const entityId = String(record.entityId || "");

  return entityId.startsWith(ADMIN_HISTORY_ENTITY_PREFIX)
    ? entityId.slice(ADMIN_HISTORY_ENTITY_PREFIX.length)
    : entityId;
}

function historyType(kind) {
  if (kind === "PAYMENT_PENDING" || kind === "TRIAL_EXPIRING") {
    return "WARNING";
  }

  if (kind === "SUBSCRIPTION_EXPIRED") {
    return "ERROR";
  }

  return "INFO";
}

function parseHistoryRecord(record) {
  let payload = {};

  try {
    payload = JSON.parse(record.message || "{}");
  } catch {
    payload = { message: record.message || "" };
  }

  const sourceId = sourceIdFromHistory(record);

  return {
    id: record.id,
    sourceId,
    kind: payload.kind || "SYSTEM",
    title: String(record.title || "").replace(ADMIN_HISTORY_PREFIX, ""),
    subtitle: payload.subtitle || "",
    message: payload.message || "",
    href: payload.href || "/admin/notifications",
    createdAt: record.createdAt,
    isRead: false,
  };
}

export async function syncAdminNotificationHistory({ userId, notifications }) {
  if (!userId || !Array.isArray(notifications) || notifications.length === 0) {
    return;
  }

  const sourceIds = notifications.map((notification) => notification.id);
  const entityIds = sourceIds.map(historyEntityId);

  const existing = await db.notification.findMany({
    where: {
      userId,
      businessId: null,
      entityType: "SYSTEM",
      entityId: {
        in: entityIds,
      },
      title: {
        startsWith: ADMIN_HISTORY_PREFIX,
      },
    },
    select: {
      entityId: true,
    },
  });

  const existingEntityIds = new Set(
    existing.map((notification) => notification.entityId).filter(Boolean),
  );

  const missingNotifications = notifications.filter(
    (notification) =>
      !existingEntityIds.has(historyEntityId(notification.id)),
  );

  if (missingNotifications.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: missingNotifications.map((notification) => ({
      userId,
      businessId: null,
      title: `${ADMIN_HISTORY_PREFIX}${notification.title}`,
      message: JSON.stringify({
        sourceId: notification.id,
        kind: notification.kind,
        subtitle: notification.subtitle || "",
        message: notification.message,
        href: notification.href,
      }),
      type: historyType(notification.kind),
      entityType: "SYSTEM",
      entityId: historyEntityId(notification.id),
      isRead: false,
      createdAt: new Date(notification.createdAt),
    })),
  });
}

export async function getAdminNotificationSummary({
  limit = DEFAULT_LIMIT,
  userId = null,
} = {}) {
  const take = normalizeLimit(limit, DEFAULT_LIMIT, 30);
  const now = new Date();

  const trialWarningEnd = new Date(now);
  trialWarningEnd.setDate(trialWarningEnd.getDate() + 3);

  const [
    pendingApplications,
    pendingPlanRequests,
    pendingPayments,
    expiringTrials,
    expiredSubscriptions,
  ] = await Promise.all([
    db.businessApplication.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    }),

    db.subscriptionPlanRequest.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        createdAt: true,
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        requestedPlan: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    }),

    db.payment.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        createdAt: true,
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        subscription: {
          select: {
            plan: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    }),

    db.subscription.findMany({
      where: {
        status: "TRIALING",
        trialEndsAt: {
          gt: now,
          lte: trialWarningEnd,
        },
      },
      select: {
        id: true,
        trialEndsAt: true,
        createdAt: true,
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        trialEndsAt: "asc",
      },
      take,
    }),

    db.subscription.findMany({
      where: {
        status: "EXPIRED",
      },
      select: {
        id: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
        updatedAt: true,
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        plan: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take,
    }),
  ]);

  const notifications = [
    ...pendingApplications.map((application) => ({
      id: `application-${application.id}`,
      kind: "APPLICATION",
      title: "Aplikim i ri",
      subtitle: application.businessName,
      message: `${application.ownerName} ka dërguar një aplikim për AutoFlow.`,
      href: `/admin/applications/${application.id}`,
      createdAt: application.createdAt,
      priority: 1,
    })),

    ...pendingPlanRequests.map((request) => ({
      id: `plan-request-${request.id}`,
      kind: "PLAN_REQUEST",
      title: "Kërkesë për plan",
      subtitle: request.business.name,
      message: `Biznesi kërkon planin ${request.requestedPlan.name}.`,
      href: "/admin/plan-requests",
      createdAt: request.createdAt,
      priority: 2,
    })),

    ...pendingPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      kind: "PAYMENT_PENDING",
      title: "Pagesë në pritje",
      subtitle: payment.business.name,
      message: `${Number(payment.amount).toLocaleString(
        "sq-AL",
      )} ${payment.currency === "ALL" ? "Lekë" : payment.currency} për ${
        payment.subscription?.plan?.name || "abonimin"
      } pret konfirmim.`,
      href: `/admin/payments/${payment.id}`,
      createdAt: payment.createdAt,
      priority: 3,
    })),

    ...expiringTrials.map((subscription) => {
      const daysRemaining = getDaysRemaining(subscription.trialEndsAt);

      return {
        id: `trial-${subscription.id}`,
        kind: "TRIAL_EXPIRING",
        title: "Trial po skadon",
        subtitle: subscription.business.name,
        message:
          daysRemaining === 1
            ? "Trial-i përfundon nesër."
            : `Trial-i përfundon pas ${daysRemaining} ditësh.`,
        href: `/admin/subscriptions/${subscription.id}`,
        createdAt: subscription.trialEndsAt,
        priority: 5,
      };
    }),

    ...expiredSubscriptions.map((subscription) => ({
      id: `expired-${subscription.id}`,
      kind: "SUBSCRIPTION_EXPIRED",
      title: "Abonim i skaduar",
      subtitle: subscription.business.name,
      message:
        subscription.plan.slug === "free-trial"
          ? "Periudha e provës ka përfunduar."
          : `Abonimi ${subscription.plan.name} ka përfunduar.`,
      href: `/admin/subscriptions/${subscription.id}`,
      createdAt: subscription.updatedAt,
      priority: 4,
    })),
  ];

  notifications.sort((firstNotification, secondNotification) => {
    if (firstNotification.priority !== secondNotification.priority) {
      return firstNotification.priority - secondNotification.priority;
    }

    return (
      new Date(secondNotification.createdAt).getTime() -
      new Date(firstNotification.createdAt).getTime()
    );
  });

  if (userId && notifications.length > 0) {
    await syncAdminNotificationHistory({
      userId,
      notifications,
    });
  }

  let readNotificationIds = new Set();

  if (userId && notifications.length > 0) {
    const readMarkers = await db.notification.findMany({
      where: {
        userId,
        businessId: null,
        title: ADMIN_READ_MARKER_TITLE,
        entityType: "SYSTEM",
        isRead: true,
        entityId: {
          in: notifications.map((notification) => notification.id),
        },
      },
      select: {
        entityId: true,
      },
    });

    readNotificationIds = new Set(
      readMarkers.map((marker) => marker.entityId).filter(Boolean),
    );
  }

  const notificationsWithReadState = notifications.map((notification) => ({
    ...notification,
    isRead: readNotificationIds.has(notification.id),
  }));

  const visibleNotifications = notificationsWithReadState.slice(0, take);
  const unreadCount = notificationsWithReadState.reduce(
    (total, notification) => total + (notification.isRead ? 0 : 1),
    0,
  );

  return {
    notifications: visibleNotifications,
    unreadCount,
    counts: {
      applications: pendingApplications.length,
      planRequests: pendingPlanRequests.length,
      payments: pendingPayments.length,
      expiringTrials: expiringTrials.length,
      expiredSubscriptions: expiredSubscriptions.length,
    },
  };
}

export async function getAdminNotificationCenter({
  userId,
  search = "",
  status = "all",
  kind = "all",
  page = 1,
  limit = 20,
} = {}) {
  if (!userId) {
    throw new Error("User-i është i detyrueshëm.");
  }

  await getAdminNotificationSummary({
    userId,
    limit: 30,
  });

  const records = await db.notification.findMany({
    where: {
      userId,
      businessId: null,
      entityType: "SYSTEM",
      title: {
        startsWith: ADMIN_HISTORY_PREFIX,
      },
    },
    select: {
      id: true,
      title: true,
      message: true,
      entityId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const history = records.map(parseHistoryRecord);
  const sourceIds = history.map((notification) => notification.sourceId);

  let readIds = new Set();

  if (sourceIds.length > 0) {
    const readMarkers = await db.notification.findMany({
      where: {
        userId,
        businessId: null,
        title: ADMIN_READ_MARKER_TITLE,
        entityType: "SYSTEM",
        isRead: true,
        entityId: {
          in: sourceIds,
        },
      },
      select: {
        entityId: true,
      },
    });

    readIds = new Set(readMarkers.map((marker) => marker.entityId).filter(Boolean));
  }

  const withReadState = history.map((notification) => ({
    ...notification,
    isRead: readIds.has(notification.sourceId),
  }));

  const normalizedSearch = String(search || "").trim().toLocaleLowerCase("sq-AL");
  const normalizedStatus = ["read", "unread"].includes(status) ? status : "all";
  const normalizedKind = String(kind || "all");
  const filtered = withReadState.filter((notification) => {
    if (
      normalizedStatus === "read" &&
      !notification.isRead
    ) {
      return false;
    }

    if (
      normalizedStatus === "unread" &&
      notification.isRead
    ) {
      return false;
    }

    if (
      normalizedKind !== "all" &&
      notification.kind !== normalizedKind
    ) {
      return false;
    }

    if (normalizedSearch) {
      const searchable = [
        notification.title,
        notification.subtitle,
        notification.message,
      ]
        .join(" ")
        .toLocaleLowerCase("sq-AL");

      if (!searchable.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });

  const currentPage = normalizePage(page);
  const pageSize = normalizeLimit(limit, 20, 50);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    notifications: filtered.slice(start, start + pageSize),
    totalCount: withReadState.length,
    unreadCount: withReadState.reduce(
      (total, notification) => total + (notification.isRead ? 0 : 1),
      0,
    ),
    pagination: {
      page: safePage,
      limit: pageSize,
      total: filtered.length,
      totalPages,
    },
  };
}

export async function markAdminNotificationRead({ userId, notificationId }) {
  if (!userId || !notificationId) {
    throw new Error("User-i dhe njoftimi janë të detyrueshëm.");
  }

  const existingMarker = await db.notification.findFirst({
    where: {
      userId,
      businessId: null,
      title: ADMIN_READ_MARKER_TITLE,
      entityType: "SYSTEM",
      entityId: notificationId,
      isRead: true,
    },
    select: {
      id: true,
    },
  });

  if (existingMarker) {
    return existingMarker;
  }

  return db.notification.create({
    data: {
      userId,
      title: ADMIN_READ_MARKER_TITLE,
      message: "Admin notification acknowledged.",
      type: "INFO",
      entityType: "SYSTEM",
      entityId: notificationId,
      isRead: true,
    },
    select: {
      id: true,
    },
  });
}

export async function markAllAdminNotificationsRead({ userId }) {
  if (!userId) {
    throw new Error("User-i është i detyrueshëm.");
  }

  const historyRecords = await db.notification.findMany({
    where: {
      userId,
      businessId: null,
      entityType: "SYSTEM",
      title: {
        startsWith: ADMIN_HISTORY_PREFIX,
      },
    },
    select: {
      entityId: true,
    },
  });

  const sourceIds = historyRecords
    .map(sourceIdFromHistory)
    .filter(Boolean);

  if (sourceIds.length === 0) {
    return { count: 0 };
  }

  const existingMarkers = await db.notification.findMany({
    where: {
      userId,
      businessId: null,
      title: ADMIN_READ_MARKER_TITLE,
      entityType: "SYSTEM",
      isRead: true,
      entityId: {
        in: sourceIds,
      },
    },
    select: {
      entityId: true,
    },
  });

  const existingIds = new Set(
    existingMarkers.map((marker) => marker.entityId).filter(Boolean),
  );

  const missingIds = sourceIds.filter((sourceId) => !existingIds.has(sourceId));

  if (missingIds.length === 0) {
    return { count: 0 };
  }

  return db.notification.createMany({
    data: missingIds.map((sourceId) => ({
      userId,
      title: ADMIN_READ_MARKER_TITLE,
      message: "Admin notification acknowledged.",
      type: "INFO",
      entityType: "SYSTEM",
      entityId: sourceId,
      isRead: true,
    })),
  });
}
