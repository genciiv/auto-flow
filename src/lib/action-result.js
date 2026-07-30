import { ERROR_CODES, normalizeError } from "@/lib/errors";
import { getFieldErrors, getFirstValidationMessage } from "@/lib/validation";

export function actionSuccess({
  message = null,
  data = null,
  code = null,
} = {}) {
  return {
    success: true,
    code,
    message,
    fieldErrors: {},
    data,

    /*
     * Compatibility gjatë migrimit.
     * Hiqen pasi të përditësohen të gjitha format.
     */
    error: null,
    errors: {},
  };
}

export function actionFailure({
  code = ERROR_CODES.INTERNAL_ERROR,
  message = "Ndodhi një gabim i papritur. Provo përsëri.",
  fieldErrors = {},
  data = null,
} = {}) {
  return {
    success: false,
    code,
    message,
    fieldErrors,
    data,

    /*
     * Compatibility me komponentët ekzistues.
     */
    error: message,
    errors: fieldErrors,
  };
}

export function validationFailure(
  validationError,
  { message = "Kontrollo të dhënat e formularit." } = {},
) {
  return actionFailure({
    code: ERROR_CODES.VALIDATION_ERROR,

    message: getFirstValidationMessage(validationError, message),

    fieldErrors: getFieldErrors(validationError),
  });
}

export function errorFailure(
  error,
  {
    fallbackCode = ERROR_CODES.INTERNAL_ERROR,
    fallbackMessage = "Ndodhi një gabim i papritur. Provo përsëri.",
    fallbackStatus = 500,
  } = {},
) {
  const normalizedError = normalizeError(error, {
    fallbackCode,
    fallbackMessage,
    fallbackStatus,
  });

  return actionFailure({
    code: normalizedError.code,
    message: normalizedError.message,
    fieldErrors: normalizedError.fieldErrors,
  });
}
