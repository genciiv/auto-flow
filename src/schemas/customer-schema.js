import { z } from "zod";

import { emailFormatRegex } from "./common-schema";

/**
 * Normalizon një fushë opsionale:
 * - heq hapësirat anësore;
 * - vlerën bosh e konverton në null.
 *
 * Kjo ruan sjelljen aktuale të customer actions.
 */
function normalizeOptionalCustomerValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

/**
 * Normalizon një fushë të detyrueshme.
 */
function normalizeRequiredCustomerValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

const customerNameSchema = z.preprocess(
  normalizeRequiredCustomerValue,
  z.string().min(1, {
    message: "Emri është i detyrueshëm.",
  }),
);

const optionalCustomerStringSchema = z.preprocess(
  normalizeOptionalCustomerValue,
  z.string().nullable(),
);

const optionalCustomerEmailSchema = z.preprocess(
  normalizeOptionalCustomerValue,
  z
    .string()
    .refine((value) => emailFormatRegex.test(value), {
      message: "Adresa e email-it nuk është e vlefshme.",
    })
    .nullable(),
);

const customerIdSchema = z.preprocess(
  normalizeRequiredCustomerValue,
  z.string().min(1, {
    message: "ID e klientit mungon.",
  }),
);

export const createCustomerSchema = z.object({
  name: customerNameSchema,
  phone: optionalCustomerStringSchema,
  email: optionalCustomerEmailSchema,
  city: optionalCustomerStringSchema,
});

export const updateCustomerSchema = z.object({
  id: customerIdSchema,
  name: customerNameSchema,
  phone: optionalCustomerStringSchema,
  email: optionalCustomerEmailSchema,
  city: optionalCustomerStringSchema,
});

export const deleteCustomerSchema = z.object({
  customerId: customerIdSchema,
});
