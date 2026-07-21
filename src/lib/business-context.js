import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/permissions";

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

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(membership.role)
  ) {
    redirect("/dashboard/unauthorized");
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

export async function requireBusinessPermission(permission) {
  const context = await requireBusinessContext();

  if (!hasPermission(context.businessRole, permission)) {
    redirect("/dashboard/unauthorized");
  }

  return context;
}

export async function requireAnyBusinessPermission(permissions = []) {
  const context = await requireBusinessContext();

  if (!hasAnyPermission(context.businessRole, permissions)) {
    redirect("/dashboard/unauthorized");
  }

  return context;
}

export async function requireAllBusinessPermissions(permissions = []) {
  const context = await requireBusinessContext();

  if (!hasAllPermissions(context.businessRole, permissions)) {
    redirect("/dashboard/unauthorized");
  }

  return context;
}

/*
 * Përdoret brenda Server Actions.
 *
 * Nuk bën redirect, por ndalon veprimin me error.
 * Kjo mbron serverin edhe nëse dikush përpiqet ta thërrasë
 * action-in direkt pa kaluar nga UI.
 */
export async function requireBusinessActionPermission(permission) {
  const context = await requireBusinessContext();

  if (!hasPermission(context.businessRole, permission)) {
    throw new Error("Nuk keni leje për të kryer këtë veprim.");
  }

  return context;
}

export async function requireAnyBusinessActionPermission(permissions = []) {
  const context = await requireBusinessContext();

  if (!hasAnyPermission(context.businessRole, permissions)) {
    throw new Error("Nuk keni leje për të kryer këtë veprim.");
  }

  return context;
}

export async function requireAllBusinessActionPermissions(permissions = []) {
  const context = await requireBusinessContext();

  if (!hasAllPermissions(context.businessRole, permissions)) {
    throw new Error("Nuk keni leje për të kryer këtë veprim.");
  }

  return context;
}
