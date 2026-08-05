import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("totali i shërbimit rillogaritet vetëm nga punët dhe pjesët", async () => {
  const [totalHelper, laborActions, partActions, invoiceActions, servicePage] =
    await Promise.all([
      readProjectFile("src/lib/service-total.js"),
      readProjectFile("src/actions/service-operation-actions.js"),
      readProjectFile("src/actions/service-part-actions.js"),
      readProjectFile("src/actions/invoice-payment-actions.js"),
      readProjectFile("src/app/dashboard/services/[id]/page.jsx"),
    ]);

  assert.match(totalHelper, /serviceLaborItem\.aggregate/);

  assert.match(totalHelper, /servicePartUsage\.aggregate/);

  assert.match(totalHelper, /data:\s*\{\s*total\s*\}/);

  assert.match(
    laborActions,
    /recalculateServiceTotal\(transaction, service\.id\)/,
  );

  assert.match(
    laborActions,
    /recalculateServiceTotal\(transaction, serviceId\)/,
  );

  assert.match(
    partActions,
    /recalculateServiceTotal\(transaction, service\.id\)/,
  );

  assert.match(
    partActions,
    /recalculateServiceTotal\(transaction, serviceId\)/,
  );

  assert.match(invoiceActions, /await recalculateServiceTotal/);

  assert.match(servicePage, /calculateServiceLinesTotal/);

  assert.doesNotMatch(
    laborActions,
    /serviceRecord\.update\([\s\S]{0,350}increment:\s*total/,
  );

  assert.doesNotMatch(
    laborActions,
    /serviceRecord\.update\([\s\S]{0,350}decrement:\s*/,
  );

  assert.doesNotMatch(
    partActions,
    /serviceRecord\.update\([\s\S]{0,350}increment:\s*total/,
  );

  assert.doesNotMatch(
    partActions,
    /serviceRecord\.update\([\s\S]{0,350}decrement:\s*/,
  );
});
