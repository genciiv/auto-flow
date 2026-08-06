import { timingSafeEqual } from "node:crypto";

import { apiError, apiSuccess } from "@/lib/api-response";
import { db } from "@/lib/db";
import { getRequestId } from "@/lib/request-context";
import { getBusinessSubscriptionAccess } from "@/services/subscription-access-service";

function authorized(request) {
  const expected = process.env.CRON_SECRET;
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !received) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(received);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request) {
  const requestId = getRequestId(request);
  try {
    if (!authorized(request)) {
      return new Response(JSON.stringify({ success: false, code: "UNAUTHORIZED", message: "Unauthorized", requestId }), {
        status: 401,
        headers: { "content-type": "application/json", "cache-control": "no-store", "x-request-id": requestId },
      });
    }

    const subscriptions = await db.subscription.findMany({
      where: { status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] } },
      select: { businessId: true },
      distinct: ["businessId"],
      take: 1000,
    });

    const results = await Promise.all(
      subscriptions.map(({ businessId }) => getBusinessSubscriptionAccess(businessId)),
    );

    return apiSuccess({
      requestId,
      data: {
        checked: subscriptions.length,
        accessible: results.filter((result) => result.hasAccess).length,
        blocked: results.filter((result) => !result.hasAccess).length,
      },
    });
  } catch (error) {
    return apiError(error, { request, requestId, fallbackMessage: "Kontrolli periodik i abonimeve dështoi." });
  }
}
