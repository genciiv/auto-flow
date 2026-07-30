import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeStatus(value, fallback = "") {
  const normalizedValue = normalizeTrimmedString(value);

  return (normalizedValue || fallback).toUpperCase();
}

function normalizeCreateStatus(value) {
  return normalizeStatus(value, "PENDING");
}

function normalizeAppointmentDate(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return null;
  }

  return new Date(normalizedValue);
}

const appointmentIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Termini nuk u identifikua.",
  }),
);

const createAppointmentTitleSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Titulli i terminit është i detyrueshëm.",
  }),
);

const updateAppointmentTitleSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Titulli është i detyrueshëm.",
  }),
);

const optionalRelationIdSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const optionalDescriptionSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const appointmentDateSchema = z.preprocess(
  normalizeAppointmentDate,
  z
    .date({
      message: "Data e terminit nuk është e vlefshme.",
    })
    .refine((value) => !Number.isNaN(value.getTime()), {
      message: "Data e terminit nuk është e vlefshme.",
    }),
);

const requiredAppointmentDateSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Data dhe ora janë të detyrueshme.",
  }),
);

const appointmentStatusValueSchema = z.enum(APPOINTMENT_STATUSES, {
  message: "Statusi nuk është i vlefshëm.",
});

const createAppointmentStatusSchema = z.preprocess(
  normalizeCreateStatus,
  appointmentStatusValueSchema,
);

const requiredAppointmentStatusSchema = z.preprocess(
  (value) => normalizeStatus(value),
  appointmentStatusValueSchema,
);

const appointmentBaseSchema = {
  description: optionalDescriptionSchema,
  customerId: optionalRelationIdSchema,
  vehicleId: optionalRelationIdSchema,
};

export const createAppointmentSchema = z
  .object({
    title: createAppointmentTitleSchema,
    ...appointmentBaseSchema,

    date: requiredAppointmentDateSchema,

    status: createAppointmentStatusSchema,
  })
  .transform((data, context) => {
    const parsedDate = appointmentDateSchema.safeParse(data.date);

    if (!parsedDate.success) {
      context.addIssue({
        code: "custom",
        path: ["date"],
        message:
          parsedDate.error.issues[0]?.message ||
          "Data e terminit nuk është e vlefshme.",
      });

      return z.NEVER;
    }

    return {
      ...data,
      date: parsedDate.data,
    };
  });

export const updateAppointmentSchema = z
  .object({
    appointmentId: appointmentIdSchema,
    title: updateAppointmentTitleSchema,
    ...appointmentBaseSchema,

    date: requiredAppointmentDateSchema,

    status: requiredAppointmentStatusSchema,
  })
  .transform((data, context) => {
    const parsedDate = appointmentDateSchema.safeParse(data.date);

    if (!parsedDate.success) {
      context.addIssue({
        code: "custom",
        path: ["date"],
        message:
          parsedDate.error.issues[0]?.message ||
          "Data e terminit nuk është e vlefshme.",
      });

      return z.NEVER;
    }

    return {
      ...data,
      date: parsedDate.data,
    };
  });

export const deleteAppointmentSchema = z.object({
  appointmentId: appointmentIdSchema,
});

export const changeAppointmentStatusSchema = z.object({
  appointmentId: appointmentIdSchema,
  status: requiredAppointmentStatusSchema,
});

export const startAppointmentServiceSchema = z.object({
  appointmentId: appointmentIdSchema,
});
