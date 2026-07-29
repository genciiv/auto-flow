import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { requireBusinessContext } from "@/lib/business-context";
import { getMaintenanceStatus } from "@/services/maintenance-service";

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

  /*
   * Platform admin pa një biznes aktiv
   * kthehet te paneli i administrimit.
   */
  if (
    user.globalRole === "PLATFORM_ADMIN" &&
    (!user.businessId || !user.businessRole)
  ) {
    redirect("/admin");
  }

  /*
   * Një CUSTOMER mund të jetë njëkohësisht edhe
   * OWNER, MANAGER ose staf i një biznesi.
   *
   * Prandaj nuk e ridrejtojmë vetëm nga globalRole.
   * Fillimisht kontrollojmë nëse ka akses biznesi.
   */
  if (!user.businessId || !user.businessRole) {
    if (user.globalRole === "CUSTOMER") {
      redirect("/customer/dashboard");
    }

    redirect("/login");
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

  const maintenance = await getMaintenanceStatus();

  if (maintenance.maintenanceMode) {
    redirect("/maintenance");
  }

  /*
   * Një përdorues CUSTOMER mund të ketë edhe biznes,
   * por përsëri lejohet të përdorë portalin e klientit.
   */
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
