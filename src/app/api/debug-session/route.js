import { auth } from "@/auth";
import { apiError, apiFailure, apiSuccess } from "@/lib/api-response";
import { db } from "@/lib/db";
import { ERROR_CODES, logServerError } from "@/lib/errors";
import { getRequestId } from "@/lib/request-context";

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiFailure({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: "Duhet të identifikohesh.",
        status: 401,
        requestId,
      });
    }

    if (process.env.NODE_ENV === "production" || session.user.globalRole !== "PLATFORM_ADMIN") {
      return apiFailure({
        code: ERROR_CODES.NOT_FOUND,
        message: "Burimi nuk u gjet.",
        status: 404,
        requestId,
      });
    }

    const databaseUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        globalRole: true,
        isActive: true,
        sessionVersion: true,
        businesses: {
          where: { isActive: true, business: { isActive: true } },
          select: {
            id: true,
            businessId: true,
            role: true,
            isActive: true,
            business: { select: { id: true, name: true, isActive: true } },
          },
        },
      },
    });

    return apiSuccess({
      data: { authenticated: true, sessionUser: session.user, databaseUser },
      requestId,
    });
  } catch (error) {
    logServerError("api/debug-session", error, null, requestId);
    return apiError(error, { requestId });
  }
}
