import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(file) {
  return readFile(new URL(`../../${file}`, import.meta.url), "utf8");
}

test("login përdor dummy bcrypt hash kundër user enumeration", async () => {
  const auth = await source("src/auth.js");

  assert.match(auth, /DUMMY_PASSWORD_HASH/);
  assert.match(auth, /await bcrypt\.compare\(password, passwordHash\)/);

  const compareIndex = auth.indexOf("await bcrypt.compare(password, passwordHash)");
  const missingUserIndex = auth.indexOf("if (!user || !user.isActive || !user.passwordHash)");
  assert.ok(compareIndex !== -1 && compareIndex < missingUserIndex);
});

test("email verification kontrollohet vetëm pas password-it të saktë", async () => {
  const auth = await source("src/auth.js");
  const passwordCheck = auth.indexOf("if (!passwordIsValid)");
  const emailVerification = auth.indexOf("if (!user.emailVerified)");

  assert.ok(passwordCheck !== -1 && emailVerification > passwordCheck);
});

test("API routes përdorin kontratën, requestId dhe logim të kontrolluar", async () => {
  const routes = [
    "src/app/api/search/route.js",
    "src/app/api/test-email/route.js",
    "src/app/api/debug-session/route.js",
  ];

  for (const route of routes) {
    const content = await source(route);
    assert.match(content, /getRequestId\(request\)/, `${route}: requestId mungon`);
    assert.match(content, /api(Success|Failure|Error)/, `${route}: API contract mungon`);
    assert.match(content, /logServerError/, `${route}: server logging mungon`);
  }
});

test("debug dhe test-email endpoints janë të mbyllura në production", async () => {
  const debugRoute = await source("src/app/api/debug-session/route.js");
  const testEmailRoute = await source("src/app/api/test-email/route.js");

  assert.match(debugRoute, /process\.env\.NODE_ENV === "production"/);
  assert.match(testEmailRoute, /process\.env\.ENABLE_TEST_EMAIL_API !== "true"/);
  assert.match(testEmailRoute, /PLATFORM_ADMIN/);
});

test("security headers përmbajnë mbrojtjet kryesore", async () => {
  const headers = await source("src/lib/security-headers.mjs");
  const required = [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ];

  for (const header of required) {
    assert.match(headers, new RegExp(header));
  }
});
