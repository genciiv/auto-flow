import { z } from "zod";

/**
 * Kthen një string të pastruar.
 *
 * Vlerat jo-string kthehen në string bosh,
 * që fushat e munguara të marrin mesazhin
 * e validimit të përcaktuar nga schema.
 */
export function normalizeTrimmedString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/**
 * Normalizon email-in:
 * - heq hapësirat në fillim dhe fund;
 * - e konverton në lowercase.
 */
export function normalizeEmail(value) {
  return normalizeTrimmedString(value).toLowerCase();
}

/**
 * Normalizon telefonin:
 * - heq hapësirat në fillim dhe fund;
 * - bashkon hapësirat e shumëfishta në një.
 */
export function normalizePhone(value) {
  return normalizeTrimmedString(value).replace(/\s+/g, " ");
}

/**
 * Kontrolli bazë i formatit të email-it.
 *
 * Ruhet i njëjti regex që përdornin formularët
 * para centralizimit me Zod.
 */
export const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * String i normalizuar me trim().
 */
export const trimmedStringSchema = z.preprocess(
  normalizeTrimmedString,
  z.string(),
);

/**
 * String i detyrueshëm dhe i normalizuar.
 */
export function requiredStringSchema(
  message = "Kjo fushë është e detyrueshme.",
) {
  return z.preprocess(
    normalizeTrimmedString,
    z.string().min(1, {
      message,
    }),
  );
}

/**
 * String opsional.
 *
 * Fusha bosh ruhet si string bosh për të ruajtur
 * sjelljen aktuale të formularëve të AutoFlow.
 */
export const optionalStringSchema = z.preprocess(
  normalizeTrimmedString,
  z.string(),
);

/**
 * Email i normalizuar pa kontroll formati.
 *
 * Login-i kontrollon vetëm që email-i të mos jetë bosh.
 */
export const normalizedEmailStringSchema = z.preprocess(
  normalizeEmail,
  z.string(),
);

/**
 * Telefon i detyrueshëm.
 *
 * Bën vetëm trim dhe kontroll të gjatësisë,
 * njësoj si aplikimi ekzistues i biznesit.
 */
export function phoneSchema(
  message = "Vendos një numër telefoni të vlefshëm.",
) {
  return z.preprocess(
    normalizeTrimmedString,
    z.string().min(6, {
      message,
    }),
  );
}

/**
 * Telefon opsional.
 *
 * Lejon string bosh. Kur ka vlerë:
 * - normalizon hapësirat;
 * - kërkon të paktën 6 karaktere.
 *
 * Përdoret te regjistrimi i klientit.
 */
export function optionalPhoneSchema(
  message = "Numri i telefonit nuk është i vlefshëm.",
) {
  return z.preprocess(
    normalizePhone,
    z.string().refine((value) => value.length === 0 || value.length >= 6, {
      message,
    }),
  );
}
