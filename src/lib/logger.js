import "server-only";

const LOG_LEVELS = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40 });
const SENSITIVE_KEY = /(authorization|cookie|password|secret|token|api[-_]?key|database_url|email)/i;

function configuredLevel() {
  const value = String(process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug")).toLowerCase();
  return LOG_LEVELS[value] ? value : "info";
}

function redact(value, seen = new WeakSet()) {
  if (value == null || typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return serializeError(value);
  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => redact(item, seen));

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : redact(item, seen),
    ]),
  );
}

export function serializeError(error) {
  if (!(error instanceof Error)) return { message: String(error) };

  return {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    cause: error.cause instanceof Error ? serializeError(error.cause) : undefined,
  };
}

function write(level, event, context = {}) {
  if (LOG_LEVELS[level] < LOG_LEVELS[configuredLevel()]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: process.env.OTEL_SERVICE_NAME || "autoflow-web",
    environment: process.env.APP_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    event,
    release: process.env.APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || null,
    ...redact(context),
  };

  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = Object.freeze({
  debug: (event, context) => write("debug", event, context),
  info: (event, context) => write("info", event, context),
  warn: (event, context) => write("warn", event, context),
  error: (event, context) => write("error", event, context),
});
