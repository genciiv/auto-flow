import { z } from "zod";

import { emailFormatRegex, normalizeTrimmedString } from "./common-schema";

function normalizeOptionalText(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function normalizeEmail(value) {
  return normalizeTrimmedString(value).toLowerCase();
}

function normalizeOptionalDate(value) {
  const normalizedValue = normalizeTrimmedString(value);

  return normalizedValue || null;
}

function parseStrictDate(value) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

const firstNameSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .min(1, {
      message: "Emri është i detyrueshëm.",
    })
    .max(60, {
      message: "Emri nuk mund të jetë më i gjatë se 60 karaktere.",
    }),
);

const lastNameSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .min(1, {
      message: "Mbiemri është i detyrueshëm.",
    })
    .max(60, {
      message: "Mbiemri nuk mund të jetë më i gjatë se 60 karaktere.",
    }),
);

const optionalPhoneSchema = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .max(30, {
      message: "Numri i telefonit është shumë i gjatë.",
    })
    .nullable(),
);

const optionalCitySchema = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .max(80, {
      message: "Emri i qytetit është shumë i gjatë.",
    })
    .nullable(),
);

const optionalAddressSchema = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .max(200, {
      message: "Adresa nuk mund të jetë më e gjatë se 200 karaktere.",
    })
    .nullable(),
);

const birthDateSchema = z
  .preprocess(normalizeOptionalDate, z.string().nullable())
  .transform((value, context) => {
    if (!value) {
      return null;
    }

    const date = parseStrictDate(value);

    if (!date) {
      context.addIssue({
        code: "custom",
        message: "Datëlindja nuk është e vlefshme.",
      });

      return z.NEVER;
    }

    const today = new Date();

    today.setHours(23, 59, 59, 999);

    if (date > today) {
      context.addIssue({
        code: "custom",
        message: "Datëlindja nuk mund të jetë në të ardhmen.",
      });

      return z.NEVER;
    }

    return date;
  });

const requiredPasswordSchema = z.preprocess(
  (value) => String(value ?? ""),
  z.string().min(1, {
    message: "Password-i aktual është i detyrueshëm.",
  }),
);

const newPasswordSchema = z.preprocess(
  (value) => String(value ?? ""),
  z
    .string()
    .min(8, {
      message: "Password-i i ri duhet të ketë të paktën 8 karaktere.",
    })
    .max(100, {
      message: "Password-i i ri është shumë i gjatë.",
    }),
);

export const customerProfileSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phone: optionalPhoneSchema,
  city: optionalCitySchema,
  address: optionalAddressSchema,
  birthDate: birthDateSchema,
});

export const customerEmailChangeSchema = z.object({
  newEmail: z.preprocess(
    normalizeEmail,
    z
      .string()
      .min(1, {
        message: "Email-i i ri është i detyrueshëm.",
      })
      .max(190, {
        message: "Email-i i ri është shumë i gjatë.",
      })
      .refine((value) => emailFormatRegex.test(value), {
        message: "Vendos një adresë email-i të vlefshme.",
      }),
  ),

  currentPassword: requiredPasswordSchema,
});

export const customerPasswordChangeSchema = z
  .object({
    currentPassword: requiredPasswordSchema,
    newPassword: newPasswordSchema,

    confirmPassword: z.preprocess(
      (value) => String(value ?? ""),
      z.string().min(1, {
        message: "Konfirmo password-in e ri.",
      }),
    ),
  })
  .superRefine((data, context) => {
    if (data.newPassword !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Password-et e reja nuk përputhen.",
      });
    }
  });
