import test from "node:test";
import assert from "node:assert/strict";

import {
  AppError,
  ERROR_CODES,
  createForbiddenError,
  createNotFoundError,
  getErrorCode,
  getErrorMessage,
  getErrorStatus,
  isAppError,
  isNextNotFoundError,
  isNextRedirectError,
  normalizeError,
} from "@/lib/errors";

test("AppError ruan kodin, statusin dhe field errors", () => {
  const error = new AppError({
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "Kontrollo formularin.",
    status: 400,
    fieldErrors: { email: "Email i pavlefshëm." },
  });

  assert.equal(isAppError(error), true);
  assert.equal(error.code, ERROR_CODES.VALIDATION_ERROR);
  assert.equal(error.status, 400);
  assert.deepEqual(error.fieldErrors, { email: "Email i pavlefshëm." });
});

test("helper-at e autorizimit dhe not found prodhojnë statuse korrekte", () => {
  assert.equal(createForbiddenError().status, 403);
  assert.equal(createForbiddenError().code, ERROR_CODES.FORBIDDEN);
  assert.equal(createNotFoundError().status, 404);
});

test("normalizeError mapon gabimet Prisma në kontratën publike", () => {
  const cases = [
    ["P2002", ERROR_CODES.ALREADY_EXISTS, 409],
    ["P2003", ERROR_CODES.CONFLICT, 409],
    ["P2024", ERROR_CODES.DATABASE_ERROR, 503],
    ["P2025", ERROR_CODES.NOT_FOUND, 404],
    ["P2034", ERROR_CODES.CONFLICT, 409],
  ];

  for (const [prismaCode, expectedCode, expectedStatus] of cases) {
    const normalized = normalizeError({ code: prismaCode });
    assert.equal(normalized.code, expectedCode);
    assert.equal(normalized.status, expectedStatus);
  }
});

test("normalizeError nuk ekspozon mesazhin teknik për Error të panjohur", () => {
  const normalized = normalizeError(new Error("database password leaked"));

  assert.equal(normalized.code, ERROR_CODES.INTERNAL_ERROR);
  assert.equal(normalized.status, 500);
  assert.equal(normalized.message.includes("database password"), false);
});

test("getError helpers respektojnë AppError dhe fallback", () => {
  const appError = createForbiddenError("Nuk lejohet.");

  assert.equal(getErrorCode(appError), ERROR_CODES.FORBIDDEN);
  assert.equal(getErrorStatus(appError), 403);
  assert.equal(getErrorMessage(appError), "Nuk lejohet.");
  assert.equal(getErrorMessage(new Error("secret"), "Gabim publik."), "Gabim publik.");
});

test("Next.js redirect dhe not-found errors njihen", () => {
  assert.equal(isNextRedirectError({ digest: "NEXT_REDIRECT;replace;/login;307;" }), true);
  assert.equal(isNextNotFoundError({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }), true);
  assert.equal(isNextRedirectError(new Error("normal")), false);
});
