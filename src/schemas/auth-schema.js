import { z } from "zod";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function normalizeTrimmedString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizePhone(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
}

const requiredLoginMessage = "Plotëso email-in dhe password-in.";

export const loginSchema = z.object({
  email: z.preprocess(
    normalizeEmail,
    z.string().min(1, {
      message: requiredLoginMessage,
    }),
  ),

  /*
   * Password-i nuk trim-ohet.
   *
   * Kjo ruan sjelljen aktuale dhe lejon që një
   * password ekzistues të përmbajë hapësira.
   */
  password: z.string().min(1, {
    message: requiredLoginMessage,
  }),
});

export const registerSchema = z
  .object({
    name: z.preprocess(
      normalizeTrimmedString,
      z
        .string()
        .min(1, {
          message: "Plotëso të gjitha fushat e detyrueshme.",
        })
        .min(2, {
          message: "Emri duhet të ketë të paktën 2 karaktere.",
        })
        .max(100, {
          message: "Emri është shumë i gjatë.",
        }),
    ),

    email: z.preprocess(
      normalizeEmail,
      z
        .string()
        .min(1, {
          message: "Plotëso të gjitha fushat e detyrueshme.",
        })
        .refine((value) => EMAIL_PATTERN.test(value), {
          message: "Vendos një adresë email-i të vlefshme.",
        }),
    ),

    phone: z.preprocess(
      normalizePhone,
      z.string().refine((value) => value.length === 0 || value.length >= 6, {
        message: "Numri i telefonit nuk është i vlefshëm.",
      }),
    ),

    /*
     * Password-et nuk trim-ohen.
     *
     * Kjo ruan të njëjtën sjellje që kishte action-i
     * para integrimit me Zod.
     */
    password: z
      .string()
      .min(1, {
        message: "Plotëso të gjitha fushat e detyrueshme.",
      })
      .min(8, {
        message: "Password-i duhet të ketë të paktën 8 karaktere.",
      })
      .max(100, {
        message: "Password-i është shumë i gjatë.",
      }),

    confirmPassword: z.string().min(1, {
      message: "Plotëso të gjitha fushat e detyrueshme.",
    }),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Password-et nuk përputhen.",
      });
    }
  });
