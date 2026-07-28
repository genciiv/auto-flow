"use server";

import bcrypt from "bcryptjs";

import { authTokenService } from "@/lib/auth-tokens";
import { EMAIL_CONFIG, passwordChangedTemplate, sendEmail } from "@/lib/email";

export async function resetPasswordAction(previousState, formData) {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return {
      error: "Linku i rivendosjes nuk është i vlefshëm.",
      success: false,
      message: null,
    };
  }

  if (!password || !confirmPassword) {
    return {
      error: "Plotëso të dyja fushat e password-it.",
      success: false,
      message: null,
    };
  }

  if (password.length < 8) {
    return {
      error: "Password-i duhet të ketë të paktën 8 karaktere.",
      success: false,
      message: null,
    };
  }

  if (password.length > 100) {
    return {
      error: "Password-i është shumë i gjatë.",
      success: false,
      message: null,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Password-et nuk përputhen.",
      success: false,
      message: null,
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await authTokenService.resetPasswordAndConsume(
      token,
      passwordHash,
    );

    if (!result.valid) {
      const messages = {
        NOT_FOUND: "Linku i rivendosjes nuk është i vlefshëm.",

        USER_DISABLED: "Kjo llogari është çaktivizuar.",

        REVOKED: "Ky link është anuluar. Kërko një link të ri.",

        USED: "Ky link është përdorur më parë.",

        EXPIRED: "Linku ka skaduar. Kërko një link të ri.",

        ALREADY_PROCESSED: "Ky link është përpunuar më parë.",
      };

      return {
        error: messages[result.reason] ?? "Password-i nuk mund të ndryshohej.",
        success: false,
        message: null,
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
      error: "Password-i nuk mund të ndryshohej. Provo përsëri.",
      success: false,
      message: null,
    };
  }
}
