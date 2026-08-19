import assert from "node:assert/strict";
import test from "node:test";

import { calculateInvoiceTotals } from "../../src/lib/invoice-totals.js";

test("fatura pa TVSH ruan totalin pas zbritjes", () => {
  const result = calculateInvoiceTotals({
    subtotal: 10000,
    discountAmount: 1000,
    vatEnabled: false,
    vatRate: 20,
  });

  assert.equal(result.subtotal.toFixed(2), "10000.00");
  assert.equal(result.discountAmount.toFixed(2), "1000.00");
  assert.equal(result.vatRate.toFixed(2), "0.00");
  assert.equal(result.vatAmount.toFixed(2), "0.00");
  assert.equal(result.total.toFixed(2), "9000.00");
});

test("fatura me TVSH e aplikon TVSH pas zbritjes", () => {
  const result = calculateInvoiceTotals({
    subtotal: 10000,
    discountAmount: 1000,
    vatEnabled: true,
    vatRate: 20,
  });

  assert.equal(result.vatAmount.toFixed(2), "1800.00");
  assert.equal(result.total.toFixed(2), "10800.00");
});

test("zbritja nuk mund të jetë më e madhe se subtotali", () => {
  assert.throws(
    () =>
      calculateInvoiceTotals({
        subtotal: 100,
        discountAmount: 101,
      }),
    /discount cannot exceed subtotal/i,
  );
});

test("norma e TVSH duhet të jetë nga 0 deri në 100", () => {
  assert.throws(
    () =>
      calculateInvoiceTotals({
        subtotal: 100,
        vatEnabled: true,
        vatRate: 101,
      }),
    /VAT rate must be between 0 and 100/i,
  );
});
