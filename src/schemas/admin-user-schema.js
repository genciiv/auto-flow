import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

function normalizeBoolean(value) {
  if (value === true || value === false) return value;
  if (value === "true" || value === "1" || value === "on") return true;
  if (value === "false" || value === "0" || value === "off") return false;
  return value;
}

export const adminUserIdSchema = z.object({
  userId: z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, { message: "ID-ja e përdoruesit mungon." }),
  ),
});

export const adminUserStatusSchema = adminUserIdSchema.extend({
  isActive: z.preprocess(
    normalizeBoolean,
    z.boolean({ message: "Statusi i përdoruesit nuk është i vlefshëm." }),
  ),
});

export const adminUserGlobalRoleSchema = adminUserIdSchema.extend({
  globalRole: z.enum(["NONE", "CUSTOMER", "PLATFORM_ADMIN"], {
    message: "Roli global nuk është i vlefshëm.",
  }),
});
