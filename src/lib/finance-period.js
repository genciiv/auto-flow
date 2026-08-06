import { APP_TIME_ZONE } from "./date-time";
import { zonedDateTimeToUtc } from "./financial-period";
import { formatMoney } from "./money";

function getAppDateParts(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function toInputDate(value) {
  const parts = getAppDateParts(value);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function parseFinancePeriod(searchParams = {}) {
  const nowParts = getAppDateParts();
  const preset = String(searchParams.preset || "month");

  let startParts;
  let endExclusiveParts;

  if (preset === "quarter") {
    const quarterStartMonth = Math.floor((nowParts.month - 1) / 3) * 3 + 1;
    startParts = { year: nowParts.year, month: quarterStartMonth, day: 1 };
    const nextQuarterMonthIndex = quarterStartMonth - 1 + 3;
    endExclusiveParts = {
      year: nowParts.year + Math.floor(nextQuarterMonthIndex / 12),
      month: (nextQuarterMonthIndex % 12) + 1,
      day: 1,
    };
  } else if (preset === "year") {
    startParts = { year: nowParts.year, month: 1, day: 1 };
    endExclusiveParts = { year: nowParts.year + 1, month: 1, day: 1 };
  } else if (preset === "custom" && searchParams.start && searchParams.end) {
    startParts = parseDateInput(searchParams.start);
    const endParts = parseDateInput(searchParams.end);
    if (endParts) {
      const endDate = new Date(Date.UTC(endParts.year, endParts.month - 1, endParts.day + 1));
      endExclusiveParts = {
        year: endDate.getUTCFullYear(),
        month: endDate.getUTCMonth() + 1,
        day: endDate.getUTCDate(),
      };
    }
  } else {
    startParts = { year: nowParts.year, month: nowParts.month, day: 1 };
    const nextMonthIndex = nowParts.month;
    endExclusiveParts = {
      year: nowParts.year + Math.floor(nextMonthIndex / 12),
      month: (nextMonthIndex % 12) + 1,
      day: 1,
    };
  }

  if (!startParts || !endExclusiveParts) {
    throw new Error("Periudha nuk është e vlefshme.");
  }

  const start = zonedDateTimeToUtc(startParts);
  const endExclusive = zonedDateTimeToUtc(endExclusiveParts);

  if (Number.isNaN(start.getTime()) || Number.isNaN(endExclusive.getTime()) || start >= endExclusive) {
    throw new Error("Periudha nuk është e vlefshme.");
  }

  return {
    preset,
    start,
    end: new Date(endExclusive.getTime() - 1),
    endExclusive,
    startInput: toInputDate(start),
    endInput: toInputDate(new Date(endExclusive.getTime() - 1)),
  };
}

export function money(value, currency = "ALL") {
  return formatMoney(value, {
    currency,
    locale: "sq-AL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
