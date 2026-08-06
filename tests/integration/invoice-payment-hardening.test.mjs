import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("numrat e faturave krijohen brenda transaksionit serializable", async () => {
  const helper = await read("src/lib/invoice-financial-safety.js");
  const invoiceActions = await read("src/actions/invoice-actions.js");
  const paymentActions = await read("src/actions/invoice-payment-actions.js");

  assert.match(helper, /isolationLevel: "Serializable"/);
  assert.match(helper, /nextInvoiceNumberInTransaction/);
  assert.match(helper, /highestSequence \+ 1/);
  assert.match(invoiceActions, /runSerializableInvoiceTransaction/);
  assert.match(invoiceActions, /nextInvoiceNumberInTransaction/);
  assert.match(paymentActions, /nextInvoiceNumberInTransaction/);
});

test("pagesat janë idempotente dhe mbipagesa kontrollohet në transaksion", async () => {
  const code = await read("src/actions/invoice-payment-actions.js");

  assert.match(code, /runSerializableInvoiceTransaction/);
  assert.match(code, /getPaidAndRemaining\(invoice\)/);
  assert.match(code, /payment\.reference === reference/);
  assert.match(code, /Kjo pagesë ishte regjistruar më parë/);
  assert.match(code, /Pagesa tejkalon detyrimin e mbetur/);
  assert.match(code, /remainingAfter\.eq\(0\)/);
});

test("faturat me pagesa ruajnë historikun financiar", async () => {
  const code = await read("src/actions/invoice-actions.js");

  assert.match(code, /Totali i faturës nuk mund të jetë më i vogël se pagesat/);
  assert.match(code, /Një faturë e paguar plotësisht nuk mund të kthehet/);
  assert.match(code, /invoice\._count\.customerPayments > 0/);
  assert.match(code, /nuk mund të fshihet\. Ruaje për historikun financiar/);
  assert.match(code, /logPayment/);
  assert.match(code, /logStatusChange/);
});
