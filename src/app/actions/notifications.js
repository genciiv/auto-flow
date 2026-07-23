"use server";

import { revalidatePath } from "next/cache";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/notification-service";

export async function markNotificationAsRead(id) {
  await markAsRead(id);
  revalidatePath("/");
}

export async function markAllNotificationsAsRead(where) {
  await markAllAsRead(where);
  revalidatePath("/");
}

export async function removeNotification(id) {
  await deleteNotification(id);
  revalidatePath("/");
}
