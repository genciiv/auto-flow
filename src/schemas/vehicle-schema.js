import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeUppercaseString(value) {
  return normalizeTrimmedString(value).toUpperCase();
}

function normalizeOptionalUppercaseString(value) {
  const normalizedValue = normalizeUppercaseString(value);

  return normalizedValue || null;
}

function normalizeOptionalYear(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return null;
  }

  return Number(normalizedValue);
}

const vehicleIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "ID e automjetit mungon.",
  }),
);

const optionalCustomerIdSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const plateSchema = z.preprocess(
  normalizeUppercaseString,
  z.string().min(1, {
    message: "Targa dhe marka janë të detyrueshme.",
  }),
);

const brandSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Targa dhe marka janë të detyrueshme.",
  }),
);

const modelSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const yearSchema = z.preprocess(
  normalizeOptionalYear,
  z
    .number({
      message: "Viti i automjetit nuk është i vlefshëm.",
    })
    .int({
      message: "Viti i automjetit nuk është i vlefshëm.",
    })
    .min(1900, {
      message: "Viti i automjetit nuk është i vlefshëm.",
    })
    .max(2100, {
      message: "Viti i automjetit nuk është i vlefshëm.",
    })
    .nullable(),
);

const vinSchema = z.preprocess(
  normalizeOptionalUppercaseString,
  z.string().nullable(),
);

export const createVehicleSchema = z.object({
  customerId: optionalCustomerIdSchema,
  plate: plateSchema,
  brand: brandSchema,
  model: modelSchema,
  year: yearSchema,
  vin: vinSchema,
});

export const updateVehicleSchema = z.object({
  id: vehicleIdSchema,
  customerId: optionalCustomerIdSchema,
  plate: plateSchema,
  brand: brandSchema,
  model: modelSchema,
  year: yearSchema,
  vin: vinSchema,
});

export const deleteVehicleSchema = z.object({
  vehicleId: vehicleIdSchema,
});
