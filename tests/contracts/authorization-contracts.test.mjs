import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const invoiceSource = await readFile(
  new URL("../../src/actions/invoice-actions.js", import.meta.url),
  "utf8",
);

test("invoice actions kanë permission checks për çdo veprim kritik", () => {
  const permissions = [
    "PERMISSIONS.INVOICES_CREATE",
    "PERMISSIONS.INVOICES_UPDATE",
    "PERMISSIONS.INVOICES_MARK_PAID",
    "PERMISSIONS.INVOICES_DELETE",
  ];

  for (const permission of permissions) {
    assert.match(invoiceSource, new RegExp(permission.replace(".", "\\.")));
  }
});

test("invoice actions marrin business context nga autorizimi server-side", () => {
  assert.match(invoiceSource, /requireBusinessActionPermission/);
  assert.match(
    invoiceSource,
    /normalizedStatus === "PAID"[\s\S]*PERMISSIONS\.INVOICES_MARK_PAID[\s\S]*PERMISSIONS\.INVOICES_UPDATE[\s\S]*requireBusinessActionPermission\(requiredPermission\)/,
  );
  assert.doesNotMatch(invoiceSource, /requireAnyBusinessActionPermission/);
  assert.match(invoiceSource, /const \{ businessId \} = context/);
  assert.doesNotMatch(invoiceSource, /formData\.get\(["']businessId["']\)/);
});

test("invoice mutations trajtojnë gabimet pa i hedhur te klienti", () => {
  assert.match(invoiceSource, /try\s*{/);
  assert.match(invoiceSource, /catch\s*\(error\)/);
  assert.match(invoiceSource, /function getErrorMessage\(error\)/);
  assert.match(invoiceSource, /success:\s*false/);
});
