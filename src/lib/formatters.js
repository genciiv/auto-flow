import { moneyToNumber } from "./money";

function formatNumericValue(
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = 0,
) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  const roundedValue = numericValue.toFixed(
    maximumFractionDigits,
  );

  let [integerPart, fractionPart = ""] =
    roundedValue.split(".");

  integerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );

  while (
    fractionPart.length > minimumFractionDigits &&
    fractionPart.endsWith("0")
  ) {
    fractionPart = fractionPart.slice(0, -1);
  }

  return fractionPart
    ? `${integerPart}.${fractionPart}`
    : integerPart;
}

export function formatCurrency(value) {
  const numericValue = moneyToNumber(value);

  if (!Number.isFinite(numericValue)) {
    return "0 Lekë";
  }

  const hasDecimals = !Number.isInteger(numericValue);

  const formattedValue = formatNumericValue(
    numericValue,
    hasDecimals ? 2 : 0,
    hasDecimals ? 2 : 0,
  );

  return `${formattedValue} Lekë`;
}

export function formatNumber(value) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return formatNumericValue(
    Math.round(numericValue),
    0,
    0,
  );
}
