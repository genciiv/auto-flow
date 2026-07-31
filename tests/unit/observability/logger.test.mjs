import test from "node:test";
import assert from "node:assert/strict";

import { logger, serializeError } from "@/lib/logger";

test("structured logger redakton secrets dhe ruan correlation context", () => {
  const original = console.log;
  const lines = [];
  console.log = (line) => lines.push(line);

  try {
    logger.info("test.event", {
      requestId: "req-123",
      password: "never-log-this",
      nested: { authorization: "Bearer secret", value: 42 },
    });
  } finally {
    console.log = original;
  }

  assert.equal(lines.length, 1);
  const entry = JSON.parse(lines[0]);
  assert.equal(entry.event, "test.event");
  assert.equal(entry.requestId, "req-123");
  assert.equal(entry.password, "[REDACTED]");
  assert.equal(entry.nested.authorization, "[REDACTED]");
  assert.equal(entry.nested.value, 42);
});

test("serializeError prodhon payload të kontrolluar", () => {
  const error = new Error("boom");
  error.code = "TEST_ERROR";
  const serialized = serializeError(error);

  assert.equal(serialized.name, "Error");
  assert.equal(serialized.message, "boom");
  assert.equal(serialized.code, "TEST_ERROR");
});
