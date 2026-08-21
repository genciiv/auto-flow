import {
  addMoney,
  subtractMoney,
  toMoney,
} from "@/lib/money";

export function getInvoiceNetRevenue(invoice) {
  return subtractMoney(
    invoice?.total ?? 0,
    invoice?.vatAmount ?? 0,
  );
}

export function getInvoiceCogs(invoice) {
  return (invoice?.service?.partsUsed ?? []).reduce(
    (total, usage) =>
      addMoney(total, usage.costTotal ?? 0),
    toMoney(0),
  );
}

export function sumInvoiceTotals(invoices = []) {
  return invoices.reduce(
    (total, invoice) =>
      addMoney(total, invoice.total ?? 0),
    toMoney(0),
  );
}

export function sumInvoiceNetRevenue(invoices = []) {
  return invoices.reduce(
    (total, invoice) =>
      addMoney(
        total,
        getInvoiceNetRevenue(invoice),
      ),
    toMoney(0),
  );
}

export function sumInvoiceCogs(invoices = []) {
  return invoices.reduce(
    (total, invoice) =>
      addMoney(
        total,
        getInvoiceCogs(invoice),
      ),
    toMoney(0),
  );
}

export function calculateFinanceResults({
  cashIncome = 0,
  operatingExpenses = 0,
  purchases = 0,
  netRevenue = 0,
  cogs = 0,
}) {
  const cashOutflows = addMoney(
    operatingExpenses,
    purchases,
  );

  const cashResult = subtractMoney(
    cashIncome,
    cashOutflows,
  );

  const grossProfit = subtractMoney(
    netRevenue,
    cogs,
  );

  const operatingProfit = subtractMoney(
    grossProfit,
    operatingExpenses,
  );

  return {
    cashOutflows,
    cashResult,
    grossProfit,
    operatingProfit,
  };
}

