"use client";

import { Menu } from "lucide-react";

import SearchCommand from "@/components/dashboard/SearchCommand";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import ProfileMenu from "@/components/dashboard/ProfileMenu";

export default function Topbar({
  businessName,
  userName,
  userEmail,
  businessRole,
  notificationData,
  onOpenMenu,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6">
        <button
          type="button"
          aria-label="Hap menunë"
          onClick={onOpenMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1 sm:max-w-xl">
          <SearchCommand />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <NotificationDropdown
            unreadCount={notificationData?.unreadCount ?? 0}
            notifications={notificationData?.notifications ?? []}
          />

          <ProfileMenu
            businessName={businessName}
            userName={userName}
            userEmail={userEmail}
            businessRole={businessRole}
          />
        </div>
      </div>
    </header>
  );
}
