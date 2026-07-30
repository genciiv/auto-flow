"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { validateFormData } from "@/lib/validation";
import { loginSchema } from "@/schemas/auth-schema";

const emptyLoginState = {
  error: null,
  code: null,
  email: null,
};

export async function loginAction(previousState, formData) {
  const validationResult = validateFormData(loginSchema, formData);

  if (!validationResult.success) {
    return {
      ...emptyLoginState,
      error: "Plotëso email-in dhe password-in.",
    };
  }

  const { email, password } = validationResult.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/auth/redirect",
    });

    return {
      ...emptyLoginState,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (
        error.type === "CredentialsSignin" &&
        error.code === "email_not_verified"
      ) {
        return {
          error:
            "Email-i yt nuk është verifikuar. Kontrollo email-in ose kërko një link të ri.",
          code: "EMAIL_NOT_VERIFIED",
          email,
        };
      }

      if (error.type === "CredentialsSignin") {
        return {
          error: "Email-i ose password-i është i pasaktë.",
          code: "INVALID_CREDENTIALS",
          email: null,
        };
      }

      return {
        error: "Nuk ishte e mundur të kryhej hyrja.",
        code: "AUTH_ERROR",
        email: null,
      };
    }

    /**
     * Redirect-i i Auth.js hidhet si një exception i veçantë.
     * Për këtë arsye gabimet që nuk janë AuthError
     * duhet të vazhdojnë të hidhen.
     */
    throw error;
  }
}
