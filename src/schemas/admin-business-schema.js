import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

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

export const changeBusinessStatusSchema = z.object({
  businessId: z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, {
      message: "ID-ja e biznesit mungon.",
    }),
  ),

  isActive: z.preprocess(
    normalizeBoolean,
    z.boolean({
      message: "Statusi i biznesit nuk është i vlefshëm.",
    }),
  ),
});
