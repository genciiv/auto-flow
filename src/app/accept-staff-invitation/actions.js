"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { acceptStaffInvitation } from "@/services/staff-service";

export async function acceptInvitationAction(formData) {
  const token = String(formData.get("token") || "");
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`/accept-staff-invitation?token=${token}`)}`);
  await acceptStaffInvitation({ token, userId: session.user.id, userEmail: session.user.email });
  redirect("/dashboard");
}
