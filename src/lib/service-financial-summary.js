import {
  addMoney,
  serializeMoney,
  toMoney,
} from "@/lib/money";
import {
  getInvoicePaymentSummary,
  INVOICE_PAYMENT_STATUS,
} from "@/lib/invoice-payment-status";

export function getServiceFinancialSummary(services = []) {
  const initial = {
    totalServices: services.length,
    noInvoiceServices: 0,
    unpaidServices: 0,
    partiallyPaidServices: 0,
    paidServices: 0,
    serviceValue: toMoney(0),
    invoicedValue: toMoney(0),
    collectedValue: toMoney(0),
    outstandingValue: toMoney(0),
  };

  const summary = services.reduce((result, service) => {
    const payment = getInvoicePaymentSummary(service.invoice);

    result.serviceValue = addMoney(result.serviceValue, service.total ?? 0);
    result.invoicedValue = addMoney(result.invoicedValue, payment.total);
    result.collectedValue = addMoney(result.collectedValue, payment.paid);
    result.outstandingValue = addMoney(
      result.outstandingValue,
      payment.remaining,
    );

    if (payment.status === INVOICE_PAYMENT_STATUS.PAID) {
      result.paidServices += 1;
    } else if (
      payment.status === INVOICE_PAYMENT_STATUS.PARTIALLY_PAID
    ) {
      result.partiallyPaidServices += 1;
    } else if (payment.status === INVOICE_PAYMENT_STATUS.UNPAID) {
      result.unpaidServices += 1;
    } else {
      result.noInvoiceServices += 1;
    }

    return result;
  }, initial);

  return {
    ...summary,
    serviceValue: serializeMoney(summary.serviceValue),
    invoicedValue: serializeMoney(summary.invoicedValue),
    collectedValue: serializeMoney(summary.collectedValue),
    outstandingValue: serializeMoney(summary.outstandingValue),
  };
}
