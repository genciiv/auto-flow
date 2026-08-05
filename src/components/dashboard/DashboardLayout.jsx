import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireBusinessUser } from "@/lib/auth-guard";
import { getDashboardNotifications } from "@/services/dashboard-notification-service";
import { syncOperationalReminders } from "@/services/operational-notification-service";

function serializeDashboardUser(user) {
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    globalRole: user.globalRole ?? null,
    businessId: user.businessId ?? null,
    businessName: user.businessName ?? null,
    businessRole: user.businessRole ?? null,
    memberships: Array.isArray(user.memberships)
      ? user.memberships.map((membership) => ({
          id: membership.id ?? null,
          businessId: membership.businessId ?? null,
          businessName: membership.businessName ?? null,
          role: membership.role ?? null,
        }))
      : [],
  };
}

export default async function DashboardLayout({
  children,
  notificationData = null,
  badgeCounts = {},
}) {
  const user = await requireBusinessUser();

  await syncOperationalReminders({
    businessId: user.businessId,
  });

  const resolvedNotificationData =
    notificationData ??
    (await getDashboardNotifications(
      user.businessId,
      user.id,
    ));

  const serializedUser = serializeDashboardUser(user);

  return (
    <DashboardShell
      user={serializedUser}
      notificationData={resolvedNotificationData}
      badgeCounts={badgeCounts}
    >
      {children}
    </DashboardShell>
  );
}