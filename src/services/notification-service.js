import { db } from "@/lib/db";

export async function createNotification(data) {
  return db.notification.create({ data });
}

export async function getUserNotifications(userId) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getBusinessNotifications(businessId) {
  return db.notification.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markAsRead(id) {
  return db.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllAsRead(where) {
  return db.notification.updateMany({
    where,
    data: { isRead: true },
  });
}

export async function deleteNotification(id) {
  return db.notification.delete({ where: { id } });
}
