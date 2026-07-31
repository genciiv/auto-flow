import "server-only";

import { db } from "@/lib/db";

const DEFAULT_TIMEOUT_MS = 3000;

function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error("Health check timed out.")), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

export function runtimeInfo() {
  return {
    service: process.env.OTEL_SERVICE_NAME || "autoflow-web",
    environment: process.env.APP_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    release: process.env.APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || null,
    node: process.version,
  };
}

export async function checkDatabase() {
  const startedAt = performance.now();

  try {
    await withTimeout(db.$queryRaw`SELECT 1`);
    return { status: "up", latencyMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    return {
      status: "down",
      latencyMs: Math.round(performance.now() - startedAt),
      error: "Database unavailable.",
    };
  }
}
