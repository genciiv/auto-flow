import { db } from "@/lib/db";

const DEFAULT_LIMIT = 12;

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
} = {}) {
  const take = normalizeLimit(limit);
  const now = new Date();

  const trialWarningEnd = new Date(now);
  trialWarningEnd.setDate(trialWarningEnd.getDate() + 3);

  const [
    pendingApplications,
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
      priority: 2,
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
        priority: 3,
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

  const visibleNotifications = notifications.slice(0, take);

  return {
    notifications: visibleNotifications,
    unreadCount: notifications.length,
    counts: {
      applications: pendingApplications.length,
      payments: pendingPayments.length,
      expiringTrials: expiringTrials.length,
      expiredSubscriptions: expiredSubscriptions.length,
    },
  };
}
