import {
  addMoney,
  subtractMoney,
  toMoney,
} from "@/lib/money";

export const INVOICE_PAYMENT_STATUS = {
  NO_INVOICE: "NO_INVOICE",
  UNPAID: "UNPAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
};

export function getInvoicePaymentSummary(invoice) {
  if (!invoice) {
    return {
      status: INVOICE_PAYMENT_STATUS.NO_INVOICE,
      total: toMoney(0),
      paid: toMoney(0),
      remaining: toMoney(0),
    };
  }

  const total = toMoney(invoice.total ?? 0);
  const paid = (invoice.customerPayments ?? []).reduce(
    (sum, payment) => addMoney(sum, payment.amount),
    toMoney(0),
  );

  const calculatedRemaining = subtractMoney(total, paid);
  const remaining = calculatedRemaining.lt(0)
    ? toMoney(0)
    : calculatedRemaining;

  let status = INVOICE_PAYMENT_STATUS.UNPAID;

  if (invoice.status === "PAID" || remaining.eq(0)) {
    status = INVOICE_PAYMENT_STATUS.PAID;
  } else if (paid.gt(0)) {
    status = INVOICE_PAYMENT_STATUS.PARTIALLY_PAID;
  }

  return {
    status,
    total,
    paid,
    remaining,
  };
}
