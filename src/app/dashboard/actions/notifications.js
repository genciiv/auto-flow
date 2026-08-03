"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessContext } from "@/lib/business-context";
import { markBusinessNotificationAsRead } from "@/services/notification-service";

export async function markBusinessNotificationAsReadAction(notificationId) {
  try {
    const { businessId } = await requireBusinessContext();
    const cleanNotificationId = String(notificationId ?? "").trim();

    if (!cleanNotificationId) {
      return { success: false, message: "Njoftimi nuk u gjet." };
    }

    const updated = await markBusinessNotificationAsRead({
      notificationId: cleanNotificationId,
      businessId,
    });

    if (!updated) {
      return {
        success: false,
        message: "Njoftimi nuk ekziston ose nuk keni akses.",
      };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings/subscription");

    return { success: true, message: "Njoftimi u shënua si i lexuar." };
  } catch (error) {
    console.error("markBusinessNotificationAsReadAction:", error);
    return { success: false, message: "Njoftimi nuk mund të përditësohej." };
  }
}
