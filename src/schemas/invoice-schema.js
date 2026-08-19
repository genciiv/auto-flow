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

function normalizeBoolean(value) {
  if (value === true || value === false) {
    return value;
  }

  if (value === "true" || value === "1" || value === "on") {
    return true;
  }

  if (value === "false" || value === "0" || value === "off") {
    return false;
  }

  return value;
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

const invoiceSubtotalInputSchema = z.preprocess(
  normalizeOptionalString,
  z.string(),
);

const invoiceDiscountInputSchema = z.preprocess(
  (value) => normalizeOptionalString(value) || "0",
  z.string(),
);

const invoiceVatEnabledSchema = z.preprocess(
  (value) => value === undefined || value === null || value === "" ? false : normalizeBoolean(value),
  z.boolean({ message: "Zgjedhja e TVSH-së nuk është e vlefshme." }),
);

function addInvoiceTotalValidation(schema) {
  return schema
    .superRefine((data, context) => {
      const rawSubtotal = data.subtotal || data.total;
      const numericDiscount = Number(data.discountAmount);

      if (!Number.isFinite(numericDiscount)) {
        context.addIssue({
          code: "custom",
          path: ["discountAmount"],
          message: "Zbritja nuk është e vlefshme.",
        });
      } else if (numericDiscount < 0) {
        context.addIssue({
          code: "custom",
          path: ["discountAmount"],
          message: "Zbritja nuk mund të jetë negative.",
        });
      }

      if (data.serviceId) {
        return;
      }

      if (!rawSubtotal) {
        context.addIssue({
          code: "custom",
          path: ["subtotal"],
          message: "Subtotali i faturës është i detyrueshëm.",
        });
        return;
      }

      const numericSubtotal = Number(rawSubtotal);

      if (!Number.isFinite(numericSubtotal)) {
        context.addIssue({
          code: "custom",
          path: ["subtotal"],
          message: "Subtotali i faturës nuk është i vlefshëm.",
        });
        return;
      }

      if (numericSubtotal < 0) {
        context.addIssue({
          code: "custom",
          path: ["subtotal"],
          message: "Subtotali i faturës nuk mund të jetë negativ.",
        });
      }

      if (Number.isFinite(numericDiscount) && numericDiscount > numericSubtotal) {
        context.addIssue({
          code: "custom",
          path: ["discountAmount"],
          message: "Zbritja nuk mund të jetë më e madhe se subtotali.",
        });
      }
    })
    .transform((data) => {
      const rawSubtotal = data.subtotal || data.total;

      return {
        ...data,
        subtotal: data.serviceId ? null : Number(rawSubtotal),
        discountAmount: Number(data.discountAmount),
        vatEnabled: data.vatEnabled,
        total: data.serviceId ? null : Number(data.total || rawSubtotal),
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
    subtotal: invoiceSubtotalInputSchema,
    discountAmount: invoiceDiscountInputSchema,
    vatEnabled: invoiceVatEnabledSchema,
    total: invoiceTotalInputSchema,
    status: invoiceFormStatusSchema,
  }),
);

export const updateInvoiceSchema = addInvoiceTotalValidation(
  z.object({
    ...invoiceRelations,
    number: requiredInvoiceNumberSchema,
    subtotal: invoiceSubtotalInputSchema,
    discountAmount: invoiceDiscountInputSchema,
    vatEnabled: invoiceVatEnabledSchema,
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
