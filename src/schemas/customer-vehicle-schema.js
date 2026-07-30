import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

function normalizeOptionalText(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizePlate(value) {
  return normalizeTrimmedString(value).toUpperCase().replace(/\s+/g, "");
}

function normalizeOptionalVin(value) {
  const normalizedValue = normalizeTrimmedString(value)
    .toUpperCase()
    .replace(/\s+/g, "");

  return normalizedValue || null;
}

function normalizeOptionalInteger(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return null;
  }

  return Number(normalizedValue);
}

function normalizeRequiredId(value) {
  return normalizeTrimmedString(value);
}

const requiredIdSchema = (message) =>
  z.preprocess(
    normalizeRequiredId,
    z.string().min(1, {
      message,
    }),
  );

const optionalTextSchema = (maxLength, message) =>
  z.preprocess(
    normalizeOptionalText,
    z.string().max(maxLength, { message }).nullable(),
  );

const optionalIntegerSchema = (fieldLabel) =>
  z.preprocess(
    normalizeOptionalInteger,
    z
      .number({
        message: `${fieldLabel} duhet të jetë numër i plotë.`,
      })
      .int({
        message: `${fieldLabel} duhet të jetë numër i plotë.`,
      })
      .nullable(),
  );

export const customerVehicleIdSchema = requiredIdSchema(
  "ID-ja e automjetit mungon.",
);

export const workshopVehicleIdSchema = requiredIdSchema(
  "ID-ja e automjetit të servisit mungon.",
);

export const vehicleClaimIdSchema = requiredIdSchema(
  "ID-ja e kërkesës mungon.",
);

export const customerVehicleLinkIdSchema = requiredIdSchema(
  "ID-ja e lidhjes mungon.",
);

export const customerVehicleSchema = z.object({
  plate: z.preprocess(
    normalizePlate,
    z
      .string()
      .min(1, {
        message: "Targa është e detyrueshme.",
      })
      .min(3, {
        message: "Targa duhet të ketë nga 3 deri në 20 karaktere.",
      })
      .max(20, {
        message: "Targa duhet të ketë nga 3 deri në 20 karaktere.",
      }),
  ),

  brand: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(1, {
        message: "Marka është e detyrueshme.",
      })
      .max(60, {
        message: "Marka nuk mund të jetë më e gjatë se 60 karaktere.",
      }),
  ),

  model: optionalTextSchema(
    80,
    "Modeli nuk mund të jetë më i gjatë se 80 karaktere.",
  ),

  year: optionalIntegerSchema("Viti").refine(
    (value) => {
      if (value === null) {
        return true;
      }

      const currentYear = new Date().getFullYear();

      return value >= 1900 && value <= currentYear + 1;
    },
    {
      message: `Viti duhet të jetë ndërmjet 1900 dhe ${
        new Date().getFullYear() + 1
      }.`,
    },
  ),

  fuel: optionalTextSchema(50, "Lloji i karburantit është shumë i gjatë."),

  engine: optionalTextSchema(
    50,
    "Motori nuk mund të jetë më i gjatë se 50 karaktere.",
  ),

  transmission: optionalTextSchema(50, "Transmisioni është shumë i gjatë."),

  vin: z.preprocess(
    normalizeOptionalVin,
    z
      .string()
      .max(40, {
        message: "VIN-i nuk mund të jetë më i gjatë se 40 karaktere.",
      })
      .nullable(),
  ),

  mileage: optionalIntegerSchema("Kilometrat").refine(
    (value) => value === null || value >= 0,
    {
      message: "Kilometrat nuk mund të jenë negativë.",
    },
  ),

  color: optionalTextSchema(
    40,
    "Ngjyra nuk mund të jetë më e gjatë se 40 karaktere.",
  ),

  notes: optionalTextSchema(
    1000,
    "Shënimet nuk mund të jenë më të gjata se 1000 karaktere.",
  ),
});

export const customerVehicleSearchSchema = z
  .object({
    plate: z.preprocess(
      normalizePlate,
      z
        .string()
        .max(20, {
          message: "Targa nuk mund të ketë më shumë se 20 karaktere.",
        })
        .nullable()
        .transform((value) => value || null),
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
  })
  .refine((data) => data.plate || data.vin, {
    message: "Vendos targën ose numrin VIN.",
    path: ["plate"],
  });

export const createVehicleClaimSchema = z.object({
  customerVehicleId: customerVehicleIdSchema,
  vehicleId: workshopVehicleIdSchema,

  message: z.preprocess(
    normalizeOptionalText,
    z
      .string()
      .max(1000, {
        message: "Mesazhi nuk mund të ketë më shumë se 1000 karaktere.",
      })
      .nullable(),
  ),
});

export const cancelVehicleClaimSchema = z.object({
  claimId: vehicleClaimIdSchema,
});

export const disconnectVehicleLinkSchema = z.object({
  linkId: customerVehicleLinkIdSchema,
});
