import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

export async function requirePlatformAdmin() {
  const user = await requireUser();

  if (user.globalRole !== "PLATFORM_ADMIN") {
    if (user.businessId && user.businessRole) {
      redirect("/dashboard");
    }

    redirect("/login");
  }

  return user;
}

export async function requireBusinessUser(allowedRoles = []) {
  const user = await requireUser();

  if (!user.businessId || !user.businessRole) {
    if (user.globalRole === "PLATFORM_ADMIN") {
      redirect("/admin");
    }

    if (user.globalRole === "CUSTOMER") {
      redirect("/customer/dashboard");
    }

    redirect("/login");
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.businessRole)) {
    redirect("/dashboard");
  }

  return {
    ...user,
    businessId: user.businessId,
    businessRole: user.businessRole,
  };
}

export async function requireCustomer() {
  const user = await requireUser();

  if (user.globalRole !== "CUSTOMER") {
    if (user.globalRole === "PLATFORM_ADMIN") {
      redirect("/admin");
    }

    if (user.businessId && user.businessRole) {
      redirect("/dashboard");
    }

    redirect("/login");
  }

  return user;
}
