import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

function normalizeSlug(value) {
  return normalizeTrimmedString(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeRequiredNumber(value) {
  const normalizedValue = normalizeTrimmedString(value).replace(",", ".");

  if (!normalizedValue) {
    return Number.NaN;
  }

  return Number(normalizedValue);
}

function normalizeOptionalInteger(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return null;
  }

  return Number(normalizedValue);
}

function normalizeSortOrder(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return 0;
  }

  return Number(normalizedValue);
}

function normalizeCheckbox(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function normalizeFeatures(value) {
  const normalizedValue = normalizeTrimmedString(value);

  if (!normalizedValue) {
    return [];
  }

  return normalizedValue
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

const planIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "ID-ja e planit mungon.",
  }),
);

const planNameSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(2, {
    message: "Emri i planit duhet të ketë të paktën 2 karaktere.",
  }),
);

const planSlugInputSchema = z.preprocess(normalizeTrimmedString, z.string());

const optionalDescriptionSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

function createRequiredPriceSchema(fieldLabel) {
  return z.preprocess(
    normalizeRequiredNumber,
    z
      .number({
        message: `${fieldLabel} është i detyrueshëm.`,
      })
      .refine((value) => Number.isFinite(value), {
        message: `${fieldLabel} duhet të jetë numër pozitiv.`,
      })
      .min(0, {
        message: `${fieldLabel} duhet të jetë numër pozitiv.`,
      }),
  );
}

function createOptionalLimitSchema(fieldLabel) {
  return z.preprocess(
    normalizeOptionalInteger,
    z
      .number({
        message: `${fieldLabel} duhet të jetë numër i plotë pozitiv.`,
      })
      .int({
        message: `${fieldLabel} duhet të jetë numër i plotë pozitiv.`,
      })
      .min(1, {
        message: `${fieldLabel} duhet të jetë numër i plotë pozitiv.`,
      })
      .nullable(),
  );
}

const sortOrderSchema = z.preprocess(
  normalizeSortOrder,
  z
    .number({
      message: "Renditja duhet të jetë numër i plotë pozitiv.",
    })
    .int({
      message: "Renditja duhet të jetë numër i plotë pozitiv.",
    })
    .min(0, {
      message: "Renditja duhet të jetë numër i plotë pozitiv.",
    }),
);

const planFieldsSchema = z.object({
  name: planNameSchema,
  slug: planSlugInputSchema,
  description: optionalDescriptionSchema,

  monthlyPrice: createRequiredPriceSchema("Çmimi mujor"),
  yearlyPrice: createRequiredPriceSchema("Çmimi vjetor"),

  maxUsers: createOptionalLimitSchema("Numri maksimal i përdoruesve"),

  maxCustomers: createOptionalLimitSchema("Numri maksimal i klientëve"),

  maxVehicles: createOptionalLimitSchema("Numri maksimal i automjeteve"),

  features: z.preprocess(normalizeFeatures, z.array(z.string())),

  isActive: z.preprocess(normalizeCheckbox, z.boolean()),

  isRecommended: z.preprocess(normalizeCheckbox, z.boolean()),

  sortOrder: sortOrderSchema,
});

export const createPlanSchema = planFieldsSchema.transform((data, context) => {
  const slug = normalizeSlug(data.slug || data.name);

  if (!slug) {
    context.addIssue({
      code: "custom",
      path: ["slug"],
      message: "Slug-u i planit nuk është i vlefshëm.",
    });

    return z.NEVER;
  }

  return {
    ...data,
    slug,
  };
});

export const updatePlanSchema = planFieldsSchema.transform((data, context) => {
  const slug = normalizeSlug(data.slug || data.name);

  if (!slug) {
    context.addIssue({
      code: "custom",
      path: ["slug"],
      message: "Slug-u i planit nuk është i vlefshëm.",
    });

    return z.NEVER;
  }

  return {
    ...data,
    slug,
  };
});

export const planIdObjectSchema = z.object({
  planId: planIdSchema,
});
