export function formatCurrency(value) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue)) {
    return "0 Lekë";
  }

  const hasDecimals = !Number.isInteger(numericValue);

  const formattedValue = numericValue
    .toFixed(hasDecimals ? 2 : 0)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedValue} Lekë`;
}

export function formatNumber(value) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return String(Math.round(numericValue)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
