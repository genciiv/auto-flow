import { formatMoney, moneyToNumber } from "./money";

export function formatCurrency(value) {
  const numericValue = moneyToNumber(value);

  if (!Number.isFinite(numericValue)) {
    return "0 Lekë";
  }

  const hasDecimals = !Number.isInteger(numericValue);

  return formatMoney(numericValue, {
    currency: "ALL",
    locale: "sq-AL",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  });
}

export function formatNumber(value) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat("sq-AL", {
    maximumFractionDigits: 0,
  }).format(Math.round(numericValue));
}
