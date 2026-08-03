import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

test("login ka IP limiter, identifier limiter dhe lockout", async () => {
  const source = await read("src/auth.js");
  assert.match(source, /loginIp/);
  assert.match(source, /loginIdentifier/);
  assert.match(source, /recordFailedLogin/);
  assert.match(source, /resetFailedLogins/);
  assert.match(source, /isAccountLocked/);
});

test("public actions kritike përdorin protection helper", async () => {
  const files = [
    "src/app/register/actions.js",
    "src/app/forgot-password/actions.js",
    "src/app/resend-verification/actions.js",
    "src/app/activate-account/actions.js",
    "src/app/apply/actions.js",
  ];
  for (const file of files) assert.match(await read(file), /protectPublicAction/);
});

test("search API kthen 429 dhe rate-limit headers", async () => {
  const source = await read("src/app/api/search/route.js");
  assert.match(source, /RATE_LIMITED/);
  assert.match(source, /status: 429/);
  assert.match(source, /rateLimitHeaders/);
});

test("schema ka lockout fields dhe persistent rate-limit buckets", async () => {
  const schema = await read("prisma/schema.prisma");
  assert.match(schema, /failedLoginAttempts/);
  assert.match(schema, /lockedUntil/);
  assert.match(schema, /model RateLimitBucket/);
});
