import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const INVOICE_STATUSES = ["DRAFT", "UNPAID", "PAID", "OVERDUE"];

function normalizeOptionalId(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeOptionalString(value) {
  return normalizeTrimmedString(value);
}

/**
 * Kjo ruan sjelljen aktuale të formave:
 * - status bosh => DRAFT
 * - status i panjohur => DRAFT
 */
function normalizeInvoiceFormStatus(value) {
  const normalizedStatus = normalizeTrimmedString(value).toUpperCase();

  if (!INVOICE_STATUSES.includes(normalizedStatus)) {
    return "DRAFT";
  }

  return normalizedStatus;
}

function normalizeRequiredInvoiceStatus(value) {
  return normalizeTrimmedString(value).toUpperCase();
}

const optionalRelationIdSchema = z.preprocess(
  normalizeOptionalId,
  z.string().nullable(),
);

const optionalInvoiceNumberSchema = z.preprocess(
  normalizeOptionalString,
  z.string(),
);

const requiredInvoiceNumberSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Numri i faturës është i detyrueshëm.",
  }),
);

const invoiceFormStatusSchema = z.preprocess(
  normalizeInvoiceFormStatus,
  z.enum(INVOICE_STATUSES),
);

const requiredInvoiceStatusSchema = z.preprocess(
  normalizeRequiredInvoiceStatus,
  z.enum(INVOICE_STATUSES, {
    message: "Statusi i zgjedhur nuk është i vlefshëm.",
  }),
);

const directInvoiceIdSchema = z.string().min(1, {
  message: "ID-ja e faturës mungon.",
});

const invoiceTotalInputSchema = z.preprocess(
  normalizeOptionalString,
  z.string(),
);

function addInvoiceTotalValidation(schema) {
  return schema
    .superRefine((data, context) => {
      if (data.serviceId) {
        return;
      }

      if (!data.total) {
        context.addIssue({
          code: "custom",
          path: ["total"],
          message: "Totali i faturës është i detyrueshëm.",
        });

        return;
      }

      const numericTotal = Number(data.total);

      if (!Number.isFinite(numericTotal)) {
        context.addIssue({
          code: "custom",
          path: ["total"],
          message: "Totali i faturës nuk është i vlefshëm.",
        });

        return;
      }

      if (numericTotal < 0) {
        context.addIssue({
          code: "custom",
          path: ["total"],
          message: "Totali i faturës nuk mund të jetë negativ.",
        });
      }
    })
    .transform((data) => {
      return {
        ...data,

        /**
         * Kur ka serviceId, totali merret nga servisi.
         * Për faturë manuale, totali del si number.
         */
        total: data.serviceId ? null : Number(data.total),
      };
    });
}

const invoiceRelations = {
  customerId: optionalRelationIdSchema,
  vehicleId: optionalRelationIdSchema,
  serviceId: optionalRelationIdSchema,
};

export const createInvoiceSchema = addInvoiceTotalValidation(
  z.object({
    ...invoiceRelations,
    number: optionalInvoiceNumberSchema,
    total: invoiceTotalInputSchema,
    status: invoiceFormStatusSchema,
  }),
);

export const updateInvoiceSchema = addInvoiceTotalValidation(
  z.object({
    ...invoiceRelations,
    number: requiredInvoiceNumberSchema,
    total: invoiceTotalInputSchema,
    status: invoiceFormStatusSchema,
  }),
);

export const updateInvoiceStatusSchema = z.object({
  invoiceId: directInvoiceIdSchema,
  status: requiredInvoiceStatusSchema,
});

export const deleteInvoiceSchema = z.object({
  invoiceId: directInvoiceIdSchema,
});
