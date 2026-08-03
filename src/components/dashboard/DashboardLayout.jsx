import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireBusinessUser } from "@/lib/auth-guard";
import { getDashboardNotifications } from "@/services/dashboard-notification-service";
import { syncOperationalReminders } from "@/services/operational-notification-service";

export default async function DashboardLayout({
  children,
  notificationData = null,
  badgeCounts = {},
}) {
  const user = await requireBusinessUser();
  await syncOperationalReminders({ businessId: user.businessId });
  const resolvedNotificationData =
    notificationData ?? (await getDashboardNotifications(user.businessId, user.id));

  return (
    <DashboardShell
      user={user}
      notificationData={resolvedNotificationData}
      badgeCounts={badgeCounts}
    >
      {children}
    </DashboardShell>
  );
}
