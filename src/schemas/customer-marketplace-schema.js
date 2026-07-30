import { z } from "zod";

import { emailFormatRegex, normalizeTrimmedString } from "./common-schema";

export const CUSTOMER_MARKETPLACE_TYPES = [
  "VEHICLE",
  "MOTORCYCLE",
  "PART",
  "ACCESSORY",
  "SERVICE",
  "OTHER",
];

export const CUSTOMER_MARKETPLACE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "SOLD",
  "ARCHIVED",
];

function normalizeOptionalText(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeOptionalEmail(value) {
  const normalizedValue = normalizeTrimmedString(value).toLowerCase();

  return normalizedValue || null;
}

function normalizeOptionalVin(value) {
  const normalizedValue = normalizeTrimmedString(value)
    .toUpperCase()
    .replace(/\s+/g, "");

  return normalizedValue || null;
}

function normalizeBoolean(value) {
  if (value === true || value === "true" || value === "on" || value === "1") {
    return true;
  }

  return false;
}

function normalizeRequiredNumber(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return Number.NaN;
  }

  return Number(normalizedValue.replace(",", "."));
}

function normalizeOptionalInteger(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return null;
  }

  return Number(normalizedValue);
}

const requiredIdSchema = (message) =>
  z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(1, {
        message,
      })
      .max(191, {
        message: "ID-ja nuk është e vlefshme.",
      }),
  );

const optionalTextSchema = (maximumLength, message) =>
  z.preprocess(
    normalizeOptionalText,
    z
      .string()
      .max(maximumLength, {
        message,
      })
      .nullable(),
  );

const optionalIntegerSchema = (fieldName) =>
  z.preprocess(
    normalizeOptionalInteger,
    z
      .number({
        message: `${fieldName} duhet të jetë numër i plotë.`,
      })
      .int({
        message: `${fieldName} duhet të jetë numër i plotë.`,
      })
      .nullable(),
  );

export const customerMarketplaceListingIdSchema = requiredIdSchema(
  "ID-ja e publikimit mungon.",
);

export const customerMarketplaceListingSchema = z.object({
  type: z.preprocess(
    normalizeTrimmedString,
    z.enum(CUSTOMER_MARKETPLACE_TYPES, {
      message: "Lloji i publikimit nuk është i vlefshëm.",
    }),
  ),

  title: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(3, {
        message: "Titulli duhet të ketë të paktën 3 karaktere.",
      })
      .max(150, {
        message: "Titulli nuk mund të ketë më shumë se 150 karaktere.",
      }),
  ),

  description: optionalTextSchema(
    5000,
    "Përshkrimi nuk mund të ketë më shumë se 5000 karaktere.",
  ),

  price: z.preprocess(
    normalizeRequiredNumber,
    z
      .number({
        message: "Vendos një çmim të vlefshëm.",
      })
      .finite({
        message: "Vendos një çmim të vlefshëm.",
      })
      .min(0, {
        message: "Çmimi nuk mund të jetë negativ.",
      })
      .max(999999999999, {
        message: "Çmimi është shumë i lartë.",
      }),
  ),

  isNegotiable: z.preprocess(normalizeBoolean, z.boolean()),

  category: optionalTextSchema(
    100,
    "Kategoria nuk mund të ketë më shumë se 100 karaktere.",
  ),

  condition: optionalTextSchema(
    60,
    "Gjendja nuk mund të ketë më shumë se 60 karaktere.",
  ),

  city: optionalTextSchema(
    100,
    "Qyteti nuk mund të ketë më shumë se 100 karaktere.",
  ),

  address: optionalTextSchema(
    250,
    "Adresa nuk mund të ketë më shumë se 250 karaktere.",
  ),

  phone: optionalTextSchema(30, "Numri i telefonit është shumë i gjatë."),

  email: z.preprocess(
    normalizeOptionalEmail,
    z
      .string()
      .max(190, {
        message: "Email-i është shumë i gjatë.",
      })
      .refine((value) => emailFormatRegex.test(value), {
        message: "Vendos një adresë email-i të vlefshme.",
      })
      .nullable(),
  ),

  brand: optionalTextSchema(
    80,
    "Marka nuk mund të ketë më shumë se 80 karaktere.",
  ),

  model: optionalTextSchema(
    100,
    "Modeli nuk mund të ketë më shumë se 100 karaktere.",
  ),

  productionYear: optionalIntegerSchema("Viti i prodhimit").refine(
    (value) => {
      if (value === null) {
        return true;
      }

      const maximumYear = new Date().getFullYear() + 1;

      return value >= 1900 && value <= maximumYear;
    },
    {
      message: `Viti i prodhimit duhet të jetë ndërmjet 1900 dhe ${
        new Date().getFullYear() + 1
      }.`,
    },
  ),

  mileage: optionalIntegerSchema("Kilometrat").refine(
    (value) => value === null || value >= 0,
    {
      message: "Kilometrat nuk mund të jenë negativë.",
    },
  ),

  fuelType: optionalTextSchema(60, "Lloji i karburantit është shumë i gjatë."),

  transmission: optionalTextSchema(60, "Transmisioni është shumë i gjatë."),

  engine: optionalTextSchema(
    60,
    "Motori nuk mund të ketë më shumë se 60 karaktere.",
  ),

  color: optionalTextSchema(
    50,
    "Ngjyra nuk mund të ketë më shumë se 50 karaktere.",
  ),

  vin: z.preprocess(
    normalizeOptionalVin,
    z
      .string()
      .max(40, {
        message: "VIN-i nuk mund të ketë më shumë se 40 karaktere.",
      })
      .nullable(),
  ),

  stock: optionalIntegerSchema("Stoku").refine(
    (value) => value === null || value >= 0,
    {
      message: "Stoku nuk mund të jetë negativ.",
    },
  ),
});

export const createCustomerMarketplaceListingSchema =
  customerMarketplaceListingSchema.extend({
    status: z.preprocess(
      normalizeTrimmedString,
      z.enum(["DRAFT", "PUBLISHED"], {
        message: "Statusi fillestar nuk është i vlefshëm.",
      }),
    ),
  });

export const updateCustomerMarketplaceListingSchema =
  customerMarketplaceListingSchema.extend({
    listingId: customerMarketplaceListingIdSchema,

    status: z.preprocess(
      normalizeTrimmedString,
      z.enum(CUSTOMER_MARKETPLACE_STATUSES, {
        message: "Statusi nuk është i vlefshëm.",
      }),
    ),

    deleteImageIds: z
      .array(
        z
          .string()
          .trim()
          .min(1, {
            message: "ID-ja e fotografisë nuk është e vlefshme.",
          })
          .max(191, {
            message: "ID-ja e fotografisë nuk është e vlefshme.",
          }),
      )
      .default([]),
  });

export const changeCustomerMarketplaceStatusSchema = z.object({
  listingId: customerMarketplaceListingIdSchema,

  status: z.preprocess(
    normalizeTrimmedString,
    z.enum(CUSTOMER_MARKETPLACE_STATUSES, {
      message: "Statusi nuk është i vlefshëm.",
    }),
  ),
});

export const deleteCustomerMarketplaceListingSchema = z.object({
  listingId: customerMarketplaceListingIdSchema,
});
