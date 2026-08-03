"use server";

import { revalidatePath } from "next/cache";

import { requireCustomerActionContext } from "@/lib/customer-context";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { notificationIdSchema } from "@/schemas/notification-schema";
import {
  deleteUserNotification,
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
} from "@/services/notification-service";

function revalidateNotificationPaths() {
  revalidatePath("/customer", "layout");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/services");
  revalidatePath("/customer/vehicles");
}

function validateNotificationId(notificationId) {
  const validationResult = validateObject(notificationIdSchema, {
    notificationId,
  });

  if (!validationResult.success) {
    return {
      success: false,
      notificationId: null,
      message: getFirstValidationMessage(
        validationResult.error,
        "Njoftimi nuk u gjet.",
      ),
    };
  }

  return {
    success: true,
    notificationId: validationResult.data.notificationId,
    message: null,
  };
}

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export async function markNotificationAsReadAction(notificationId) {
  try {
    const { userId } = await requireCustomerActionContext();

    const validationResult = validateNotificationId(notificationId);

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.message,
      };
    }

    const updated = await markUserNotificationAsRead({
      notificationId: validationResult.notificationId,
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
      message: getErrorMessage(error, "Njoftimi nuk mund të përditësohej."),
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
      message: getErrorMessage(error, "Njoftimet nuk mund të përditësoheshin."),
    };
  }
}

export async function deleteNotificationAction(notificationId) {
  try {
    const { userId } = await requireCustomerActionContext();

    const validationResult = validateNotificationId(notificationId);

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.message,
      };
    }

    const deleted = await deleteUserNotification({
      notificationId: validationResult.notificationId,
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
      message: getErrorMessage(error, "Njoftimi nuk mund të fshihej."),
    };
  }
}
