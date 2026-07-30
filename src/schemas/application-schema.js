import { z } from "zod";

import {
  emailFormatRegex,
  normalizedEmailStringSchema,
  optionalStringSchema,
  phoneSchema,
  requiredStringSchema,
} from "./common-schema";

export const businessApplicationSchema = z.object({
  businessName: requiredStringSchema("Vendos emrin e biznesit.").pipe(
    z.string().min(2, {
      message: "Vendos emrin e biznesit.",
    }),
  ),

  ownerName: requiredStringSchema("Vendos emrin e pronarit.").pipe(
    z.string().min(2, {
      message: "Vendos emrin e pronarit.",
    }),
  ),

  email: normalizedEmailStringSchema.pipe(
    z
      .string()
      .min(1, {
        message: "Vendos një adresë emaili të vlefshme.",
      })
      .regex(emailFormatRegex, {
        message: "Vendos një adresë emaili të vlefshme.",
      }),
  ),

  phone: phoneSchema("Vendos një numër telefoni të vlefshëm."),

  city: requiredStringSchema("Vendos qytetin.").pipe(
    z.string().min(2, {
      message: "Vendos qytetin.",
    }),
  ),

  address: optionalStringSchema,

  notes: optionalStringSchema,
});
