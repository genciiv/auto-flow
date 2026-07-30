import { z } from "zod";

import {
  emailFormatRegex,
  normalizeEmail,
  normalizeTrimmedString,
} from "./common-schema";

export const testEmailSchema = z.object({
  email: z.preprocess(
    normalizeEmail,
    z
      .string()
      .min(1, {
        message: "Shkruaj adresën e email-it.",
      })
      .max(150, {
        message: "Email-i është shumë i gjatë.",
      })
      .refine((value) => emailFormatRegex.test(value), {
        message: "Shkruaj një adresë email-i të vlefshme.",
      }),
  ),

  name: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .max(100, {
        message: "Emri nuk mund të ketë më shumë se 100 karaktere.",
      })
      .optional()
      .default(""),
  ),
});

export const globalSearchSchema = z.object({
  query: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(2, {
        message: "Kërkimi duhet të ketë të paktën 2 karaktere.",
      })
      .max(100, {
        message: "Kërkimi nuk mund të ketë më shumë se 100 karaktere.",
      }),
  ),
});
