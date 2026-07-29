import { db } from "@/lib/db";

import { createPlatformAuditLog } from "@/services/admin/activity-log-service";

const DEFAULT_SETTINGS = {
  platformName: "AutoFlow",
  supportEmail: "",
  supportPhone: "",
  companyAddress: "",
  defaultCurrency: "ALL",
  defaultTimezone: "Europe/Tirane",

  trialEnabled: true,
  trialDurationDays: 7,

  cashPaymentsEnabled: true,
  bankPaymentsEnabled: true,
  cardPaymentsEnabled: false,

  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankIban: "",
  bankSwiftCode: "",

  maintenanceMode: false,
  allowRegistrations: true,
};

function normalizeNullableString(value) {
  const normalizedValue = String(value ?? "").trim();

  return normalizedValue || null;
}

function getComparableSettings(settings) {
  return {
    platformName: settings.platformName,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    companyAddress: settings.companyAddress,
    defaultCurrency: settings.defaultCurrency,
    defaultTimezone: settings.defaultTimezone,

    trialEnabled: settings.trialEnabled,
    trialDurationDays: settings.trialDurationDays,

    cashPaymentsEnabled: settings.cashPaymentsEnabled,
    bankPaymentsEnabled: settings.bankPaymentsEnabled,
    cardPaymentsEnabled: settings.cardPaymentsEnabled,

    bankName: settings.bankName,
    bankAccountName: settings.bankAccountName,
    bankAccountNumber: settings.bankAccountNumber,
    bankIban: settings.bankIban,
    bankSwiftCode: settings.bankSwiftCode,

    maintenanceMode: settings.maintenanceMode,
    allowRegistrations: settings.allowRegistrations,
  };
}

export async function getPlatformSettings() {
  const settings = await db.platformSetting.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (settings) {
    return settings;
  }

  return db.platformSetting.create({
    data: DEFAULT_SETTINGS,
  });
}

export async function updatePlatformSettings(data, { userId = null } = {}) {
  const currentSettings = await getPlatformSettings();

  const trialDurationDays = Number(data.trialDurationDays);

  if (
    !Number.isInteger(trialDurationDays) ||
    trialDurationDays < 1 ||
    trialDurationDays > 365
  ) {
    throw new Error(
      "Kohëzgjatja e trial-it duhet të jetë nga 1 deri në 365 ditë.",
    );
  }

  const platformName = String(data.platformName ?? "").trim();

  if (!platformName) {
    throw new Error("Emri i platformës është i detyrueshëm.");
  }

  const defaultCurrency = String(data.defaultCurrency ?? "ALL")
    .trim()
    .toUpperCase();

  if (!defaultCurrency) {
    throw new Error("Monedha e platformës është e detyrueshme.");
  }

  const defaultTimezone = String(
    data.defaultTimezone ?? "Europe/Tirane",
  ).trim();

  if (!defaultTimezone) {
    throw new Error("Zona kohore është e detyrueshme.");
  }

  const updatedSettings = await db.platformSetting.update({
    where: {
      id: currentSettings.id,
    },

    data: {
      platformName,

      supportEmail: normalizeNullableString(data.supportEmail),

      supportPhone: normalizeNullableString(data.supportPhone),

      companyAddress: normalizeNullableString(data.companyAddress),

      defaultCurrency,
      defaultTimezone,

      trialEnabled: Boolean(data.trialEnabled),
      trialDurationDays,

      cashPaymentsEnabled: Boolean(data.cashPaymentsEnabled),

      bankPaymentsEnabled: Boolean(data.bankPaymentsEnabled),

      cardPaymentsEnabled: Boolean(data.cardPaymentsEnabled),

      bankName: normalizeNullableString(data.bankName),

      bankAccountName: normalizeNullableString(data.bankAccountName),

      bankAccountNumber: normalizeNullableString(data.bankAccountNumber),

      bankIban: normalizeNullableString(data.bankIban),

      bankSwiftCode: normalizeNullableString(data.bankSwiftCode),

      maintenanceMode: Boolean(data.maintenanceMode),

      allowRegistrations: Boolean(data.allowRegistrations),
    },
  });

  await createPlatformAuditLog({
    userId,
    action: "UPDATE",
    entityType: "PLATFORM_SETTING",
    entityId: updatedSettings.id,
    title: "Konfigurimet e platformës u përditësuan",
    description: "Platform Admin ndryshoi konfigurimet e platformës AutoFlow.",
    oldValues: getComparableSettings(currentSettings),
    newValues: getComparableSettings(updatedSettings),
  });

  return updatedSettings;
}
