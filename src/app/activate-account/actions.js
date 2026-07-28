"use server";

import bcrypt from "bcryptjs";

import { authTokenService } from "@/lib/auth-tokens";

export async function activateAccountAction(previousState, formData) {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return {
      error: "Linku i aktivizimit nuk është i vlefshëm.",
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
    const result = await authTokenService.activateAccountAndConsume(
      token,
      passwordHash,
    );

    if (!result.valid) {
      const messages = {
        NOT_FOUND: "Linku i aktivizimit nuk është i vlefshëm.",
        USER_DISABLED: "Kjo llogari është çaktivizuar.",
        REVOKED: "Ky link është anuluar.",
        USED: "Ky link është përdorur më parë.",
        EXPIRED: "Linku ka skaduar. Kontakto administratorin.",
        ALREADY_PROCESSED: "Ky link është përpunuar më parë.",
      };

      return {
        error: messages[result.reason] ?? "Llogaria nuk mund të aktivizohej.",
        success: false,
        message: null,
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
      error: "Llogaria nuk mund të aktivizohej. Provo përsëri.",
      success: false,
      message: null,
    };
  }
}
