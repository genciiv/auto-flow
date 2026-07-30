import { z } from "zod";

import { emailFormatRegex, normalizeTrimmedString } from "./common-schema";

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeRequiredUppercaseString(value) {
  return normalizeTrimmedString(value).toUpperCase();
}

function normalizeCheckbox(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function normalizeInteger(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return Number.NaN;
  }

  return Number(normalizedValue);
}

const requiredPlatformNameSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .min(1, {
      message: "Emri i platformës është i detyrueshëm.",
    })
    .max(100, {
      message: "Emri i platformës nuk mund të ketë më shumë se 100 karaktere.",
    }),
);

const optionalEmailSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .max(190, {
      message: "Email-i i suportit nuk mund të ketë më shumë se 190 karaktere.",
    })
    .refine((value) => emailFormatRegex.test(value), {
      message: "Email-i i suportit nuk është i vlefshëm.",
    })
    .nullable(),
);

const optionalPhoneSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .max(30, {
      message: "Telefoni i suportit nuk mund të ketë më shumë se 30 karaktere.",
    })
    .nullable(),
);

const optionalAddressSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .max(250, {
      message: "Adresa nuk mund të ketë më shumë se 250 karaktere.",
    })
    .nullable(),
);

const currencySchema = z.preprocess(
  normalizeRequiredUppercaseString,
  z
    .string()
    .min(1, {
      message: "Monedha e platformës është e detyrueshme.",
    })
    .regex(/^[A-Z]{3}$/, {
      message:
        "Monedha duhet të jetë një kod me 3 shkronja, si ALL, EUR ose USD.",
    }),
);

const timezoneSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .min(1, {
      message: "Zona kohore është e detyrueshme.",
    })
    .max(100, {
      message: "Zona kohore nuk është e vlefshme.",
    }),
);

const trialDurationDaysSchema = z.preprocess(
  normalizeInteger,
  z
    .number({
      message: "Kohëzgjatja e trial-it duhet të jetë nga 1 deri në 365 ditë.",
    })
    .int({
      message: "Kohëzgjatja e trial-it duhet të jetë numër i plotë.",
    })
    .min(1, {
      message: "Kohëzgjatja e trial-it duhet të jetë nga 1 deri në 365 ditë.",
    })
    .max(365, {
      message: "Kohëzgjatja e trial-it duhet të jetë nga 1 deri në 365 ditë.",
    }),
);

const optionalBankFieldSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .max(190, {
      message: "Të dhënat bankare janë shumë të gjata.",
    })
    .nullable(),
);

const optionalIbanSchema = z.preprocess(
  (value) => {
    const normalizedValue = normalizeTrimmedString(value)
      .replace(/\s+/g, "")
      .toUpperCase();

    return normalizedValue || null;
  },
  z
    .string()
    .max(34, {
      message: "IBAN-i nuk mund të ketë më shumë se 34 karaktere.",
    })
    .nullable(),
);

const optionalSwiftCodeSchema = z.preprocess(
  (value) => {
    const normalizedValue = normalizeTrimmedString(value)
      .replace(/\s+/g, "")
      .toUpperCase();

    return normalizedValue || null;
  },
  z
    .string()
    .max(11, {
      message: "Kodi SWIFT nuk mund të ketë më shumë se 11 karaktere.",
    })
    .nullable(),
);

export const platformSettingsSchema = z.object({
  platformName: requiredPlatformNameSchema,

  supportEmail: optionalEmailSchema,
  supportPhone: optionalPhoneSchema,
  companyAddress: optionalAddressSchema,

  defaultCurrency: currencySchema,
  defaultTimezone: timezoneSchema,

  trialEnabled: z.preprocess(normalizeCheckbox, z.boolean()),

  trialDurationDays: trialDurationDaysSchema,

  cashPaymentsEnabled: z.preprocess(normalizeCheckbox, z.boolean()),

  bankPaymentsEnabled: z.preprocess(normalizeCheckbox, z.boolean()),

  cardPaymentsEnabled: z.preprocess(normalizeCheckbox, z.boolean()),

  bankName: optionalBankFieldSchema,
  bankAccountName: optionalBankFieldSchema,
  bankAccountNumber: optionalBankFieldSchema,
  bankIban: optionalIbanSchema,
  bankSwiftCode: optionalSwiftCodeSchema,

  maintenanceMode: z.preprocess(normalizeCheckbox, z.boolean()),

  allowRegistrations: z.preprocess(normalizeCheckbox, z.boolean()),
});
