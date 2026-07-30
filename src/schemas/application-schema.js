import { z } from "zod";

const normalizeString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizeEmail = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

export const businessApplicationSchema = z.object({
  businessName: z.preprocess(
    normalizeString,
    z.string().min(2, {
      message: "Vendos emrin e biznesit.",
    }),
  ),

  ownerName: z.preprocess(
    normalizeString,
    z.string().min(2, {
      message: "Vendos emrin e pronarit.",
    }),
  ),

  email: z.preprocess(
    normalizeEmail,
    z
      .string()
      .min(1, {
        message: "Vendos një adresë emaili të vlefshme.",
      })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
        message: "Vendos një adresë emaili të vlefshme.",
      }),
  ),

  phone: z.preprocess(
    normalizeString,
    z.string().min(6, {
      message: "Vendos një numër telefoni të vlefshëm.",
    }),
  ),

  city: z.preprocess(
    normalizeString,
    z.string().min(2, {
      message: "Vendos qytetin.",
    }),
  ),

  address: z.preprocess(normalizeString, z.string()),

  notes: z.preprocess(normalizeString, z.string()),
});
