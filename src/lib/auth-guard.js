import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { requireBusinessContext } from "@/lib/business-context";

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

    if (user.globalRole === "CUSTOMER") {
      redirect("/customer/dashboard");
    }

    redirect("/login");
  }

  return user;
}

export async function requireBusinessUser(allowedRoles = []) {
  const user = await requireUser();

  if (user.globalRole === "PLATFORM_ADMIN" && !user.businessId) {
    redirect("/admin");
  }

  if (user.globalRole === "CUSTOMER") {
    redirect("/customer/dashboard");
  }

  const context = await requireBusinessContext(allowedRoles);

  return {
    ...user,

    businessId: context.businessId,
    businessName: context.business.name,
    businessRole: context.businessRole,

    business: context.business,
    membershipId: context.membershipId,
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
