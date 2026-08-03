"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessContext } from "@/lib/business-context";
import {
  markBusinessNotificationAsRead,
  markUserNotificationAsRead,
} from "@/services/notification-service";

export async function markDashboardNotificationAsReadAction(notificationId, scope = "business") {
  try {
    const context = await requireBusinessContext();
    const cleanNotificationId = String(notificationId ?? "").trim();

    if (!cleanNotificationId) {
      return { success: false, message: "Njoftimi nuk u gjet." };
    }

    const updated =
      scope === "user"
        ? await markUserNotificationAsRead({
            notificationId: cleanNotificationId,
            userId: context.userId,
          })
        : await markBusinessNotificationAsRead({
            notificationId: cleanNotificationId,
            businessId: context.businessId,
          });

    if (!updated) {
      return {
        success: false,
        message: "Njoftimi nuk ekziston ose nuk keni akses.",
      };
    }

    revalidatePath("/dashboard", "layout");
    return { success: true, message: "Njoftimi u shënua si i lexuar." };
  } catch (error) {
    console.error("markDashboardNotificationAsReadAction:", error);
    return { success: false, message: "Njoftimi nuk mund të përditësohej." };
  }
}

export async function markBusinessNotificationAsReadAction(notificationId) {
  return markDashboardNotificationAsReadAction(notificationId, "business");
}
