"use server";

import bcrypt from "bcryptjs";

import { authTokenService } from "@/lib/auth-tokens";
import { EMAIL_CONFIG, passwordChangedTemplate, sendEmail } from "@/lib/email";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { resetPasswordSchema } from "@/schemas/auth-schema";

const initialResetPasswordState = {
  error: null,
  success: false,
  message: null,
};

const invalidTokenMessages = {
  NOT_FOUND: "Linku i rivendosjes nuk është i vlefshëm.",

  USER_DISABLED: "Kjo llogari është çaktivizuar.",

  REVOKED: "Ky link është anuluar. Kërko një link të ri.",

  USED: "Ky link është përdorur më parë.",

  EXPIRED: "Linku ka skaduar. Kërko një link të ri.",

  ALREADY_PROCESSED: "Ky link është përpunuar më parë.",
};

export async function resetPasswordAction(previousState, formData) {
  const validationResult = validateFormData(resetPasswordSchema, formData);

  if (!validationResult.success) {
    return {
      ...initialResetPasswordState,
      error: getFirstValidationMessage(
        validationResult.error,
        "Password-i nuk mund të ndryshohej.",
      ),
    };
  }

  const { token, password } = validationResult.data;

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await authTokenService.resetPasswordAndConsume(
      token,
      passwordHash,
    );

    if (!result.valid) {
      return {
        ...initialResetPasswordState,
        error:
          invalidTokenMessages[result.reason] ??
          "Password-i nuk mund të ndryshohej.",
      };
    }

    try {
      const loginUrl = `${EMAIL_CONFIG.appUrl}/login`;

      const html = passwordChangedTemplate({
        name: result.user.name,
        loginUrl,
      });

      await sendEmail({
        to: result.user.email,
        subject: "Password-i i llogarisë u ndryshua",
        html,
      });
    } catch (emailError) {
      /*
       * Ndryshimi i password-it ka përfunduar me sukses.
       * Dështimi i email-it njoftues nuk e anulon procesin.
       */
      console.error(
        "Password-i u ndryshua, por email-i njoftues dështoi:",
        emailError,
      );
    }

    return {
      error: null,
      success: true,
      message: "Password-i u ndryshua me sukses. Tani mund të hysh në llogari.",
    };
  } catch (error) {
    console.error("Gabim gjatë rivendosjes së password-it:", error);

    return {
      ...initialResetPasswordState,
      error: "Password-i nuk mund të ndryshohej. Provo përsëri.",
    };
  }
}
