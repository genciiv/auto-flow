"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { actionFailure, validationFailure } from "@/lib/action-result";
import { ERROR_CODES, logServerError } from "@/lib/errors";
import { validateFormData } from "@/lib/validation";
import { loginSchema } from "@/schemas/auth-schema";

const emptyLoginState = {
  success: false,
  error: null,
  errors: {},
  code: null,
  message: null,
  fieldErrors: {},
  data: null,
  email: null,
};

function loginFailure({ code, message, email = null, fieldErrors = {} }) {
  return {
    ...actionFailure({
      code,
      message,
      fieldErrors,
    }),

    email,
  };
}

export async function loginAction(previousState, formData) {
  const validationResult = validateFormData(loginSchema, formData);

  if (!validationResult.success) {
    const validationResponse = validationFailure(validationResult.error, {
      message: "Plotëso email-in dhe password-in.",
    });

    return {
      ...emptyLoginState,
      ...validationResponse,
      email: null,
    };
  }

  const { email, password, portalType } = validationResult.data;

  try {
    await signIn("credentials", {
      email,
      password,
      portalType,
      redirectTo: "/auth/redirect",
    });

    /*
     * Në rast normal Auth.js bën redirect dhe kjo pjesë
     * nuk ekzekutohet.
     */
    return {
      ...emptyLoginState,
      success: true,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (
        error.type === "CredentialsSignin" &&
        error.code === "email_not_verified"
      ) {
        return loginFailure({
          code: ERROR_CODES.EMAIL_NOT_VERIFIED,
          message:
            "Email-i yt nuk është verifikuar. Kontrollo email-in ose kërko një link të ri.",
          email,
        });
      }

      if (
        error.type === "CredentialsSignin" &&
        error.code === "personal_access_required"
      ) {
        return loginFailure({
          code: "PERSONAL_ACCESS_REQUIRED",
          message:
            "Kjo llogari nuk ka akses personal. Zgjidh Login Biznes ose regjistro një llogari personale.",
          email,
        });
      }

      if (
        error.type === "CredentialsSignin" &&
        error.code === "business_access_required"
      ) {
        return loginFailure({
          code: "BUSINESS_ACCESS_REQUIRED",
          message:
            "Kjo llogari nuk ka akses në një biznes aktiv. Zgjidh Login Personal ose apliko për biznes.",
          email,
        });
      }

      if (error.type === "CredentialsSignin") {
        return loginFailure({
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: "Email-i ose password-i është i pasaktë.",
        });
      }

      logServerError("loginAction:AuthError", error, {
        email,
        authErrorType: error.type,
        authErrorCode: error.code,
      });

      return loginFailure({
        code: ERROR_CODES.AUTH_ERROR,
        message: "Nuk ishte e mundur të kryhej hyrja.",
      });
    }

    /*
     * Redirect-i i Auth.js hidhet si exception i Next.js.
     * Ai duhet të vazhdojë deri te framework-u.
     */
    if (
      error?.digest?.startsWith?.("NEXT_REDIRECT") ||
      error?.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }

    logServerError("loginAction", error, {
      email,
    });

    return loginFailure({
      code: ERROR_CODES.AUTH_ERROR,
      message: "Nuk ishte e mundur të kryhej hyrja. Provo përsëri.",
    });
  }
}
