"use server";

import { db } from "@/lib/db";
import { authTokenService } from "@/lib/auth-tokens";
import { EMAIL_CONFIG, passwordResetTemplate, sendEmail } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC_SUCCESS_MESSAGE =
  "Nëse ekziston një llogari me këtë email, do të marrësh udhëzimet për rivendosjen e password-it.";

export async function forgotPasswordAction(previousState, formData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return {
      error: "Vendos adresën e email-it.",
      success: false,
      message: null,
    };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      error: "Vendos një adresë email-i të vlefshme.",
      success: false,
      message: null,
    };
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

  /*
   * Për arsye sigurie nuk tregojmë nëse email-i ekziston.
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
