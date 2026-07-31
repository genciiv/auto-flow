import test from "node:test";
import assert from "node:assert/strict";

import {
  actionFailure,
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { AppError, ERROR_CODES } from "@/lib/errors";

function assertRequestId(value) {
  assert.equal(typeof value, "string");
  assert.match(value, /^[0-9a-f-]{36}$/i);
}

test("actionSuccess kthen kontratën standarde dhe compatibility fields", () => {
  const result = actionSuccess({ message: "U ruajt.", data: { id: "1" } });

  assert.deepEqual(
    {
      success: result.success,
      code: result.code,
      message: result.message,
      fieldErrors: result.fieldErrors,
      data: result.data,
      error: result.error,
      errors: result.errors,
    },
    {
      success: true,
      code: null,
      message: "U ruajt.",
      fieldErrors: {},
      data: { id: "1" },
      error: null,
      errors: {},
    },
  );
  assertRequestId(result.requestId);
});

test("actionFailure kthen error dhe errors për UI-në ekzistuese", () => {
  const result = actionFailure({
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "Kontrollo të dhënat.",
    fieldErrors: { name: "Emri kërkohet." },
  });

  assert.equal(result.success, false);
  assert.equal(result.error, result.message);
  assert.deepEqual(result.errors, result.fieldErrors);
  assertRequestId(result.requestId);
});

test("validationFailure përdor issue-n dhe flatten field errors", () => {
  const validationError = {
    issues: [{ message: "Email-i nuk është i vlefshëm." }],
    flatten() {
      return { fieldErrors: { email: ["Email-i nuk është i vlefshëm."] } };
    },
  };

  const result = validationFailure(validationError);

  assert.equal(result.code, ERROR_CODES.VALIDATION_ERROR);
  assert.equal(result.message, "Email-i nuk është i vlefshëm.");
  assert.deepEqual(result.fieldErrors, { email: "Email-i nuk është i vlefshëm." });
});

test("errorFailure ruan kodin publik të AppError", () => {
  const result = errorFailure(
    new AppError({ code: ERROR_CODES.FORBIDDEN, message: "Nuk lejohet.", status: 403 }),
  );

  assert.equal(result.success, false);
  assert.equal(result.code, ERROR_CODES.FORBIDDEN);
  assert.equal(result.message, "Nuk lejohet.");
});
