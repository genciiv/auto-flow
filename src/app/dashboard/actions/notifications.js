"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionFailure,
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { requireBusinessContext } from "@/lib/business-context";
import { ERROR_CODES } from "@/lib/errors";
import { validateObject } from "@/lib/validation";
import {
  markBusinessNotificationAsRead,
  markUserNotificationAsRead,
} from "@/services/notification-service";

const notificationScopeSchema = z.enum([
  "business",
  "user",
]);

const notificationInputSchema = z.object({
  notificationId: z
    .string()
    .trim()
    .min(1, "Njoftimi nuk u gjet."),

  scope: notificationScopeSchema,
});

const businessNotificationInputSchema = z.object({
  notificationId: z
    .string()
    .trim()
    .min(1, "Njoftimi nuk u gjet."),
});

export async function markDashboardNotificationAsReadAction(
  notificationId,
  scope = "business",
) {
  const validationResult = validateObject(
    notificationInputSchema,
    {
      notificationId,
      scope,
    },
  );

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Njoftimi nuk është i vlefshëm.",
    });
  }

  try {
    const context = await requireBusinessContext();

    const {
      notificationId: validatedNotificationId,
      scope: validatedScope,
    } = validationResult.data;

    const updated =
      validatedScope === "user"
        ? await markUserNotificationAsRead({
            notificationId:
              validatedNotificationId,
            userId: context.userId,
            businessId: context.businessId,
          })
        : await markBusinessNotificationAsRead({
            notificationId:
              validatedNotificationId,
            businessId: context.businessId,
          });

    if (!updated) {
      return actionFailure({
        code: ERROR_CODES.NOT_FOUND,
        message:
          "Njoftimi nuk ekziston ose nuk keni akses.",
      });
    }

    revalidatePath("/dashboard", "layout");

    return actionSuccess({
      message:
        "Njoftimi u shënua si i lexuar.",
      data: {
        notificationId:
          validatedNotificationId,
        scope: validatedScope,
      },
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage:
        "Njoftimi nuk mund të përditësohej.",
    });
  }
}

export async function markBusinessNotificationAsReadAction(
  notificationId,
) {
  const validationResult = validateObject(
    businessNotificationInputSchema,
    {
      notificationId,
    },
  );

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Njoftimi nuk është i vlefshëm.",
    });
  }

  return markDashboardNotificationAsReadAction(
    validationResult.data.notificationId,
    "business",
  );
}