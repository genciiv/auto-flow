import { z } from "zod";

/**
 * Normalizon një string duke hequr hapësirat
 * në fillim dhe në fund.
 */
export const trimmedStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
}, z.string());

/**
 * Krijon një string të detyrueshëm dhe të normalizuar.
 */
export function requiredStringSchema(
  message = "Kjo fushë është e detyrueshme.",
) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return value.trim();
    },
    z.string().min(1, {
      message,
    }),
  );
}

/**
 * String opsional.
 *
 * Vlera:
 * - trim-ohet
 * - konvertohet në string bosh nëse mungon
 *
 * E mbajmë si string bosh sepse kjo është sjellja
 * aktuale e formularëve të AutoFlow.
 */
export const optionalStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}, z.string());

/**
 * Normalizon email-in:
 * - heq hapësirat
 * - e konverton në lowercase
 *
 * Nuk kontrollon formatin automatikisht, sepse
 * login-i aktual kontrollon vetëm nëse email-i ekziston.
 */
export const normalizedEmailStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().toLowerCase();
}, z.string());

/**
 * Kontroll bazë i formatit të email-it.
 *
 * Përdor të njëjtin rregull që përdorte më parë
 * application action.
 */
export const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Numër telefoni bazë.
 *
 * Nuk vendosim kufizime të forta për karakteret,
 * sepse rrjedha aktuale kontrollon vetëm gjatësinë.
 */
export function phoneSchema(
  message = "Vendos një numër telefoni të vlefshëm.",
) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return "";
      }

      return value.trim();
    },
    z.string().min(6, {
      message,
    }),
  );
}
