"use server";

import { revalidatePath } from "next/cache";

import { requireCustomerActionContext } from "@/lib/customer-context";
import {
  deleteUserNotification,
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
} from "@/services/notification-service";

function revalidateNotificationPaths() {
  revalidatePath("/customer", "layout");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/favorites");
  revalidatePath("/customer/listings");
}

export async function markNotificationAsReadAction(notificationId) {
  try {
    const { userId } = await requireCustomerActionContext();

    if (!notificationId || typeof notificationId !== "string") {
      return {
        success: false,
        message: "Njoftimi nuk u gjet.",
      };
    }

    const updated = await markUserNotificationAsRead({
      notificationId,
      userId,
    });

    if (!updated) {
      return {
        success: false,
        message: "Njoftimi nuk ekziston ose nuk keni leje për ta ndryshuar.",
      };
    }

    revalidateNotificationPaths();

    return {
      success: true,
      message: "Njoftimi u shënua si i lexuar.",
    };
  } catch (error) {
    console.error("markNotificationAsReadAction:", error);

    return {
      success: false,
      message: error?.message || "Njoftimi nuk mund të përditësohej.",
    };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const { userId } = await requireCustomerActionContext();

    await markAllUserNotificationsAsRead(userId);

    revalidateNotificationPaths();

    return {
      success: true,
      message: "Të gjitha njoftimet u shënuan si të lexuara.",
    };
  } catch (error) {
    console.error("markAllNotificationsAsReadAction:", error);

    return {
      success: false,
      message: error?.message || "Njoftimet nuk mund të përditësoheshin.",
    };
  }
}

export async function deleteNotificationAction(notificationId) {
  try {
    const { userId } = await requireCustomerActionContext();

    if (!notificationId || typeof notificationId !== "string") {
      return {
        success: false,
        message: "Njoftimi nuk u gjet.",
      };
    }

    const deleted = await deleteUserNotification({
      notificationId,
      userId,
    });

    if (!deleted) {
      return {
        success: false,
        message: "Njoftimi nuk ekziston ose nuk keni leje për ta fshirë.",
      };
    }

    revalidateNotificationPaths();

    return {
      success: true,
      message: "Njoftimi u fshi.",
    };
  } catch (error) {
    console.error("deleteNotificationAction:", error);

    return {
      success: false,
      message: error?.message || "Njoftimi nuk mund të fshihej.",
    };
  }
}
