import { db } from "@/lib/db";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function cleanText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function prepareNotificationData(data) {
  if (!data?.userId && !data?.businessId) {
    throw new Error("Njoftimi duhet të ketë userId ose businessId.");
  }

  const title = cleanText(data.title);
  const message = cleanText(data.message);

  if (!title || !message) {
    throw new Error("Titulli dhe mesazhi i njoftimit janë të detyrueshëm.");
  }

  return {
    userId: data.userId || null,
    businessId: data.businessId || null,
    title,
    message,
    type: data.type || "INFO",
    entityType: data.entityType || null,
    entityId: data.entityId || null,
    actorUserId: data.actorUserId || null,
    actorName: cleanText(data.actorName) || null,
    actorAvatar: cleanText(data.actorAvatar) || null,
    href: cleanText(data.href) || null,
  };
}

export async function createNotification(data) {
  return db.notification.create({
    data: prepareNotificationData(data),
  });
}

export async function createCustomerNotification(data) {
  if (!data?.userId) {
    throw new Error("userId është i detyrueshëm.");
  }

  return createNotification({
    ...data,
    userId: data.userId,
    businessId: null,
  });
}

export async function createBusinessNotification(data) {
  if (!data?.businessId) {
    throw new Error("businessId është i detyrueshëm.");
  }

  return createNotification({
    ...data,
    userId: null,
    businessId: data.businessId,
  });
}

export async function getUserNotificationSummary(
  userId,
  { limit = DEFAULT_LIMIT } = {},
) {
  if (!userId) {
    return {
      notifications: [],
      unreadCount: 0,
    };
  }

  const take = normalizeLimit(limit);

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        entityType: true,
        entityId: true,
        actorUserId: true,
        actorName: true,
        actorAvatar: true,
        href: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    }),

    db.notification.count({
      where: {
        userId,
        isRead: false,
      },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
}

export async function getBusinessNotificationSummary(
  businessId,
  { limit = DEFAULT_LIMIT } = {},
) {
  if (!businessId) {
    return {
      notifications: [],
      unreadCount: 0,
    };
  }

  const take = normalizeLimit(limit);

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        entityType: true,
        entityId: true,
        actorUserId: true,
        actorName: true,
        actorAvatar: true,
        href: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    }),

    db.notification.count({
      where: {
        businessId,
        isRead: false,
      },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
}

export async function markUserNotificationAsRead({ notificationId, userId }) {
  const result = await db.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result.count > 0;
}

export async function markAllUserNotificationsAsRead(userId) {
  return db.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function deleteUserNotification({ notificationId, userId }) {
  const result = await db.notification.deleteMany({
    where: {
      id: notificationId,
      userId,
    },
  });

  return result.count > 0;
}
