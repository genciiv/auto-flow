export const APP_LOCALE = "sq-AL";
export const APP_TIME_ZONE = "Europe/Tirane";

function normalizeDate(value) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}

export function formatAppDate(value, options = {}) {
  if (!value) {
    return "—";
  }

  const dateOptions = Object.keys(options).length
    ? options
    : { day: "2-digit", month: "short", year: "numeric" };

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    ...dateOptions,
  }).format(normalizeDate(value));
}

export function formatAppTime(value, options = {}) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  }).format(normalizeDate(value));
}

export function formatAppDateTime(value, options = {}) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  }).format(normalizeDate(value));
}

export function formatAppLongDate(value, options = {}) {
  return formatAppDate(value, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}
