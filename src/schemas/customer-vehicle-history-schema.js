import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const CUSTOMER_VEHICLE_EXPENSE_TYPES = [
  "FUEL",
  "INSURANCE",
  "TAX",
  "TIRES",
  "PARKING",
  "WASH",
  "REPAIR",
  "PARTS",
  "TOLL",
  "OTHER",
];

function normalizeOptionalText(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeInteger(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return null;
  }

  return Number(normalizedValue);
}

function normalizeDateOnly(value) {
  return normalizeTrimmedString(value);
}

function normalizeMoney(value) {
  return normalizeTrimmedString(value).replace(",", ".");
}

const vehicleIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Automjeti nuk u identifikua.",
  }),
);

const mileageSchema = z.preprocess(
  normalizeInteger,
  z
    .number({
      message: "Kilometrazhi duhet të jetë numër i plotë.",
    })
    .int({
      message: "Kilometrazhi duhet të jetë numër i plotë.",
    })
    .min(0, {
      message: "Kilometrazhi nuk mund të jetë negativ.",
    })
    .max(5_000_000, {
      message: "Kilometrazhi duket më i lartë se kufiri i lejuar.",
    }),
);

const optionalMileageSchema = z.preprocess(
  normalizeInteger,
  z
    .number({
      message: "Kilometrazhi duhet të jetë numër i plotë.",
    })
    .int({
      message: "Kilometrazhi duhet të jetë numër i plotë.",
    })
    .min(0, {
      message: "Kilometrazhi nuk mund të jetë negativ.",
    })
    .max(5_000_000, {
      message: "Kilometrazhi duket më i lartë se kufiri i lejuar.",
    })
    .nullable(),
);

const dateOnlySchema = z.preprocess(
  normalizeDateOnly,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Data nuk është e vlefshme.",
    })
    .refine(
      (value) => {
        const parsed = new Date(`${value}T12:00:00.000Z`);

        return (
          !Number.isNaN(parsed.getTime()) &&
          parsed.toISOString().slice(0, 10) === value
        );
      },
      {
        message: "Data nuk është e vlefshme.",
      },
    )
    .refine(
      (value) => {
        const today = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Tirane",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

        return value <= today;
      },
      {
        message: "Data nuk mund të jetë në të ardhmen.",
      },
    ),
);

const notesSchema = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .max(1000, {
      message: "Shënimet nuk mund të jenë më të gjata se 1000 karaktere.",
    })
    .nullable(),
);

const amountSchema = z.preprocess(
  normalizeMoney,
  z
    .string()
    .min(1, {
      message: "Shuma është e detyrueshme.",
    })
    .regex(/^\d+(?:\.\d{1,2})?$/, {
      message: "Shuma duhet të ketë maksimumi dy shifra dhjetore.",
    })
    .refine((value) => Number(value) > 0, {
      message: "Shuma duhet të jetë më e madhe se zero.",
    })
    .refine((value) => Number(value) <= 100_000_000, {
      message: "Shuma është mbi kufirin e lejuar.",
    }),
);

export const addCustomerVehicleMileageSchema = z.object({
  vehicleId: vehicleIdSchema,
  mileage: mileageSchema,
  recordedAt: dateOnlySchema,
  notes: notesSchema,
});

export const createCustomerVehicleExpenseSchema = z.object({
  vehicleId: vehicleIdSchema,
  type: z.preprocess(
    (value) => normalizeTrimmedString(value).toUpperCase(),
    z.enum(CUSTOMER_VEHICLE_EXPENSE_TYPES, {
      message: "Kategoria e shpenzimit nuk është e vlefshme.",
    }),
  ),
  amount: amountSchema,
  occurredAt: dateOnlySchema,
  mileage: optionalMileageSchema,
  notes: notesSchema,
});

export const deleteCustomerVehicleExpenseSchema = z.object({
  vehicleId: vehicleIdSchema,
  expenseId: z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, {
      message: "Shpenzimi nuk u identifikua.",
    }),
  ),
});

export function parseCustomerHistoryDate(value) {
  return new Date(`${value}T12:00:00.000Z`);
}
