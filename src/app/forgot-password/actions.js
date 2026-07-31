"use server";

import { authTokenService } from "@/lib/auth-tokens";
import { db } from "@/lib/db";
import { EMAIL_CONFIG, passwordResetTemplate, sendEmail } from "@/lib/email";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { forgotPasswordSchema } from "@/schemas/auth-schema";
import { protectPublicAction, rateLimitActionState } from "@/lib/public-action-protection";

const GENERIC_SUCCESS_MESSAGE =
  "Nëse ekziston një llogari me këtë email, do të marrësh udhëzimet për rivendosjen e password-it.";

const initialForgotPasswordState = {
  error: null,
  success: false,
  message: null,
};

export async function forgotPasswordAction(previousState, formData) {
  const validationResult = validateFormData(forgotPasswordSchema, formData);

  if (!validationResult.success) {
    return {
      ...initialForgotPasswordState,
      error: getFirstValidationMessage(
        validationResult.error,
        "Vendos një adresë email-i të vlefshme.",
      ),
    };
  }

  const { email } = validationResult.data;

  try {
    await protectPublicAction("forgotPassword", email);
  } catch (error) {
    return rateLimitActionState(error, initialForgotPasswordState) ?? { ...initialForgotPasswordState, error: "Kërkesa nuk mund të përpunohej." };
  }

  const user = await db.user.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      passwordHash: true,
    },
  });

  /**
   * Për arsye sigurie nuk tregojmë:
   * - nëse email-i ekziston;
   * - nëse llogaria është joaktive;
   * - nëse llogaria nuk ka password.
   */
  if (!user || !user.isActive || !user.passwordHash) {
    return {
      error: null,
      success: true,
      message: GENERIC_SUCCESS_MESSAGE,
    };
  }

  try {
    const token = await authTokenService.createPasswordResetToken(user.id);

    const resetPasswordUrl =
      `${EMAIL_CONFIG.appUrl}/reset-password?token=` +
      encodeURIComponent(token);

    const html = passwordResetTemplate({
      name: user.name,
      resetPasswordUrl,
    });

    await sendEmail({
      to: user.email,
      subject: "Rivendos password-in",
      html,
    });

    return {
      error: null,
      success: true,
      message: GENERIC_SUCCESS_MESSAGE,
    };
  } catch (error) {
    console.error("Gabim gjatë kërkesës për resetimin e password-it:", error);

    return {
      error: "Kërkesa nuk mund të përpunohej. Provo përsëri pas pak.",
      success: false,
      message: null,
    };
  }
}
