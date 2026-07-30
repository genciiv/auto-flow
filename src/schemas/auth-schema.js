import { z } from "zod";

import { normalizedEmailStringSchema } from "./common-schema";

const requiredLoginMessage = "Plotëso email-in dhe password-in.";

export const loginSchema = z.object({
  email: normalizedEmailStringSchema.pipe(
    z.string().min(1, {
      message: requiredLoginMessage,
    }),
  ),

  /**
   * Password-i nuk trim-ohet që të mos ndryshojmë
   * password-et ekzistuese që mund të përmbajnë hapësira.
   */
  password: z.string().min(1, {
    message: requiredLoginMessage,
  }),
});
