import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireBusinessUser } from "@/lib/auth-guard";
import { getDashboardNotifications } from "@/services/dashboard-notification-service";

export default async function DashboardLayout({
  children,
  notificationData = null,
  badgeCounts = {},
}) {
  const user = await requireBusinessUser();
  const resolvedNotificationData =
    notificationData ?? (await getDashboardNotifications(user.businessId));

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
