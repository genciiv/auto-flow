import { redirect } from "next/navigation";

import { auth } from "@/auth";

function getDestination(user) {
  if (user?.loginPortal === "personal") {
    return user?.globalRole === "CUSTOMER"
      ? "/customer/dashboard"
      : "/login?error=personal-access";
  }

  if (user?.globalRole === "PLATFORM_ADMIN") {
    return "/admin";
  }

  if (user?.businessId && user?.businessRole) {
    return "/dashboard";
  }

  return "/login?error=business-access";
}

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getDestination(session.user));
}
