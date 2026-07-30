"use server";

import bcrypt from "bcryptjs";

import { authTokenService } from "@/lib/auth-tokens";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { activateAccountSchema } from "@/schemas/auth-schema";

const initialActivateAccountState = {
  error: null,
  success: false,
  message: null,
};

const invalidTokenMessages = {
  NOT_FOUND: "Linku i aktivizimit nuk është i vlefshëm.",

  USER_DISABLED: "Kjo llogari është çaktivizuar.",

  REVOKED: "Ky link është anuluar.",

  USED: "Ky link është përdorur më parë.",

  EXPIRED: "Linku ka skaduar. Kontakto administratorin.",

  ALREADY_PROCESSED: "Ky link është përpunuar më parë.",
};

export async function activateAccountAction(previousState, formData) {
  const validationResult = validateFormData(activateAccountSchema, formData);

  if (!validationResult.success) {
    return {
      ...initialActivateAccountState,
      error: getFirstValidationMessage(
        validationResult.error,
        "Llogaria nuk mund të aktivizohej.",
      ),
    };
  }

  const { token, password } = validationResult.data;

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await authTokenService.activateAccountAndConsume(
      token,
      passwordHash,
    );

    if (!result.valid) {
      return {
        ...initialActivateAccountState,
        error:
          invalidTokenMessages[result.reason] ??
          "Llogaria nuk mund të aktivizohej.",
      };
    }

    return {
      error: null,
      success: true,
      message: "Llogaria u aktivizua me sukses. Tani mund të hysh në AutoFlow.",
    };
  } catch (error) {
    console.error("Gabim gjatë aktivizimit të llogarisë:", error);

    return {
      ...initialActivateAccountState,
      error: "Llogaria nuk mund të aktivizohej. Provo përsëri.",
    };
  }
}
