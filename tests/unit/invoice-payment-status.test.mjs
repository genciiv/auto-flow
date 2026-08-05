import assert from "node:assert/strict";
import test from "node:test";

import {
  getInvoicePaymentSummary,
  INVOICE_PAYMENT_STATUS,
} from "../../src/lib/invoice-payment-status.js";

test("fatura pa pagesa shfaqet e papaguar", () => {
  const summary = getInvoicePaymentSummary({
    status: "UNPAID",
    total: "100.00",
    customerPayments: [],
  });

  assert.equal(summary.status, INVOICE_PAYMENT_STATUS.UNPAID);
  assert.equal(summary.paid.toFixed(2), "0.00");
  assert.equal(summary.remaining.toFixed(2), "100.00");
});

test("pagesa e pjesshme llogarit paguar dhe mbetur me Decimal", () => {
  const summary = getInvoicePaymentSummary({
    status: "UNPAID",
    total: "100.00",
    customerPayments: [
      { amount: "20.10" },
      { amount: "30.20" },
    ],
  });

  assert.equal(summary.status, INVOICE_PAYMENT_STATUS.PARTIALLY_PAID);
  assert.equal(summary.paid.toFixed(2), "50.30");
  assert.equal(summary.remaining.toFixed(2), "49.70");
});

test("pagesa e plotë shfaq faturën të paguar", () => {
  const summary = getInvoicePaymentSummary({
    status: "PAID",
    total: "100.00",
    customerPayments: [{ amount: "100.00" }],
  });

  assert.equal(summary.status, INVOICE_PAYMENT_STATUS.PAID);
  assert.equal(summary.remaining.toFixed(2), "0.00");
});

test("mbipagesa nuk prodhon detyrim negativ në UI", () => {
  const summary = getInvoicePaymentSummary({
    status: "PAID",
    total: "100.00",
    customerPayments: [{ amount: "100.01" }],
  });

  assert.equal(summary.status, INVOICE_PAYMENT_STATUS.PAID);
  assert.equal(summary.remaining.toFixed(2), "0.00");
});

test("shërbimi pa faturë ka status financiar të veçantë", () => {
  const summary = getInvoicePaymentSummary(null);

  assert.equal(summary.status, INVOICE_PAYMENT_STATUS.NO_INVOICE);
});
