import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const SERVICE_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeServiceTotal(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return 0;
  }

  return Number(normalizedValue);
}

function normalizeCreateServiceStatus(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || "PENDING";
}

const serviceIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "ID e shërbimit mungon.",
  }),
);

const vehicleIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Automjeti dhe titulli janë të detyrueshme.",
  }),
);

const serviceTitleSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Automjeti dhe titulli janë të detyrueshme.",
  }),
);

const serviceDescriptionSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const serviceStatusValueSchema = z.enum(SERVICE_STATUSES, {
  message: "Statusi i zgjedhur nuk është i vlefshëm.",
});

const createServiceStatusValueSchema = z.preprocess(
  normalizeCreateServiceStatus,
  serviceStatusValueSchema,
);

const requiredServiceStatusValueSchema = z.preprocess(
  normalizeTrimmedString,
  serviceStatusValueSchema,
);

const serviceTotalSchema = z.preprocess(
  normalizeServiceTotal,
  z
    .number({
      message: "Totali i shërbimit nuk është i vlefshëm.",
    })
    .refine((value) => Number.isFinite(value) && value >= 0, {
      message: "Totali i shërbimit nuk është i vlefshëm.",
    }),
);

export const createServiceSchema = z.object({
  vehicleId: vehicleIdSchema,
  title: serviceTitleSchema,
  description: serviceDescriptionSchema,
  status: createServiceStatusValueSchema,
  total: serviceTotalSchema,
});

export const updateServiceSchema = z.object({
  id: serviceIdSchema,
  vehicleId: vehicleIdSchema,
  title: serviceTitleSchema,
  description: serviceDescriptionSchema,
  status: requiredServiceStatusValueSchema,
  total: serviceTotalSchema,
});

export const changeServiceStatusSchema = z.object({
  serviceId: serviceIdSchema,
  status: requiredServiceStatusValueSchema,
});

export const deleteServiceSchema = z.object({
  serviceId: serviceIdSchema,
});
