"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import {
  getFirstValidationMessage,
  validateFormData,
} from "@/lib/validation";
import { acceptStaffInvitation } from "@/services/staff-service";

const acceptInvitationSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Token-i i ftesës mungon."),
});

export async function acceptInvitationAction(formData) {
  const validationResult = validateFormData(
    acceptInvitationSchema,
    formData,
  );

  if (!validationResult.success) {
    const message = getFirstValidationMessage(
      validationResult.error,
      "Ftesa nuk është e vlefshme.",
    );

    redirect(
      `/accept-staff-invitation?error=${encodeURIComponent(message)}`,
    );
  }

  const { token } = validationResult.data;

  const session = await auth();

  if (!session?.user?.id) {
    const callbackUrl =
      `/accept-staff-invitation?token=${encodeURIComponent(token)}`;

    redirect(
      `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  }

  await acceptStaffInvitation({
    token,
    userId: session.user.id,
    userEmail: session.user.email,
  });

  redirect("/dashboard");
}