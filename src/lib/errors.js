export const ERROR_CODES = Object.freeze({
  // Gabime të përgjithshme
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_JSON: "INVALID_JSON",

  // Autentikim dhe autorizim
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  AUTH_ERROR: "AUTH_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",

  // Regjistrim dhe përdorues
  REGISTRATION_FAILED: "REGISTRATION_FAILED",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  EMAIL_VERIFICATION_SEND_FAILED: "EMAIL_VERIFICATION_SEND_FAILED",
  ACCOUNT_INACTIVE: "ACCOUNT_INACTIVE",

  // Burime dhe konflikte
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  ALREADY_PROCESSED: "ALREADY_PROCESSED",

  // Databaza dhe shërbimet e jashtme
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  EMAIL_SEND_FAILED: "EMAIL_SEND_FAILED",
  STORAGE_ERROR: "STORAGE_ERROR",

  // Aplikimet
  APPLICATION_NOT_FOUND: "APPLICATION_NOT_FOUND",
  APPLICATION_ALREADY_PROCESSED: "APPLICATION_ALREADY_PROCESSED",
  APPLICATION_APPROVAL_FAILED: "APPLICATION_APPROVAL_FAILED",
  APPLICATION_REJECTION_FAILED: "APPLICATION_REJECTION_FAILED",

  // Aktivizimi i llogarisë
  ACTIVATION_NOT_REQUIRED: "ACTIVATION_NOT_REQUIRED",
  ACTIVATION_EMAIL_SEND_FAILED: "ACTIVATION_EMAIL_SEND_FAILED",
  ACTIVATION_EMAIL_RATE_LIMITED: "ACTIVATION_EMAIL_RATE_LIMITED",

  // Biznesi
  BUSINESS_NOT_FOUND: "BUSINESS_NOT_FOUND",
  BUSINESS_INACTIVE: "BUSINESS_INACTIVE",

  // Pagesat
  PAYMENT_METHOD_DISABLED: "PAYMENT_METHOD_DISABLED",
  PAYMENT_NOT_FOUND: "PAYMENT_NOT_FOUND",
  PAYMENT_ALREADY_PROCESSED: "PAYMENT_ALREADY_PROCESSED",

  // Abonimet
  SUBSCRIPTION_NOT_FOUND: "SUBSCRIPTION_NOT_FOUND",
  SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE",

  // Marketplace
  LISTING_NOT_FOUND: "LISTING_NOT_FOUND",
  LISTING_NOT_ACTIVE: "LISTING_NOT_ACTIVE",

  // Vehicle claims
  VEHICLE_CLAIM_NOT_FOUND: "VEHICLE_CLAIM_NOT_FOUND",
  VEHICLE_CLAIM_ALREADY_PROCESSED: "VEHICLE_CLAIM_ALREADY_PROCESSED",
});

export class AppError extends Error {
  constructor({
    code = ERROR_CODES.INTERNAL_ERROR,
    message = "Ndodhi një gabim i papritur.",
    status = 500,
    fieldErrors = {},
    cause = null,
    metadata = null,
  } = {}) {
    super(message);

    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.fieldErrors =
      fieldErrors && typeof fieldErrors === "object" ? fieldErrors : {};
    this.cause = cause;
    this.metadata = metadata;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export function isAppError(error) {
  return error instanceof AppError;
}


export function createActionError(
  message = "Veprimi nuk mund të përfundohej.",
  {
    code = ERROR_CODES.INVALID_INPUT,
    status = 400,
    fieldErrors = {},
    cause = null,
    metadata = null,
  } = {},
) {
  return new AppError({
    code,
    message,
    status,
    fieldErrors,
    cause,
    metadata,
  });
}

export function createValidationError({
  message = "Kontrollo të dhënat e formularit.",
  fieldErrors = {},
} = {}) {
  return new AppError({
    code: ERROR_CODES.VALIDATION_ERROR,
    message,
    status: 400,
    fieldErrors,
  });
}

export function createInvalidInputError(
  message = "Të dhënat e dërguara nuk janë të vlefshme.",
) {
  return new AppError({
    code: ERROR_CODES.INVALID_INPUT,
    message,
    status: 400,
  });
}

export function createUnauthenticatedError(
  message = "Duhet të identifikohesh për të vazhduar.",
) {
  return new AppError({
    code: ERROR_CODES.UNAUTHENTICATED,
    message,
    status: 401,
  });
}

export function createUnauthorizedError(
  message = "Nuk je i autorizuar për këtë veprim.",
) {
  return new AppError({
    code: ERROR_CODES.UNAUTHORIZED,
    message,
    status: 401,
  });
}

export function createForbiddenError(
  message = "Nuk ke leje për të kryer këtë veprim.",
) {
  return new AppError({
    code: ERROR_CODES.FORBIDDEN,
    message,
    status: 403,
  });
}

export function createNotFoundError(
  message = "Burimi i kërkuar nuk u gjet.",
  code = ERROR_CODES.NOT_FOUND,
) {
  return new AppError({
    code,
    message,
    status: 404,
  });
}

export function createConflictError(
  message = "Ky veprim nuk mund të kryhet për shkak të një konflikti.",
  code = ERROR_CODES.CONFLICT,
) {
  return new AppError({
    code,
    message,
    status: 409,
  });
}

export function createInternalError(
  message = "Ndodhi një gabim i papritur. Provo përsëri.",
) {
  return new AppError({
    code: ERROR_CODES.INTERNAL_ERROR,
    message,
    status: 500,
  });
}

function normalizePrismaError(error) {
  if (!error || typeof error !== "object") {
    return null;
  }

  switch (error.code) {
    case "P2002":
      return new AppError({
        code: ERROR_CODES.ALREADY_EXISTS,
        message: "Ekziston tashmë një rekord me këto të dhëna.",
        status: 409,
        cause: error,
      });

    case "P2003":
      return new AppError({
        code: ERROR_CODES.CONFLICT,
        message:
          "Veprimi nuk mund të kryhet sepse rekordi lidhet me të dhëna të tjera.",
        status: 409,
        cause: error,
      });

    case "P2014":
      return new AppError({
        code: ERROR_CODES.CONFLICT,
        message: "Veprimi cenon një lidhje të detyrueshme mes të dhënave.",
        status: 409,
        cause: error,
      });

    case "P2024":
      return new AppError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: "Databaza është përkohësisht e zënë. Provo përsëri.",
        status: 503,
        cause: error,
      });

    case "P2025":
      return new AppError({
        code: ERROR_CODES.NOT_FOUND,
        message: "Rekordi që po kërkon nuk u gjet.",
        status: 404,
        cause: error,
      });

    case "P2034":
      return new AppError({
        code: ERROR_CODES.CONFLICT,
        message: "Veprimi pati konflikt me një proces tjetër. Provo përsëri.",
        status: 409,
        cause: error,
      });

    default:
      return null;
  }
}

export function normalizeError(
  error,
  {
    fallbackCode = ERROR_CODES.INTERNAL_ERROR,

    fallbackMessage = "Ndodhi një gabim i papritur. Provo përsëri.",

    fallbackStatus = 500,
  } = {},
) {
  if (isAppError(error)) {
    return error;
  }

  const prismaError = normalizePrismaError(error);

  if (prismaError) {
    return prismaError;
  }

  return new AppError({
    code: fallbackCode,
    message: fallbackMessage,
    status: fallbackStatus,
    cause: error,
  });
}

export function logServerError(context, error, metadata = null, requestId = null) {
  const normalizedError = normalizeError(error);

  const originalError = error instanceof Error ? error : null;

  console.error(`[${context}]`, {
    name: originalError?.name || normalizedError.name,

    code: error?.code || normalizedError.code,

    message: originalError?.message || normalizedError.message,

    status: normalizedError.status,

    metadata,

    requestId,

    stack:
      process.env.NODE_ENV === "development" ? originalError?.stack : undefined,

    cause:
      process.env.NODE_ENV === "development"
        ? normalizedError.cause
        : undefined,
  });
}

export function isNextRedirectError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }

  return (
    error?.digest?.startsWith?.("NEXT_REDIRECT") ||
    error?.message === "NEXT_REDIRECT"
  );
}

export function isNextNotFoundError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }

  return (
    error?.digest === "NEXT_HTTP_ERROR_FALLBACK;404" ||
    error?.message === "NEXT_NOT_FOUND"
  );
}

export function getErrorStatus(error) {
  const normalizedError = normalizeError(error);

  return normalizedError.status;
}

export function getErrorCode(error) {
  const normalizedError = normalizeError(error);

  return normalizedError.code;
}

export function getErrorMessage(
  error,
  fallbackMessage = "Ndodhi një gabim i papritur. Provo përsëri.",
) {
  if (isAppError(error)) {
    return error.message;
  }

  return fallbackMessage;
}
