export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("sq-AL")} Lek`;
}
