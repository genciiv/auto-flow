"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { createActionError } from "@/lib/errors";
import { markAdminNotificationRead } from "@/services/admin/admin-notification-service";

function normalizeNotificationId(value) {
  const notificationId = String(value || "").trim();

  if (!notificationId || notificationId.length > 200) {
    throw createActionError("Njoftimi nuk është i vlefshëm.");
  }

  return notificationId;
}

export async function markAdminNotificationReadAction(notificationId) {
  const admin = await requirePlatformAdmin();
  const normalizedId = normalizeNotificationId(notificationId);

  await markAdminNotificationRead({
    userId: admin.id,
    notificationId: normalizedId,
  });

  revalidatePath("/admin", "layout");

  return { success: true };
}
