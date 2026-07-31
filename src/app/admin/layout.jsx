import AdminShell from "@/components/admin/AdminShell";
import { requirePlatformAdmin } from "@/lib/auth-guard";
import { getAdminNotificationSummary } from "@/services/admin/admin-notification-service";

export default async function AdminLayout({ children }) {
  const user = await requirePlatformAdmin();
  const notificationSummary = await getAdminNotificationSummary({ limit: 12 });

  return (
    <AdminShell user={user} notificationSummary={notificationSummary}>
      {children}
    </AdminShell>
  );
}
