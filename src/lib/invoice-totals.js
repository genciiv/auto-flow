import {
  addMoney,
  isMoneyGreaterThan,
  isMoneyLessThan,
  subtractMoney,
  toDecimal,
  toMoney,
} from "./money.js";

export function calculateInvoiceTotals({
  subtotal,
  discountAmount = 0,
  vatEnabled = false,
  vatRate = 0,
}) {
  const normalizedSubtotal = toMoney(subtotal);
  const normalizedDiscount = toMoney(discountAmount);
  const normalizedVatRate = toDecimal(vatRate).toDecimalPlaces(2);

  if (isMoneyLessThan(normalizedSubtotal, 0)) {
    throw new RangeError("Invoice subtotal cannot be negative.");
  }

  if (isMoneyLessThan(normalizedDiscount, 0)) {
    throw new RangeError("Invoice discount cannot be negative.");
  }

  if (isMoneyGreaterThan(normalizedDiscount, normalizedSubtotal)) {
    throw new RangeError("Invoice discount cannot exceed subtotal.");
  }

  if (normalizedVatRate.lt(0) || normalizedVatRate.gt(100)) {
    throw new RangeError("Invoice VAT rate must be between 0 and 100.");
  }

  const taxableAmount = subtractMoney(
    normalizedSubtotal,
    normalizedDiscount,
  );

  const appliedVatRate = vatEnabled
    ? normalizedVatRate
    : toDecimal(0).toDecimalPlaces(2);

  const vatAmount = vatEnabled
    ? toMoney(
        toDecimal(taxableAmount)
          .times(appliedVatRate)
          .dividedBy(100),
      )
    : toMoney(0);

  const total = addMoney(taxableAmount, vatAmount);

  return {
    subtotal: normalizedSubtotal,
    discountAmount: normalizedDiscount,
    vatEnabled: Boolean(vatEnabled),
    vatRate: appliedVatRate,
    vatAmount,
    total,
  };
}

