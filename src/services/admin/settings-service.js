import { db } from "@/lib/db";

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

export async function updatePlatformSettings(data) {
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

  const defaultTimezone = String(
    data.defaultTimezone ?? "Europe/Tirane",
  ).trim();

  return db.platformSetting.update({
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
}
