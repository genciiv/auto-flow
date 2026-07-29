import SearchCommand from "@/components/dashboard/SearchCommand";

import AdminNotificationDropdown from "@/components/admin/AdminNotificationDropdown";
import AdminProfileMenu from "@/components/admin/AdminProfileMenu";
import { getAdminNotificationSummary } from "@/services/admin/admin-notification-service";

export default async function AdminTopbar({ user }) {
  const notificationSummary = await getAdminNotificationSummary({
    limit: 12,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-6">
        <SearchCommand />

        <div className="ml-auto flex items-center gap-3">
          <AdminNotificationDropdown
            unreadCount={notificationSummary.unreadCount}
            notifications={notificationSummary.notifications}
            counts={notificationSummary.counts}
          />

          <AdminProfileMenu name={user?.name} email={user?.email} />
        </div>
      </div>
    </header>
  );
}
