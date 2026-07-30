import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

const applicationIdSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .min(1, {
      message: "ID-ja e aplikimit mungon.",
    })
    .max(191, {
      message: "ID-ja e aplikimit nuk është e vlefshme.",
    }),
);

const rejectionReasonSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .min(3, {
      message: "Arsyeja duhet të ketë të paktën 3 karaktere.",
    })
    .max(1000, {
      message:
        "Arsyeja e refuzimit nuk mund të ketë më shumë se 1000 karaktere.",
    }),
);

export const applicationIdObjectSchema = z.object({
  applicationId: applicationIdSchema,
});

export const rejectAdminApplicationSchema = z.object({
  applicationId: applicationIdSchema,
  rejectionReason: rejectionReasonSchema,
});
