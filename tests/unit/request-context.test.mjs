import test from "node:test";
import assert from "node:assert/strict";

import {
  createRequestId,
  getRequestId,
  withRequestIdHeaders,
} from "@/lib/request-context";

test("createRequestId krijon UUID të ndryshëm", () => {
  const first = createRequestId();
  const second = createRequestId();

  assert.match(first, /^[0-9a-f-]{36}$/i);
  assert.notEqual(first, second);
});

test("getRequestId përdor header-in ekzistues kur është i sigurt", () => {
  const request = new Request("https://example.test", {
    headers: { "x-request-id": "client-request-123" },
  });

  assert.equal(getRequestId(request), "client-request-123");
});

test("getRequestId refuzon header shumë të gjatë", () => {
  const request = new Request("https://example.test", {
    headers: { "x-request-id": "x".repeat(129) },
  });

  const result = getRequestId(request);
  assert.notEqual(result, "x".repeat(129));
  assert.match(result, /^[0-9a-f-]{36}$/i);
});

test("withRequestIdHeaders nuk humbet header-at ekzistues", () => {
  const headers = withRequestIdHeaders({ "cache-control": "no-store" }, "req-1");

  assert.equal(headers.get("cache-control"), "no-store");
  assert.equal(headers.get("x-request-id"), "req-1");
});
