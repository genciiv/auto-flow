import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireBusinessContext(allowedRoles = []) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const activeBusinessId = session.user.businessId;

  if (!activeBusinessId) {
    if (session.user.globalRole === "PLATFORM_ADMIN") {
      redirect("/admin");
    }

    if (session.user.globalRole === "CUSTOMER") {
      redirect("/customer/dashboard");
    }

    redirect("/login");
  }

  /*
   * Nuk marrim membership-in e parë.
   *
   * Kontrollojmë pikërisht biznesin aktiv që ndodhet në session.
   * Kjo mbështet edhe WorkspaceSwitcher.
   */
  const membership = await db.businessUser.findFirst({
    where: {
      userId,
      businessId: activeBusinessId,
      isActive: true,

      business: {
        isActive: true,
      },
    },

    select: {
      id: true,
      role: true,
      businessId: true,

      business: {
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
          phone: true,
          email: true,
          isActive: true,
        },
      },
    },
  });

  if (!membership?.business) {
    redirect("/login");
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
    redirect("/dashboard");
  }

  return {
    session,
    user: session.user,
    userId,
    businessId: membership.businessId,
    businessRole: membership.role,
    membershipId: membership.id,
    business: membership.business,
  };
}
