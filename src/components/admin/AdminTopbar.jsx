"use client";

import { Menu } from "lucide-react";

import SearchCommand from "@/components/dashboard/SearchCommand";
import AdminNotificationDropdown from "@/components/admin/AdminNotificationDropdown";
import AdminProfileMenu from "@/components/admin/AdminProfileMenu";

export default function AdminTopbar({
  user,
  notificationSummary,
  onOpenMenu,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-20 sm:gap-4 sm:px-6">
        <button
          type="button"
          aria-label="Hap menunë"
          onClick={onOpenMenu}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1 lg:hidden">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
            AutoFlow
          </p>
          <p className="truncate text-sm font-bold text-slate-950">Platform Admin</p>
        </div>

        <div className="hidden min-w-0 flex-1 sm:max-w-xl lg:block">
          <SearchCommand />
        </div>

        <div className="lg:hidden">
          <SearchCommand />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <AdminNotificationDropdown
            unreadCount={notificationSummary?.unreadCount ?? 0}
            notifications={notificationSummary?.notifications ?? []}
            counts={notificationSummary?.counts ?? {}}
          />

          <AdminProfileMenu name={user?.name} email={user?.email} />
        </div>
      </div>
    </header>
  );
}
