import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateFinanceResults,
  getInvoiceCogs,
  getInvoiceNetRevenue,
  sumInvoiceCogs,
  sumInvoiceNetRevenue,
  sumInvoiceTotals,
} from "../../src/lib/finance-metrics.js";
import { moneyToString } from "../../src/lib/money.js";

test("getInvoiceNetRevenue heq TVSH nga totali i faturës", () => {
  const netRevenue = getInvoiceNetRevenue({
    total: "12000.00",
    vatAmount: "2000.00",
  });

  assert.equal(
    moneyToString(netRevenue),
    "10000.00",
  );
});

test("getInvoiceCogs përdor kostot historike të pjesëve", () => {
  const cogs = getInvoiceCogs({
    service: {
      partsUsed: [
        {
          costTotal: "1250.50",
        },
        {
          costTotal: "749.50",
        },
      ],
    },
  });

  assert.equal(
    moneyToString(cogs),
    "2000.00",
  );
});

test("invoice pa service ka COGS zero", () => {
  const cogs = getInvoiceCogs({
    service: null,
  });

  assert.equal(
    moneyToString(cogs),
    "0.00",
  );
});

test("agregimet e faturave llogarisin bruto, neto dhe COGS", () => {
  const invoices = [
    {
      total: "12000.00",
      vatAmount: "2000.00",
      service: {
        partsUsed: [
          {
            costTotal: "3000.00",
          },
        ],
      },
    },
    {
      total: "6000.00",
      vatAmount: "1000.00",
      service: {
        partsUsed: [
          {
            costTotal: "1000.00",
          },
        ],
      },
    },
  ];

  assert.equal(
    moneyToString(
      sumInvoiceTotals(invoices),
    ),
    "18000.00",
  );

  assert.equal(
    moneyToString(
      sumInvoiceNetRevenue(invoices),
    ),
    "15000.00",
  );

  assert.equal(
    moneyToString(
      sumInvoiceCogs(invoices),
    ),
    "4000.00",
  );
});

test("rezultati i arkës dhe fitimi operativ mbeten metrika të ndara", () => {
  const result = calculateFinanceResults({
    cashIncome: "10000.00",
    operatingExpenses: "1000.00",
    purchases: "3000.00",
    netRevenue: "12000.00",
    cogs: "4000.00",
  });

  assert.equal(
    moneyToString(result.cashOutflows),
    "4000.00",
  );

  assert.equal(
    moneyToString(result.cashResult),
    "6000.00",
  );

  assert.equal(
    moneyToString(result.grossProfit),
    "8000.00",
  );

  assert.equal(
    moneyToString(
      result.operatingProfit,
    ),
    "7000.00",
  );
});
