import { z } from "zod";

import { emailFormatRegex, normalizeTrimmedString } from "./common-schema";

export const BUSINESS_CURRENCIES = ["ALL", "EUR", "USD"];

export const BUSINESS_TIMEZONES = [
  "Europe/Tirane",
  "Europe/Rome",
  "Europe/Berlin",
  "Europe/London",
];

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeOptionalEmail(value) {
  const normalizedValue = normalizeTrimmedString(value).toLowerCase();

  return normalizedValue || null;
}

function normalizeOptionalUppercaseString(value) {
  const normalizedValue = normalizeTrimmedString(value).toUpperCase();

  return normalizedValue || null;
}

function normalizeUppercaseString(value) {
  return normalizeTrimmedString(value).toUpperCase();
}

function normalizeVat(value) {
  const normalizedValue = normalizeTrimmedString(value).replace(",", ".");

  if (!normalizedValue) {
    return 20;
  }

  return Number(normalizedValue);
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalPhoneSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .max(30, {
      message: "Numri i telefonit është shumë i gjatë.",
    })
    .nullable(),
);

const optionalEmailSchema = z.preprocess(
  normalizeOptionalEmail,
  z
    .string()
    .max(190, {
      message: "Email-i i biznesit është shumë i gjatë.",
    })
    .refine((value) => emailFormatRegex.test(value), {
      message: "Vendos një email biznesi të vlefshëm.",
    })
    .nullable(),
);

function createOptionalUrlSchema(message) {
  return z.preprocess(
    normalizeOptionalString,
    z
      .string()
      .refine((value) => isValidHttpUrl(value), {
        message,
      })
      .nullable(),
  );
}

export const profileSettingsSchema = z.object({
  name: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(2, {
        message: "Emri duhet të ketë të paktën 2 karaktere.",
      })
      .max(100, {
        message: "Emri nuk mund të ketë më shumë se 100 karaktere.",
      }),
  ),

  phone: optionalPhoneSchema,
});

export const businessSettingsSchema = z.object({
  name: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(2, {
        message: "Emri i biznesit duhet të ketë të paktën 2 karaktere.",
      })
      .max(150, {
        message: "Emri i biznesit është shumë i gjatë.",
      }),
  ),

  nipt: z.preprocess(
    normalizeOptionalUppercaseString,
    z
      .string()
      .max(30, {
        message: "NIPT-i nuk mund të ketë më shumë se 30 karaktere.",
      })
      .nullable(),
  ),

  email: optionalEmailSchema,
  phone: optionalPhoneSchema,

  city: z.preprocess(
    normalizeOptionalString,
    z
      .string()
      .max(100, {
        message: "Qyteti nuk mund të ketë më shumë se 100 karaktere.",
      })
      .nullable(),
  ),

  address: z.preprocess(
    normalizeOptionalString,
    z
      .string()
      .max(250, {
        message: "Adresa nuk mund të ketë më shumë se 250 karaktere.",
      })
      .nullable(),
  ),

  website: createOptionalUrlSchema(
    "Website duhet të fillojë me http:// ose https:// dhe të jetë i vlefshëm.",
  ),

  logo: createOptionalUrlSchema(
    "Linku i logos duhet të fillojë me http:// ose https://.",
  ),

  workingHours: z.preprocess(
    normalizeOptionalString,
    z
      .string()
      .max(500, {
        message: "Orari i punës nuk mund të ketë më shumë se 500 karaktere.",
      })
      .nullable(),
  ),

  currency: z.preprocess(
    normalizeUppercaseString,
    z.enum(BUSINESS_CURRENCIES, {
      message: "Monedha e zgjedhur nuk është e vlefshme.",
    }),
  ),

  vat: z.preprocess(
    normalizeVat,
    z
      .number({
        message: "TVSH-ja duhet të jetë një numër nga 0 deri në 100.",
      })
      .refine((value) => Number.isFinite(value), {
        message: "TVSH-ja duhet të jetë një numër nga 0 deri në 100.",
      })
      .min(0, {
        message: "TVSH-ja duhet të jetë një numër nga 0 deri në 100.",
      })
      .max(100, {
        message: "TVSH-ja duhet të jetë një numër nga 0 deri në 100.",
      }),
  ),

  timezone: z.preprocess(
    normalizeTrimmedString,
    z.enum(BUSINESS_TIMEZONES, {
      message: "Zona kohore e zgjedhur nuk është e vlefshme.",
    }),
  ),
});
