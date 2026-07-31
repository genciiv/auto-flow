import { auth } from "@/auth";
import { apiError, apiFailure, apiSuccess } from "@/lib/api-response";
import { EMAIL_CONFIG, emailLayout, sendEmail } from "@/lib/email";
import { ERROR_CODES, logServerError } from "@/lib/errors";
import { getRequestId } from "@/lib/request-context";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { testEmailSchema } from "@/schemas/api-schema";

export async function POST(request) {
  const requestId = getRequestId(request);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiFailure({ code: ERROR_CODES.UNAUTHENTICATED, message: "Duhet të identifikohesh.", status: 401, requestId });
    }

    if (session.user.globalRole !== "PLATFORM_ADMIN") {
      return apiFailure({ code: ERROR_CODES.FORBIDDEN, message: "Nuk ke leje për të testuar sistemin e email-eve.", status: 403, requestId });
    }

    if (
      process.env.NODE_ENV === "production" &&
      process.env.ENABLE_TEST_EMAIL_API !== "true"
    ) {
      return apiFailure({
        code: ERROR_CODES.NOT_FOUND,
        message: "Burimi nuk u gjet.",
        status: 404,
        requestId,
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return apiFailure({ code: ERROR_CODES.INVALID_JSON, message: "Të dhënat JSON nuk janë të vlefshme.", status: 400, requestId });
    }

    const validationResult = validateObject(testEmailSchema, body);
    if (!validationResult.success) {
      return apiFailure({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: getFirstValidationMessage(validationResult.error, "Kontrollo të dhënat e email-it."),
        fieldErrors: validationResult.fieldErrors,
        status: 400,
        requestId,
      });
    }

    const { email, name } = validationResult.data;
    const html = emailLayout({
      name: name || "Administrator",
      title: "Test email nga AutoFlow",
      content: "Sistemi i email-eve është lidhur me sukses.",
      buttonText: "Hap AutoFlow",
      buttonUrl: EMAIL_CONFIG.appUrl,
    });

    const result = await sendEmail({ to: email, subject: "Test email", html });
    return apiSuccess({ data: result, message: "Email-i testues u dërgua.", requestId });
  } catch (error) {
    logServerError("api/test-email", error, null, requestId);
    return apiError(error, {
      requestId,
      fallbackMessage: "Email-i testues nuk mund të dërgohej.",
    });
  }
}
