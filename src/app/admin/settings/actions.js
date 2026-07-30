"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { platformSettingsSchema } from "@/schemas/platform-settings-schema";
import { updatePlatformSettings } from "@/services/admin/settings-service";

function getAdminUserId(admin) {
  return admin?.user?.id ?? admin?.id ?? null;
}

function revalidateSettingsPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/activity-logs");
}

export async function updateSettingsAction(formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  try {
    const validationResult = validateFormData(platformSettingsSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          validationResult.error,
          "Konfigurimet nuk janë të vlefshme.",
        ),
      };
    }

    const settings = await updatePlatformSettings(validationResult.data, {
      userId: adminUserId,
    });

    revalidateSettingsPages();

    return {
      success: true,
      message: "Konfigurimet u ruajtën me sukses.",
      settings,
    };
  } catch (error) {
    console.error("Failed to update platform settings:", error);

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Konfigurimet nuk mund të ruheshin.",
    };
  }
}
