import { z } from "zod";

import {
  emailFormatRegex,
  normalizedEmailStringSchema,
  optionalPhoneSchema,
  requiredStringSchema,
} from "./common-schema";

const requiredLoginMessage = "Plotëso email-in dhe password-in.";

const requiredRegisterMessage = "Plotëso të gjitha fushat e detyrueshme.";

const accountEmailSchema = normalizedEmailStringSchema.pipe(
  z
    .string()
    .min(1, {
      message: "Vendos adresën e email-it.",
    })
    .refine((value) => emailFormatRegex.test(value), {
      message: "Vendos një adresë email-i të vlefshme.",
    }),
);

export const loginSchema = z.object({
  email: normalizedEmailStringSchema.pipe(
    z.string().min(1, {
      message: requiredLoginMessage,
    }),
  ),

  /**
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
    name: requiredStringSchema(requiredRegisterMessage).pipe(
      z
        .string()
        .min(2, {
          message: "Emri duhet të ketë të paktën 2 karaktere.",
        })
        .max(100, {
          message: "Emri është shumë i gjatë.",
        }),
    ),

    email: normalizedEmailStringSchema.pipe(
      z
        .string()
        .min(1, {
          message: requiredRegisterMessage,
        })
        .refine((value) => emailFormatRegex.test(value), {
          message: "Vendos një adresë email-i të vlefshme.",
        }),
    ),

    phone: optionalPhoneSchema("Numri i telefonit nuk është i vlefshëm."),

    /**
     * Password-et nuk trim-ohen.
     *
     * Kjo ruan sjelljen që kishte register action
     * përpara integrimit me Zod.
     */
    password: z
      .string()
      .min(1, {
        message: requiredRegisterMessage,
      })
      .min(8, {
        message: "Password-i duhet të ketë të paktën 8 karaktere.",
      })
      .max(100, {
        message: "Password-i është shumë i gjatë.",
      }),

    confirmPassword: z.string().min(1, {
      message: requiredRegisterMessage,
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

export const forgotPasswordSchema = z.object({
  email: accountEmailSchema,
});

export const resendVerificationSchema = z.object({
  email: accountEmailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.preprocess(
      (value) => {
        if (typeof value !== "string") {
          return "";
        }

        return value.trim();
      },
      z.string().min(1, {
        message: "Linku i rivendosjes nuk është i vlefshëm.",
      }),
    ),

    /**
     * Password-et nuk trim-ohen.
     *
     * Kjo ruan sjelljen ekzistuese.
     */
    password: z
      .string()
      .min(1, {
        message: "Plotëso të dyja fushat e password-it.",
      })
      .min(8, {
        message: "Password-i duhet të ketë të paktën 8 karaktere.",
      })
      .max(100, {
        message: "Password-i është shumë i gjatë.",
      }),

    confirmPassword: z.string().min(1, {
      message: "Plotëso të dyja fushat e password-it.",
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

export const activateAccountSchema = z
  .object({
    token: z.preprocess(
      (value) => {
        if (typeof value !== "string") {
          return "";
        }

        return value.trim();
      },
      z.string().min(1, {
        message: "Linku i aktivizimit nuk është i vlefshëm.",
      }),
    ),

    /**
     * Password-et nuk trim-ohen.
     *
     * Kjo ruan sjelljen ekzistuese.
     */
    password: z
      .string()
      .min(1, {
        message: "Plotëso të dyja fushat e password-it.",
      })
      .min(8, {
        message: "Password-i duhet të ketë të paktën 8 karaktere.",
      })
      .max(100, {
        message: "Password-i është shumë i gjatë.",
      }),

    confirmPassword: z.string().min(1, {
      message: "Plotëso të dyja fushat e password-it.",
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
