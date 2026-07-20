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
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Email-i ose password-i është i pasaktë.",
          };

        default:
          return {
            error: "Nuk ishte e mundur të kryhej hyrja.",
          };
      }
    }

    throw error;
  }
}
