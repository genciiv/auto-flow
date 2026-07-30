import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export const CREATE_PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"];

export const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CARD", "OTHER"];

function normalizeUppercaseString(value) {
  return normalizeTrimmedString(value).toUpperCase();
}

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeOptionalAmount(value) {
  const normalizedValue = normalizeTrimmedString(value).replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  return Number(normalizedValue);
}

function normalizeOptionalDate(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

const subscriptionIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Zgjidh abonimin.",
  }),
);

const paymentIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "ID-ja e pagesës mungon.",
  }),
);

const createPaymentStatusSchema = z.preprocess(
  normalizeUppercaseString,
  z.enum(CREATE_PAYMENT_STATUSES, {
    message: "Statusi i pagesës nuk është i vlefshëm.",
  }),
);

const paymentStatusSchema = z.preprocess(
  normalizeUppercaseString,
  z.enum(PAYMENT_STATUSES, {
    message: "Statusi i pagesës nuk është i vlefshëm.",
  }),
);

const paymentMethodSchema = z.preprocess(
  normalizeUppercaseString,
  z.enum(PAYMENT_METHODS, {
    message: "Metoda e pagesës nuk është e vlefshme.",
  }),
);

const optionalAmountSchema = z.preprocess(
  normalizeOptionalAmount,
  z
    .number({
      message: "Shuma duhet të jetë më e madhe se zero.",
    })
    .refine((value) => Number.isFinite(value), {
      message: "Shuma duhet të jetë më e madhe se zero.",
    })
    .gt(0, {
      message: "Shuma duhet të jetë më e madhe se zero.",
    })
    .nullable(),
);

const optionalPaidAtSchema = z.preprocess(
  normalizeOptionalDate,
  z
    .string()
    .refine(
      (value) => {
        if (value === null) {
          return true;
        }

        const date = new Date(`${value}T00:00:00`);

        return !Number.isNaN(date.getTime());
      },
      {
        message: "Data e pagesës nuk është e vlefshme.",
      },
    )
    .nullable(),
);

const optionalReferenceSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const optionalDescriptionSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

export const createPaymentSchema = z
  .object({
    subscriptionId: subscriptionIdSchema,
    amount: optionalAmountSchema,
    status: createPaymentStatusSchema,
    method: paymentMethodSchema,
    reference: optionalReferenceSchema,
    description: optionalDescriptionSchema,
    paidAt: optionalPaidAtSchema,
  })
  .superRefine((data, context) => {
    if (data.method === "BANK_TRANSFER" && !data.reference) {
      context.addIssue({
        code: "custom",
        path: ["reference"],
        message: "Vendos referencën e transfertës bankare.",
      });
    }
  });

export const updatePaymentStatusSchema = z.object({
  paymentId: paymentIdSchema,
  status: paymentStatusSchema,
});

export const paymentIdObjectSchema = z.object({
  paymentId: paymentIdSchema,
});
