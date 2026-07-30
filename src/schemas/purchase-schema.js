import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const PURCHASE_EDITABLE_STATUSES = ["PENDING", "ORDERED", "CANCELLED"];

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeNonNegativeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(value);
}

function normalizePositiveNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 1;
  }

  return Number(value);
}

function normalizeCreatePurchaseStatus(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || "PENDING";
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

const formPurchaseIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "ID e porosisë mungon.",
  }),
);

/**
 * ID-të që vijnë si argument direkt nuk trim-ohen.
 * Kjo ruan sjelljen ekzistuese të actions.
 */
const directPurchaseIdSchema = z.string().min(1, {
  message: "ID e porosisë mungon.",
});

const supplierSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Furnitori është i detyrueshëm.",
  }),
);

const notesSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const purchaseTotalSchema = createNonNegativeNumberSchema(
  "Totali i porosisë duhet të jetë numër pozitiv.",
);

const purchaseStatusValueSchema = z.enum(PURCHASE_EDITABLE_STATUSES, {
  message: "Statusi i zgjedhur nuk është i vlefshëm.",
});

const createPurchaseStatusSchema = z.preprocess(
  normalizeCreatePurchaseStatus,
  purchaseStatusValueSchema,
);

const updatePurchaseStatusValueSchema = z.preprocess(
  normalizeTrimmedString,
  z.enum(PURCHASE_EDITABLE_STATUSES, {
    message:
      "Statusi nuk është i vlefshëm. Porosia merret në magazinë vetëm nga butoni përkatës.",
  }),
);

export const createPurchaseOrderSchema = z.object({
  supplier: supplierSchema,
  status: createPurchaseStatusSchema,
  total: purchaseTotalSchema,
  notes: notesSchema,
});

export const updatePurchaseOrderSchema = z.object({
  id: formPurchaseIdSchema,
  supplier: supplierSchema,
  status: updatePurchaseStatusValueSchema,
  total: purchaseTotalSchema,
  notes: notesSchema,
});

export const updatePurchaseStatusSchema = z.object({
  purchaseId: directPurchaseIdSchema,

  /**
   * Statusi nuk trim-ohet ose konvertohet.
   * Action-i ekzistues pranonte vetëm vlerat ekzakte.
   */
  status: z.enum(PURCHASE_EDITABLE_STATUSES, {
    message: "Statusi i zgjedhur nuk është i vlefshëm.",
  }),
});

export const deletePurchaseOrderSchema = z.object({
  purchaseId: directPurchaseIdSchema,
});

const purchaseOrderIdFieldSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Porosia dhe emri i artikullit janë të detyrueshme.",
  }),
);

const purchaseItemNameSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Porosia dhe emri i artikullit janë të detyrueshme.",
  }),
);

const purchaseItemQuantitySchema = z.preprocess(
  normalizePositiveNumber,
  z
    .number({
      message: "Sasia duhet të jetë më e madhe se zero.",
    })
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "Sasia duhet të jetë më e madhe se zero.",
    }),
);

const purchaseItemUnitPriceSchema = createNonNegativeNumberSchema(
  "Çmimi për njësi duhet të jetë numër pozitiv.",
);

export const addPurchaseItemSchema = z.object({
  purchaseOrderId: purchaseOrderIdFieldSchema,
  name: purchaseItemNameSchema,
  quantity: purchaseItemQuantitySchema,
  unitPrice: purchaseItemUnitPriceSchema,
});

export const receivePurchaseOrderSchema = z.object({
  purchaseOrderId: directPurchaseIdSchema,
});
