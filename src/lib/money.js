import { Prisma } from "@prisma/client";

export const MONEY_SCALE = 2;
export const QUANTITY_SCALE = 3;

function normalizeDecimalInput(value, fallback = "0") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (value instanceof Prisma.Decimal) {
    return value.toString();
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    return String(value);
  }

  const normalized = String(value).trim().replace(",", ".");

  return normalized || fallback;
}

export function toDecimal(value, fallback = "0") {
  try {
    return new Prisma.Decimal(normalizeDecimalInput(value, fallback));
  } catch {
    return new Prisma.Decimal(fallback);
  }
}

export function toMoney(value, fallback = "0") {
  return toDecimal(value, fallback).toDecimalPlaces(
    MONEY_SCALE,
    Prisma.Decimal.ROUND_HALF_UP,
  );
}

export function toQuantity(value, fallback = "0") {
  return toDecimal(value, fallback).toDecimalPlaces(
    QUANTITY_SCALE,
    Prisma.Decimal.ROUND_HALF_UP,
  );
}

export function addMoney(...values) {
  return values
    .reduce(
      (total, value) => total.plus(toMoney(value)),
      new Prisma.Decimal(0),
    )
    .toDecimalPlaces(MONEY_SCALE, Prisma.Decimal.ROUND_HALF_UP);
}

export function subtractMoney(left, right) {
  return toMoney(left)
    .minus(toMoney(right))
    .toDecimalPlaces(MONEY_SCALE, Prisma.Decimal.ROUND_HALF_UP);
}

export function multiplyMoney(value, multiplier) {
  return toDecimal(value)
    .times(toDecimal(multiplier))
    .toDecimalPlaces(MONEY_SCALE, Prisma.Decimal.ROUND_HALF_UP);
}

export function divideMoney(value, divisor) {
  const normalizedDivisor = toDecimal(divisor);

  if (normalizedDivisor.isZero()) {
    throw new RangeError("Pjestimi me zero nuk lejohet.");
  }

  return toDecimal(value)
    .dividedBy(normalizedDivisor)
    .toDecimalPlaces(MONEY_SCALE, Prisma.Decimal.ROUND_HALF_UP);
}

export function compareMoney(left, right) {
  return toMoney(left).comparedTo(toMoney(right));
}

export function isMoneyGreaterThan(left, right) {
  return compareMoney(left, right) > 0;
}

export function isMoneyGreaterThanOrEqual(left, right) {
  return compareMoney(left, right) >= 0;
}

export function isMoneyLessThan(left, right) {
  return compareMoney(left, right) < 0;
}

export function isMoneyZero(value) {
  return toMoney(value).isZero();
}

export function moneyToString(value) {
  return toMoney(value).toFixed(MONEY_SCALE);
}

export function quantityToString(value) {
  return toQuantity(value).toFixed(QUANTITY_SCALE);
}

export function moneyToNumber(value) {
  const numericValue = Number(moneyToString(value));

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function quantityToNumber(value) {
  const numericValue = Number(quantityToString(value));

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function serializeMoney(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return moneyToString(value);
}

export function serializeQuantity(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return quantityToString(value);
}

export function formatMoney(
  value,
  {
    currency = "ALL",
    locale = "sq-AL",
    minimumFractionDigits = 0,
    maximumFractionDigits = MONEY_SCALE,
  } = {},
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(moneyToNumber(value));
}
