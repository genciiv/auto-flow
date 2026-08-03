import { z } from "zod";

import {
  emailFormatRegex,
  normalizeTrimmedString,
  normalizedEmailStringSchema,
  optionalPhoneSchema,
  requiredStringSchema,
} from "./common-schema";

const requiredLoginMessage = "Plotëso email-in dhe password-in.";

const requiredRegisterMessage = "Plotëso të gjitha fushat e detyrueshme.";

const requiredPasswordFieldsMessage = "Plotëso të dyja fushat e password-it.";

const passwordMismatchMessage = "Password-et nuk përputhen.";

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

/**
 * Krijon një token të normalizuar me trim().
 */
function createRequiredTokenSchema(message) {
  return z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, {
      message,
    }),
  );
}

/**
 * Password për krijim, rivendosje ose aktivizim llogarie.
 *
 * Password-i nuk trim-ohet, në mënyrë që të ruhet
 * sjellja ekzistuese e aplikacionit.
 */
function createNewPasswordSchema(requiredMessage) {
  return z
    .string()
    .min(1, {
      message: requiredMessage,
    })
    .min(8, {
      message: "Password-i duhet të ketë të paktën 8 karaktere.",
    })
    .max(100, {
      message: "Password-i është shumë i gjatë.",
    });
}

/**
 * Shton kontrollin që password-et të përputhen.
 */
function addPasswordConfirmationValidation(schema) {
  return schema.superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: passwordMismatchMessage,
      });
    }
  });
}

/**
 * Krijon schema-n e përbashkët për rrjedhat që përdorin:
 * - token
 * - password
 * - confirmPassword
 */
function createTokenPasswordSchema({
  tokenMessage,
  passwordRequiredMessage = requiredPasswordFieldsMessage,
}) {
  return addPasswordConfirmationValidation(
    z.object({
      token: createRequiredTokenSchema(tokenMessage),

      password: createNewPasswordSchema(passwordRequiredMessage),

      confirmPassword: z.string().min(1, {
        message: passwordRequiredMessage,
      }),
    }),
  );
}

export const loginSchema = z.object({
  email: normalizedEmailStringSchema.pipe(
    z.string().min(1, {
      message: requiredLoginMessage,
    }),
  ),

  /**
   * Password-i nuk trim-ohet.
   */
  password: z.string().min(1, {
    message: requiredLoginMessage,
  }),

  portalType: z.enum(["personal", "business"], {
    message: "Zgjidh mënyrën e hyrjes.",
  }),

  callbackUrl: z.string().optional(),
});

export const registerSchema = addPasswordConfirmationValidation(
  z.object({
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
     * Password-i nuk trim-ohet.
     */
    password: createNewPasswordSchema(requiredRegisterMessage),

    confirmPassword: z.string().min(1, {
      message: requiredRegisterMessage,
    }),
  }),
);

export const forgotPasswordSchema = z.object({
  email: accountEmailSchema,
});

export const resendVerificationSchema = z.object({
  email: accountEmailSchema,
});

export const resetPasswordSchema = createTokenPasswordSchema({
  tokenMessage: "Linku i rivendosjes nuk është i vlefshëm.",
});

export const activateAccountSchema = createTokenPasswordSchema({
  tokenMessage: "Linku i aktivizimit nuk është i vlefshëm.",
});

export const verifyEmailTokenSchema = z.object({
  /**
   * Nuk bëjmë trim(), sepse faqja ekzistuese
   * e verify-email nuk e normalizonte token-in.
   */
  token: z.string().min(1, {
    message: "Token-i i verifikimit mungon.",
  }),
});

export const verifyEmailChangeTokenSchema = z.object({
  token: createRequiredTokenSchema("Token-i i ndryshimit të email-it mungon."),
});
