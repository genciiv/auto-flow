import { z } from "zod";

import { normalizeTrimmedString } from "./common-schema";

export const toggleMarketplaceFavoriteSchema = z.object({
  listingId: z.preprocess(
    normalizeTrimmedString,
    z
      .string()
      .min(1, {
        message: "Publikimi nuk u gjet.",
      })
      .max(191, {
        message: "ID-ja e publikimit nuk është e vlefshme.",
      }),
  ),
});
