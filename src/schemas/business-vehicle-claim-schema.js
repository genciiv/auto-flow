import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

const claimIdSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .min(1, {
      message: "Kërkesa nuk u gjet.",
    })
    .max(191, {
      message: "ID-ja e kërkesës nuk është e vlefshme.",
    }),
);

export const approveBusinessVehicleClaimSchema = z.object({
  claimId: claimIdSchema,
});

export const rejectBusinessVehicleClaimSchema = z.object({
  claimId: claimIdSchema,

  rejectionReason: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(1, {
        message: "Shkruaj arsyen e refuzimit.",
      })
      .min(3, {
        message: "Arsyeja e refuzimit duhet të ketë të paktën 3 karaktere.",
      })
      .max(500, {
        message: "Arsyeja e refuzimit nuk duhet të kalojë 500 karaktere.",
      }),
  ),
});
