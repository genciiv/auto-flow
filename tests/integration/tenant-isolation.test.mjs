import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("business mutations marrin businessId nga server context", async () => {
  const files = [
    "src/actions/customer-actions.js",
    "src/actions/vehicle-actions.js",
    "src/actions/service-actions.js",
    "src/actions/invoice-actions.js",
  ];

  for (const file of files) {
    const code = await source(file);
    assert.match(code, /requireBusiness(?:ActionPermission|Context|Feature|Permission)/, file);
    assert.match(code, /businessId/, file);
    assert.doesNotMatch(code, /formData\.get\(["']businessId["']\)/, file);
  }
});

test("queries kritike filtrojnë resurset me businessId", async () => {
  const expectations = [
    ["src/actions/customer-actions.js", /where:\s*\{[\s\S]{0,160}businessId/],
    ["src/actions/vehicle-actions.js", /where:\s*\{[\s\S]{0,180}businessId/],
    ["src/actions/invoice-actions.js", /where:\s*\{[\s\S]{0,180}businessId/],
    ["src/actions/service-actions.js", /where:\s*\{[\s\S]{0,180}businessId/],
  ];

  for (const [file, pattern] of expectations) {
    assert.match(await source(file), pattern, file);
  }
});

test("customer portal izolon të dhënat me profileId nga session context", async () => {
  const files = [
    "src/app/customer/vehicles/actions.js",
    "src/app/customer/vehicles/claim-actions.js",
  ];

  for (const file of files) {
    const code = await source(file);
    assert.match(code, /requireCustomerActionContext/, file);
    assert.match(code, /profileId|userId/, file);
    assert.doesNotMatch(code, /formData\.get\(["']profileId["']\)/, file);
  }
});
