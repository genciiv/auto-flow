"use server";

import { signOut } from "@/auth";
import { errorFailure } from "@/lib/action-result";
import { ERROR_CODES, logServerError } from "@/lib/errors";

export async function logoutAction() {
  try {
    await signOut({
      redirectTo: "/login",
    });

    /*
     * Auth.js zakonisht përfundon action-in përmes redirect-it,
     * kështu që kjo përgjigje zakonisht nuk arrihet.
     */
    return {
      success: true,
      code: null,
      message: null,
      fieldErrors: {},
      data: null,
      error: null,
      errors: {},
    };
  } catch (error) {
    /*
     * Redirect-i i Auth.js hidhet si exception.
     * Nuk duhet ta konvertojmë në rezultat gabimi.
     */
    if (
      error?.digest?.startsWith?.("NEXT_REDIRECT") ||
      error?.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }

    logServerError("logoutAction", error);

    return errorFailure(error, {
      fallbackCode: ERROR_CODES.AUTH_ERROR,
      fallbackMessage:
        "Nuk ishte e mundur të dilje nga llogaria. Provo përsëri.",
    });
  }
}
