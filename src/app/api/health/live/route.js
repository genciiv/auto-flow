import { apiSuccess } from "@/lib/api-response";
import { runtimeInfo } from "@/lib/health";

export const dynamic = "force-dynamic";

export function GET() {
  return apiSuccess({
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      ...runtimeInfo(),
    },
    headers: {
      "cache-control": "no-store",
    },
  });
}
