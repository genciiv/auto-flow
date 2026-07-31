import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireBusinessUser } from "@/lib/auth-guard";

export default async function DashboardLayout({
  children,
  notificationData = null,
  badgeCounts = {},
}) {
  const user = await requireBusinessUser();

  return (
    <DashboardShell
      user={user}
      notificationData={notificationData}
      badgeCounts={badgeCounts}
    >
      {children}
    </DashboardShell>
  );
}
