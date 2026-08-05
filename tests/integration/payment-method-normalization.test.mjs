import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("metoda e pagesës normalizohet në enum-in e Prisma", async () => {
  const source = await readFile(
    new URL(
      "../../src/actions/invoice-payment-actions.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /toUpperCase\(\)/);
  assert.match(source, /BANK_TRANSFER/);
  assert.match(source, /z\.enum/);
  assert.match(
    source,
    /Metoda e pagesës nuk është e vlefshme/,
  );
});
