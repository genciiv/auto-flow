import { redirect } from "next/navigation";

import { auth } from "@/auth";

function getDestination(user) {
  if (user?.globalRole === "PLATFORM_ADMIN") {
    return "/admin";
  }

  /*
   * Aksesi në biznes ka përparësi ndaj portalit
   * të klientit.
   */
  if (user?.businessId && user?.businessRole) {
    return "/dashboard";
  }

  if (user?.globalRole === "CUSTOMER") {
    return "/customer/dashboard";
  }

  return "/login?error=no-access";
}

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getDestination(session.user));
}
