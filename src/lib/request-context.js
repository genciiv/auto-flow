import "server-only";

export function createRequestId() {
  return crypto.randomUUID();
}

export function getRequestId(request) {
  const existingRequestId = request?.headers?.get?.("x-request-id")?.trim();

  if (existingRequestId && existingRequestId.length <= 128) {
    return existingRequestId;
  }

  return createRequestId();
}

export function withRequestIdHeaders(headers, requestId) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("x-request-id", requestId);
  return responseHeaders;
}
