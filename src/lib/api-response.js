import "server-only";

import { NextResponse } from "next/server";

import { ERROR_CODES, normalizeError } from "@/lib/errors";
import { createRequestId, getRequestId } from "@/lib/request-context";
import { logger } from "@/lib/logger";

function json(payload, { status = 200, requestId = createRequestId(), headers = {} } = {}) {
  return NextResponse.json(
    {
      ...payload,
      requestId,
    },
    {
      status,
      headers: {
        "x-request-id": requestId,
        "cache-control": "no-store",
        ...headers,
      },
    },
  );
}

export function apiSuccess({ data = null, message = null, requestId, status = 200 } = {}) {
  return json(
    {
      success: true,
      code: null,
      message,
      fieldErrors: {},
      data,
    },
    { status, requestId },
  );
}

export function apiFailure({
  code = ERROR_CODES.INTERNAL_ERROR,
  message = "Ndodhi një gabim i papritur. Provo përsëri.",
  fieldErrors = {},
  data = null,
  requestId,
  status = 500,
  headers = {},
} = {}) {
  return json(
    {
      success: false,
      code,
      message,
      fieldErrors,
      data,
    },
    { status, requestId, headers },
  );
}

export function apiError(error, { request, requestId, fallbackMessage } = {}) {
  const resolvedRequestId = requestId || getRequestId(request);
  const normalizedError = normalizeError(error, {
    fallbackMessage:
      fallbackMessage || "Ndodhi një gabim i papritur. Provo përsëri.",
  });

  const log = normalizedError.status >= 500 ? logger.error : logger.warn;
  log("api.request.failed", {
    requestId: resolvedRequestId,
    method: request?.method,
    path: request ? new URL(request.url).pathname : undefined,
    status: normalizedError.status,
    code: normalizedError.code,
    error,
  });

  return apiFailure({
    code: normalizedError.code,
    message: normalizedError.message,
    fieldErrors: normalizedError.fieldErrors,
    status: normalizedError.status,
    requestId: resolvedRequestId,
  });
}
