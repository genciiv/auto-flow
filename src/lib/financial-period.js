import { APP_TIME_ZONE } from "@/lib/date-time";

function getZonedParts(date, timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function getTimeZoneOffset(date, timeZone = APP_TIME_ZONE) {
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - date.getTime();
}

export function zonedDateTimeToUtc(
  { year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0 },
  timeZone = APP_TIME_ZONE,
) {
  const utcGuess = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    millisecond,
  );

  let result = new Date(utcGuess);
  let offset = getTimeZoneOffset(result, timeZone);
  result = new Date(utcGuess - offset);

  const correctedOffset = getTimeZoneOffset(result, timeZone);
  if (correctedOffset !== offset) {
    result = new Date(utcGuess - correctedOffset);
  }

  return result;
}

export function getAppMonthRange(referenceDate = new Date(), offset = 0) {
  const current = getZonedParts(referenceDate);
  const monthIndex = current.month - 1 + offset;
  const normalizedYear = current.year + Math.floor(monthIndex / 12);
  const normalizedMonth = ((monthIndex % 12) + 12) % 12;
  const nextMonthIndex = normalizedMonth + 1;
  const nextYear = normalizedYear + Math.floor(nextMonthIndex / 12);
  const nextMonth = nextMonthIndex % 12;

  return {
    start: zonedDateTimeToUtc({
      year: normalizedYear,
      month: normalizedMonth + 1,
      day: 1,
    }),
    endExclusive: zonedDateTimeToUtc({
      year: nextYear,
      month: nextMonth + 1,
      day: 1,
    }),
    year: normalizedYear,
    month: normalizedMonth + 1,
  };
}

export function getAppMonthKey(value) {
  const parts = getZonedParts(new Date(value));
  return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
}
