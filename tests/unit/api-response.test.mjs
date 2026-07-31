import test from "node:test";
import assert from "node:assert/strict";

import { apiError, apiFailure, apiSuccess } from "@/lib/api-response";
import { AppError, ERROR_CODES } from "@/lib/errors";

test("apiSuccess kthen payload dhe headers standarde", async () => {
  const response = apiSuccess({
    data: { id: 1 },
    message: "OK",
    requestId: "req-success",
    status: 201,
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("x-request-id"), "req-success");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(payload, {
    success: true,
    code: null,
    message: "OK",
    fieldErrors: {},
    data: { id: 1 },
    requestId: "req-success",
  });
});

test("apiFailure ruan statusin dhe field errors", async () => {
  const response = apiFailure({
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "Invalid",
    fieldErrors: { email: "Required" },
    requestId: "req-failure",
    status: 400,
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.code, ERROR_CODES.VALIDATION_ERROR);
  assert.deepEqual(payload.fieldErrors, { email: "Required" });
});

test("apiError normalizon AppError dhe merr requestId nga request", async () => {
  const request = new Request("https://example.test", {
    headers: { "x-request-id": "req-from-request" },
  });
  const response = apiError(
    new AppError({ code: ERROR_CODES.FORBIDDEN, message: "Forbidden", status: 403 }),
    { request },
  );
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.code, ERROR_CODES.FORBIDDEN);
  assert.equal(payload.requestId, "req-from-request");
});
