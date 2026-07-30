import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const notificationIdSchema = z.object({
  notificationId: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(1, {
        message: "Njoftimi nuk u gjet.",
      })
      .max(191, {
        message: "ID-ja e njoftimit nuk është e vlefshme.",
      }),
  ),
});
