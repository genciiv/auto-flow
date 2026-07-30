import { z } from "zod";

import { emailFormatRegex, normalizeTrimmedString } from "./common-schema";

export const MARKETPLACE_LISTING_TYPES = [
  "VEHICLE",
  "MOTORCYCLE",
  "PART",
  "ACCESSORY",
  "SERVICE",
  "OTHER",
];

export const MARKETPLACE_MANAGEABLE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "SOLD",
  "ARCHIVED",
];

export const MARKETPLACE_CREATE_STATUSES = ["DRAFT", "PUBLISHED"];

export const MARKETPLACE_CONDITIONS = ["NEW", "USED", "REFURBISHED"];

function normalizeOptionalString(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeOptionalUppercaseString(value) {
  const normalizedValue = normalizeTrimmedString(value).toUpperCase();

  return normalizedValue || null;
}

function normalizeRequiredUppercaseString(value) {
  return normalizeTrimmedString(value).toUpperCase();
}

function normalizePrice(value) {
  const normalizedValue = normalizeTrimmedString(value);

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

function normalizeCheckbox(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

const listingIdSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(1, {
    message: "Publikimi nuk u gjet.",
  }),
);

const listingTitleSchema = z.preprocess(
  normalizeTrimmedString,
  z.string().min(3, {
    message: "Titulli duhet të ketë të paktën 3 karaktere.",
  }),
);

const listingTypeSchema = z.preprocess(
  normalizeRequiredUppercaseString,
  z.enum(MARKETPLACE_LISTING_TYPES, {
    message: "Lloji i publikimit nuk është i vlefshëm.",
  }),
);

const createListingStatusSchema = z.preprocess(
  normalizeRequiredUppercaseString,
  z.enum(MARKETPLACE_CREATE_STATUSES, {
    message: "Statusi i publikimit nuk është i vlefshëm.",
  }),
);

const manageableListingStatusSchema = z.preprocess(
  normalizeRequiredUppercaseString,
  z.enum(MARKETPLACE_MANAGEABLE_STATUSES, {
    message: "Statusi i publikimit nuk është i vlefshëm.",
  }),
);

const listingPriceSchema = z.preprocess(
  normalizePrice,
  z
    .number({
      message: "Vendos një çmim të vlefshëm.",
    })
    .refine((value) => Number.isFinite(value) && value >= 0, {
      message: "Vendos një çmim të vlefshëm.",
    }),
);

const optionalListingStringSchema = z.preprocess(
  normalizeOptionalString,
  z.string().nullable(),
);

const optionalEmailSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .refine((value) => emailFormatRegex.test(value), {
      message: "Adresa e email-it nuk është e vlefshme.",
    })
    .nullable(),
);

const optionalConditionSchema = z.preprocess(
  normalizeOptionalUppercaseString,
  z
    .enum(MARKETPLACE_CONDITIONS, {
      message: "Gjendja e publikimit nuk është e vlefshme.",
    })
    .nullable(),
);

const optionalProductionYearSchema = z.preprocess(
  normalizeOptionalInteger,
  z
    .number({
      message: "Viti i prodhimit nuk është i vlefshëm.",
    })
    .int({
      message: "Viti i prodhimit nuk është i vlefshëm.",
    })
    .min(1900, {
      message: "Viti i prodhimit nuk është i vlefshëm.",
    })
    .max(2100, {
      message: "Viti i prodhimit nuk është i vlefshëm.",
    })
    .nullable(),
);

const optionalMileageSchema = z.preprocess(
  normalizeOptionalInteger,
  z
    .number({
      message: "Kilometrat nuk janë të vlefshëm.",
    })
    .int({
      message: "Kilometrat duhet të jenë numër i plotë.",
    })
    .min(0, {
      message: "Kilometrat nuk mund të jenë negativë.",
    })
    .nullable(),
);

const optionalStockSchema = z.preprocess(
  normalizeOptionalInteger,
  z
    .number({
      message: "Stoku nuk është i vlefshëm.",
    })
    .int({
      message: "Stoku duhet të jetë numër i plotë.",
    })
    .min(0, {
      message: "Stoku nuk mund të jetë negativ.",
    })
    .nullable(),
);

const optionalVinSchema = z.preprocess(
  normalizeOptionalUppercaseString,
  z.string().nullable(),
);

const listingFields = {
  title: listingTitleSchema,
  description: optionalListingStringSchema,
  type: listingTypeSchema,
  price: listingPriceSchema,

  isNegotiable: z.preprocess(normalizeCheckbox, z.boolean()),

  category: optionalListingStringSchema,
  condition: optionalConditionSchema,

  city: optionalListingStringSchema,
  address: optionalListingStringSchema,

  phone: optionalListingStringSchema,
  email: optionalEmailSchema,

  brand: optionalListingStringSchema,
  model: optionalListingStringSchema,

  productionYear: optionalProductionYearSchema,
  mileage: optionalMileageSchema,

  fuelType: optionalListingStringSchema,
  transmission: optionalListingStringSchema,
  engine: optionalListingStringSchema,
  color: optionalListingStringSchema,
  vin: optionalVinSchema,

  stock: optionalStockSchema,
};

export const createMarketplaceListingSchema = z.object({
  ...listingFields,
  status: createListingStatusSchema,
});

export const updateMarketplaceListingSchema = z.object({
  listingId: listingIdSchema,
  ...listingFields,
  status: manageableListingStatusSchema,
});

export const changeMarketplaceListingStatusSchema = z.object({
  listingId: listingIdSchema,
  status: manageableListingStatusSchema,
});

export const deleteMarketplaceListingSchema = z.object({
  listingId: listingIdSchema,
});

export const marketplaceInquiryIdSchema = z.object({
  inquiryId: z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, {
      message: "Kërkesa nuk është e vlefshme.",
    }),
  ),
});
