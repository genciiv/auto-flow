import { createActionError, ERROR_CODES } from "@/lib/errors";

const SERIALIZABLE_RETRY_CODES = new Set(["P2002", "P2028", "P2034"]);

export async function runSerializableServicePartTransaction(
  database,
  operation,
  { maxAttempts = 3 } = {},
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await database.$transaction(operation, {
        isolationLevel: "Serializable",
      });
    } catch (error) {
      lastError = error;

      if (
        !SERIALIZABLE_RETRY_CODES.has(error?.code) ||
        attempt === maxAttempts
      ) {
        throw error;
      }
    }
  }

  throw createActionError(
    "Veprimi i stokut nuk mund të përfundohej pas disa tentativave.",
    {
      code: ERROR_CODES.CONFLICT,
      status: 409,
      cause: lastError,
    },
  );
}
