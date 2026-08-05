import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("fushat opsionale të pagesës pranojnë undefined", async () => {
  const source = await readFile(
    new URL(
      "../../src/actions/invoice-payment-actions.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /reference:\s*z\.preprocess/,
  );
  assert.match(
    source,
    /notes:\s*z\.preprocess/,
  );
  assert.match(
    source,
    /String\(value \?\? ""\)\.trim\(\)/,
  );
});
