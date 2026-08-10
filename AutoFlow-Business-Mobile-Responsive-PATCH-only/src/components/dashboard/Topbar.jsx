"use client";

import { Menu } from "lucide-react";

import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import ProfileMenu from "@/components/dashboard/ProfileMenu";
import SearchCommand from "@/components/dashboard/SearchCommand";

export default function Topbar({
  businessName,
  userName,
  userEmail,
  businessRole,
  notificationData,
  onOpenMenu,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/85 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="af-content-container flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Hap menunë"
          onClick={onOpenMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0 flex-1 sm:hidden">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Portali i biznesit
          </p>
          <p className="mt-0.5 truncate text-[13px] font-bold text-slate-950">
            {businessName || "Biznesi im"}
          </p>
        </div>

        <div className="hidden min-w-0 flex-1 sm:block sm:max-w-lg">
          <SearchCommand />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="sm:hidden">
            <SearchCommand />
          </div>

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
