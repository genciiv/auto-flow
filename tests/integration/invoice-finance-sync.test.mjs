import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("fatura e shënuar si e paguar krijon arkëtimin që mungon", async () => {
  const code = await read("src/actions/invoice-actions.js");

  assert.match(code, /ensurePaidInvoicePayment/);
  assert.match(code, /transaction\.customerPayment\.create/);
  assert.match(code, /invoiceTotal[\s\S]*paidAmount/);
  assert.match(code, /updatedInvoice\.status === "PAID"/);
  assert.match(code, /revalidatePath\("\/dashboard\/finance"\)/);
});

test("paneli financiar ndan faturimin nga arkëtimet reale", async () => {
  const code = await read("src/app/dashboard/finance/page.jsx");

  assert.match(code, /db\.invoice\.aggregate/);
  assert.match(code, /label: "Të faturuara"/);
  assert.match(code, /label: "Të arkëtuara"/);
  assert.match(code, /db\.customerPayment\.aggregate/);
});
