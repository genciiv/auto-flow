import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("faqja e klientëve serializon faturat me Decimal para Client Component", async () => {
  const source = await readFile(
    new URL(
      "../../src/app/dashboard/customers/page.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /const clientCustomers = JSON\.parse\(/,
  );
  assert.match(
    source,
    /JSON\.stringify\(customers\)/,
  );
  assert.match(
    source,
    /customers=\{clientCustomers\}/,
  );
});
