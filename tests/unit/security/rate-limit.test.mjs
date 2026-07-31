import test from "node:test";
import assert from "node:assert/strict";
import { getLockMinutes, isAccountLocked } from "../../../src/lib/login-protection.js";
import { getClientIpFromHeaders, hashRateLimitKey, normalizeIdentifier, RATE_LIMIT_POLICIES } from "../../../src/lib/rate-limit.js";

test("rate-limit keys normalizohen dhe hash-ohen pa ruajtur PII", () => {
  assert.equal(normalizeIdentifier("  USER@Example.COM "), "user@example.com");
  const hash = hashRateLimitKey("login", ["1.2.3.4", "USER@example.com"]);
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(hash.includes("example.com"), false);
});

test("IP merret nga proxy headers në mënyrë të kontrolluar", () => {
  const headers = new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
  assert.equal(getClientIpFromHeaders(headers), "203.0.113.9");
});

test("lockout progresiv fillon pas tentativave të përsëritura", () => {
  assert.equal(getLockMinutes(4), 0);
  assert.equal(getLockMinutes(5), 5);
  assert.equal(getLockMinutes(6), 15);
  assert.equal(getLockMinutes(8), 60);
});

test("account lock kontrollon lockedUntil", () => {
  assert.equal(isAccountLocked({ lockedUntil: new Date(Date.now() + 60000) }), true);
  assert.equal(isAccountLocked({ lockedUntil: new Date(Date.now() - 60000) }), false);
});

test("politikat kritike ekzistojnë", () => {
  for (const key of ["loginIp", "loginIdentifier", "register", "forgotPassword", "resendVerification", "activateAccount", "businessApplication", "marketplaceInquiry", "search"]) {
    assert.ok(RATE_LIMIT_POLICIES[key]);
  }
});
