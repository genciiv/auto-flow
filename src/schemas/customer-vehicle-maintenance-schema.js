import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const CUSTOMER_VEHICLE_MAINTENANCE_TYPES = [
  "ENGINE_OIL",
  "OIL_FILTER",
  "AIR_FILTER",
  "CABIN_FILTER",
  "FUEL_FILTER",
  "BRAKE_FLUID",
  "COOLANT",
  "TIMING_BELT",
  "GEARBOX_OIL",
  "BRAKES",
  "BATTERY",
  "TIRES",
  "SPARK_PLUGS",
  "OTHER",
];

export const CUSTOMER_VEHICLE_REMINDER_TYPES = [
  "INSURANCE",
  "TECHNICAL_INSPECTION",
  "ROAD_TAX",
  "CUSTOM",
];

function normalizeOptionalText(value) {
  const normalized = normalizeTrimmedString(value);
  return normalized || null;
}

function normalizeInteger(value) {
  const normalized = normalizeTrimmedString(value);
  return normalized ? Number(normalized) : null;
}

function validDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function todayDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Tirane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const vehicleIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, { message: "Automjeti nuk u identifikua." }),
);

const itemIdSchema = (message) =>
  z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, { message }),
  );

const optionalMileageSchema = z.preprocess(
  normalizeInteger,
  z
    .number({ message: "Kilometrazhi duhet të jetë numër i plotë." })
    .int({ message: "Kilometrazhi duhet të jetë numër i plotë." })
    .min(0, { message: "Kilometrazhi nuk mund të jetë negativ." })
    .max(5_000_000, { message: "Kilometrazhi është mbi kufirin e lejuar." })
    .nullable(),
);

const optionalIntervalKmSchema = z.preprocess(
  normalizeInteger,
  z
    .number({ message: "Intervali duhet të jetë numër i plotë." })
    .int({ message: "Intervali duhet të jetë numër i plotë." })
    .min(100, { message: "Intervali minimal është 100 km." })
    .max(200_000, { message: "Intervali është mbi kufirin e lejuar." })
    .nullable(),
);

const optionalIntervalMonthsSchema = z.preprocess(
  normalizeInteger,
  z
    .number({ message: "Intervali në muaj duhet të jetë numër i plotë." })
    .int({ message: "Intervali në muaj duhet të jetë numër i plotë." })
    .min(1, { message: "Intervali minimal është 1 muaj." })
    .max(120, { message: "Intervali maksimal është 120 muaj." })
    .nullable(),
);

const performedDateSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .refine(validDateOnly, { message: "Data nuk është e vlefshme." })
    .refine((value) => value <= todayDateKey(), {
      message: "Data e mirëmbajtjes nuk mund të jetë në të ardhmen.",
    }),
);

const reminderDateSchema = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .refine(validDateOnly, { message: "Data nuk është e vlefshme." })
    .nullable(),
);

const notesSchema = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .max(1000, { message: "Shënimet nuk mund të kalojnë 1000 karaktere." })
    .nullable(),
);

const optionalTitleSchema = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .max(120, { message: "Titulli nuk mund të kalojë 120 karaktere." })
    .nullable(),
);

export const createCustomerVehicleMaintenanceSchema = z
  .object({
    vehicleId: vehicleIdSchema,
    type: z.preprocess(
      (value) => normalizeTrimmedString(value).toUpperCase(),
      z.enum(CUSTOMER_VEHICLE_MAINTENANCE_TYPES, {
        message: "Lloji i mirëmbajtjes nuk është i vlefshëm.",
      }),
    ),
    performedAt: performedDateSchema,
    mileage: optionalMileageSchema,
    intervalKm: optionalIntervalKmSchema,
    intervalMonths: optionalIntervalMonthsSchema,
    notes: notesSchema,
  })
  .superRefine((data, context) => {
    if (data.intervalKm !== null && data.mileage === null) {
      context.addIssue({
        code: "custom",
        path: ["mileage"],
        message: "Vendos kilometrat kur përdor interval kilometrik.",
      });
    }
  });

export const createCustomerVehicleReminderSchema = z
  .object({
    vehicleId: vehicleIdSchema,
    type: z.preprocess(
      (value) => normalizeTrimmedString(value).toUpperCase(),
      z.enum(CUSTOMER_VEHICLE_REMINDER_TYPES, {
        message: "Lloji i kujtesës nuk është i vlefshëm.",
      }),
    ),
    title: optionalTitleSchema,
    dueDate: reminderDateSchema,
    dueMileage: optionalMileageSchema,
    notes: notesSchema,
  })
  .superRefine((data, context) => {
    if (!data.dueDate && data.dueMileage === null) {
      context.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Vendos një datë ose një kilometrazh për kujtesën.",
      });
    }

    if (data.type === "CUSTOM" && !data.title) {
      context.addIssue({
        code: "custom",
        path: ["title"],
        message: "Vendos titullin e kujtesës.",
      });
    }
  });

export const deleteCustomerVehicleMaintenanceSchema = z.object({
  vehicleId: vehicleIdSchema,
  maintenanceId: itemIdSchema("Mirëmbajtja nuk u identifikua."),
});

export const deleteCustomerVehicleReminderSchema = z.object({
  vehicleId: vehicleIdSchema,
  reminderId: itemIdSchema("Kujtesa nuk u identifikua."),
});

export function parseCustomerVehicleMaintenanceDate(value) {
  return new Date(`${value}T12:00:00.000Z`);
}
