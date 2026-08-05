import assert from "node:assert/strict";
import test from "node:test";

import { getServiceFinancialSummary } from "../../src/lib/service-financial-summary.js";

test("service financial summary ndan pagesat nga vlera e shërbimeve", () => {
  const summary = getServiceFinancialSummary([
    {
      total: "100.00",
      invoice: {
        status: "PAID",
        total: "100.00",
        customerPayments: [{ amount: "100.00" }],
      },
    },
    {
      total: "80.00",
      invoice: {
        status: "UNPAID",
        total: "80.00",
        customerPayments: [{ amount: "30.00" }],
      },
    },
    {
      total: "50.00",
      invoice: null,
    },
  ]);

  assert.equal(summary.totalServices, 3);
  assert.equal(summary.paidServices, 1);
  assert.equal(summary.partiallyPaidServices, 1);
  assert.equal(summary.noInvoiceServices, 1);
  assert.equal(summary.serviceValue, "230.00");
  assert.equal(summary.collectedValue, "130.00");
  assert.equal(summary.outstandingValue, "50.00");
});
