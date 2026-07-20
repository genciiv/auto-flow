import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import SearchCommand from "@/components/dashboard/SearchCommand";

import AdminProfileMenu from "@/components/admin/AdminProfileMenu";

export default function AdminTopbar({ user }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-6">
        <SearchCommand />

        <div className="ml-auto flex items-center gap-3">
          <NotificationDropdown />

          <AdminProfileMenu name={user?.name} email={user?.email} />
        </div>
      </div>
    </header>
  );
}
