import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const SUBSCRIPTION_BILLING_INTERVALS = ["MONTHLY", "YEARLY"];

export const SUBSCRIPTION_STATUSES = [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
];

function normalizeUppercaseString(value) {
  return normalizeTrimmedString(value).toUpperCase();
}

function normalizeOptionalPrice(value) {
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

const businessIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Zgjidh biznesin.",
  }),
);

const planIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Zgjidh planin.",
  }),
);

const subscriptionIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "ID-ja e abonimit mungon.",
  }),
);

const billingIntervalSchema = z.preprocess(
  normalizeUppercaseString,
  z.enum(SUBSCRIPTION_BILLING_INTERVALS, {
    message: "Periudha e faturimit nuk është e vlefshme.",
  }),
);

const optionalPriceSchema = z.preprocess(
  normalizeOptionalPrice,
  z
    .number({
      message: "Çmimi duhet të jetë numër pozitiv.",
    })
    .refine((value) => Number.isFinite(value), {
      message: "Çmimi duhet të jetë numër pozitiv.",
    })
    .min(0, {
      message: "Çmimi duhet të jetë numër pozitiv.",
    })
    .nullable(),
);

const optionalPeriodStartSchema = z.preprocess(
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
        message: "Data e fillimit nuk është e vlefshme.",
      },
    )
    .nullable(),
);

const subscriptionStatusSchema = z.preprocess(
  normalizeUppercaseString,
  z.enum(SUBSCRIPTION_STATUSES, {
    message: "Statusi i abonimit nuk është i vlefshëm.",
  }),
);

export const createSubscriptionSchema = z.object({
  businessId: businessIdSchema,
  planId: planIdSchema,
  billingInterval: billingIntervalSchema,
  periodStart: optionalPeriodStartSchema,
  price: optionalPriceSchema,
});

export const renewSubscriptionSchema = z.object({
  billingInterval: billingIntervalSchema,
  periodStart: optionalPeriodStartSchema,
  price: optionalPriceSchema,
});

export const subscriptionIdObjectSchema = z.object({
  subscriptionId: subscriptionIdSchema,
});

export const updateSubscriptionStatusSchema = z.object({
  subscriptionId: subscriptionIdSchema,
  status: subscriptionStatusSchema,
});
