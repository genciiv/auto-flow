"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "@/services/admin/settings-service";

function getBoolean(formData, fieldName) {
  return formData.get(fieldName) === "on";
}

export async function updateSettingsAction(formData) {
  await requirePlatformAdmin();

  try {
    const currentSettings = await getPlatformSettings();

    const settings = await updatePlatformSettings({
      platformName: formData.get("platformName"),
      supportEmail: formData.get("supportEmail"),
      supportPhone: formData.get("supportPhone"),
      companyAddress: formData.get("companyAddress"),

      defaultCurrency: formData.get("defaultCurrency"),
      defaultTimezone: formData.get("defaultTimezone"),

      trialEnabled: getBoolean(formData, "trialEnabled"),

      trialDurationDays: formData.get("trialDurationDays"),

      cashPaymentsEnabled: getBoolean(formData, "cashPaymentsEnabled"),

      bankPaymentsEnabled: getBoolean(formData, "bankPaymentsEnabled"),

      cardPaymentsEnabled: getBoolean(formData, "cardPaymentsEnabled"),

      bankName: formData.get("bankName"),
      bankAccountName: formData.get("bankAccountName"),
      bankAccountNumber: formData.get("bankAccountNumber"),

      bankIban: formData.get("bankIban"),
      bankSwiftCode: formData.get("bankSwiftCode"),

      maintenanceMode: getBoolean(formData, "maintenanceMode"),

      allowRegistrations: getBoolean(formData, "allowRegistrations"),
    });

    revalidatePath("/admin/settings");

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
