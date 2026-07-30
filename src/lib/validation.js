export function formDataToObject(formData) {
  if (!(formData instanceof FormData)) {
    return {};
  }

  return Object.fromEntries(formData.entries());
}

export function getFirstValidationMessage(
  error,
  fallbackMessage = "Të dhënat nuk janë të vlefshme.",
) {
  const firstIssue = error?.issues?.[0];

  return firstIssue?.message ?? fallbackMessage;
}

export function getFieldErrors(error) {
  if (!error) {
    return {};
  }

  const flattenedErrors = error.flatten().fieldErrors;

  const fieldErrors = {};

  for (const [fieldName, messages] of Object.entries(flattenedErrors)) {
    const firstMessage = Array.isArray(messages) ? messages[0] : null;

    if (firstMessage) {
      fieldErrors[fieldName] = firstMessage;
    }
  }

  return fieldErrors;
}

export function validateFormData(schema, formData) {
  const rawData = formDataToObject(formData);

  const result = schema.safeParse(rawData);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      error: null,
      fieldErrors: {},
    };
  }

  return {
    success: false,
    data: null,
    error: result.error,
    fieldErrors: getFieldErrors(result.error),
  };
}

export function validateObject(schema, input) {
  const result = schema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      error: null,
      fieldErrors: {},
    };
  }

  return {
    success: false,
    data: null,
    error: result.error,
    fieldErrors: getFieldErrors(result.error),
  };
}
