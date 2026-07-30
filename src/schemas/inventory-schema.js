import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeOptionalUppercaseString(value) {
  const normalizedValue = normalizeTrimmedString(value).toUpperCase();

  return normalizedValue || null;
}

function normalizeNonNegativeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(value);
}

function normalizePositiveInteger(value) {
  if (value === null || value === undefined || value === "") {
    return 1;
  }

  return Number(value);
}

function createNonNegativeNumberSchema(message) {
  return z.preprocess(
    normalizeNonNegativeNumber,
    z
      .number({
        message,
      })
      .refine((value) => Number.isFinite(value) && value >= 0, {
        message,
      }),
  );
}

const partIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "ID e pjesës mungon.",
  }),
);

const requiredPartNameSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Emri i pjesës është i detyrueshëm.",
  }),
);

const optionalPartCodeSchema = z.preprocess(
  normalizeOptionalUppercaseString,
  z.string().nullable(),
);

const optionalPartStringSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const stockSchema = createNonNegativeNumberSchema(
  "Stoku duhet të jetë numër pozitiv.",
);

const minStockSchema = createNonNegativeNumberSchema(
  "Minimumi i stokut duhet të jetë numër pozitiv.",
);

const buyPriceSchema = createNonNegativeNumberSchema(
  "Çmimi i blerjes duhet të jetë numër pozitiv.",
);

const sellPriceSchema = createNonNegativeNumberSchema(
  "Çmimi i shitjes duhet të jetë numër pozitiv.",
);

const partFields = {
  code: optionalPartCodeSchema,
  name: requiredPartNameSchema,
  category: optionalPartStringSchema,
  supplier: optionalPartStringSchema,
  stock: stockSchema,
  minStock: minStockSchema,
  buyPrice: buyPriceSchema,
  sellPrice: sellPriceSchema,
};

export const createPartSchema = z.object({
  ...partFields,
});

export const updatePartSchema = z.object({
  id: partIdSchema,
  ...partFields,
});

export const deletePartSchema = z.object({
  partId: partIdSchema,
});

const requiredServicePartValueSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Shërbimi, pjesa dhe sasia janë të detyrueshme.",
  }),
);

const servicePartQuantitySchema = z.preprocess(
  normalizePositiveInteger,
  z
    .number({
      message: "Sasia duhet të jetë numër i plotë më i madh se zero.",
    })
    .int({
      message: "Sasia duhet të jetë numër i plotë më i madh se zero.",
    })
    .min(1, {
      message: "Sasia duhet të jetë numër i plotë më i madh se zero.",
    }),
);

export const addPartToServiceSchema = z.object({
  serviceId: requiredServicePartValueSchema,
  partId: requiredServicePartValueSchema,
  quantity: servicePartQuantitySchema,
});
