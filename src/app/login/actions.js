"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export async function loginAction(previousState, formData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Plotëso email-in dhe password-in.",
      code: null,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/auth/redirect",
    });

    return {
      error: null,
      code: null,
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
        };
      }

      return {
        error: "Nuk ishte e mundur të kryhej hyrja.",
        code: "AUTH_ERROR",
      };
    }

    throw error;
  }
}
