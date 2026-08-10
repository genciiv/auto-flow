import { db } from "@/lib/db";

const DEFAULT_LIMIT = 12;
const ADMIN_READ_MARKER_TITLE = "__ADMIN_NOTIFICATION_READ__";

function normalizeLimit(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsedValue, 30);
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

export async function getAdminNotificationSummary({
  limit = DEFAULT_LIMIT,
  userId = null,
} = {}) {
  const take = normalizeLimit(limit);
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
