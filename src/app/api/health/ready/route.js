import { apiFailure, apiSuccess } from "@/lib/api-response";
import { checkDatabase, runtimeInfo } from "@/lib/health";
import { logger } from "@/lib/logger";
import { createRequestId } from "@/lib/request-context";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createRequestId();
  const database = await checkDatabase();
  const ready = database.status === "up";

  const headers = {
  "cache-control": "no-store",
  "x-request-id": requestId,
};

  const data = {
    status: ready ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    ...runtimeInfo(),
    checks: {
      database,
    },
  };

  if (ready) {
    return apiSuccess({
      data,
      requestId,
      headers,
    });
  }

  logger.error("health.readiness.failed", {
    requestId,
    checks: {
      database,
    },
  });

  return apiFailure({
    code: "SERVICE_NOT_READY",
    message: "Shërbimi nuk është ende gati.",
    data,
    requestId,
    status: 503,
    headers,
  });
}
