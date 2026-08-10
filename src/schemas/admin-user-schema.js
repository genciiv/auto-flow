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

export const adminUserProfileSchema = adminUserIdSchema.extend({
  name: z.preprocess(
    normalizeTrimmedString,
    z.string().min(2, { message: "Emri duhet të ketë të paktën 2 karaktere." }).max(120),
  ),
  phone: z.preprocess(
    (value) => {
      const normalized = normalizeTrimmedString(value);
      return normalized === "" ? null : normalized;
    },
    z.string().max(40, { message: "Telefoni është shumë i gjatë." }).nullable(),
  ),
});

export const adminUserVerificationSchema = adminUserIdSchema.extend({
  verified: z.preprocess(
    normalizeBoolean,
    z.boolean({ message: "Statusi i verifikimit nuk është i vlefshëm." }),
  ),
});

export const adminBusinessMembershipSchema = adminUserIdSchema.extend({
  membershipId: z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, { message: "Anëtarësia mungon." }),
  ),
  role: z.enum(["OWNER", "MANAGER", "MECHANIC", "RECEPTIONIST", "WAREHOUSE", "ACCOUNTANT"], {
    message: "Roli në biznes nuk është i vlefshëm.",
  }),
});

export const adminBusinessMembershipRemoveSchema = adminUserIdSchema.extend({
  membershipId: z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, { message: "Anëtarësia mungon." }),
  ),
});

export const adminDeleteUserSchema = adminUserIdSchema.extend({
  confirmEmail: z.preprocess(
    normalizeTrimmedString,
    z.string().email({ message: "Shkruaj email-in e saktë të përdoruesit." }),
  ),
});
