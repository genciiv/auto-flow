import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("fleta e punës mbron totalin, stokun dhe faturën", async () => {
  const [
    laborActions,
    partActions,
    invoiceActions,
    operationsPanel,
    billingGuard,
  ] = await Promise.all([
    readProjectFile("src/actions/service-operation-actions.js"),
    readProjectFile("src/actions/service-part-actions.js"),
    readProjectFile("src/actions/invoice-payment-actions.js"),
    readProjectFile("src/components/services/ServiceOperationsPanel.jsx"),
    readProjectFile("src/lib/service-billing-guard.js"),
  ]);

  assert.match(laborActions, /assertServiceBillingEditable/);

  assert.match(partActions, /removePartFromServiceAction/);
  assert.match(partActions, /SERVICE_OUT/);
  assert.match(partActions, /SERVICE_RETURN/);
  assert.match(partActions, /increment:\s*returnedQuantity/);
  assert.match(partActions, /Nuk ka stok të mjaftueshëm/);

  assert.match(invoiceActions, /if \(service\.invoice\)/);
  assert.match(invoiceActions, /type:\s*"LABOR"/);
  assert.match(invoiceActions, /type:\s*"PART"/);

  assert.match(
    billingGuard,
    /Punët dhe pjesët nuk mund të ndryshohen pas faturimit/,
  );
  assert.match(operationsPanel, /Fleta e punës është mbyllur për faturim/);
  assert.match(operationsPanel, /Hiq pjesën dhe ktheje në stok/);

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
});
