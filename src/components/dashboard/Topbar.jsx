import SearchCommand from "@/components/dashboard/SearchCommand";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import ProfileMenu from "@/components/dashboard/ProfileMenu";

export default function Topbar({
  businessName,
  userName,
  userEmail,
  businessRole,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-6">
        <SearchCommand />

        <div className="ml-auto flex items-center gap-3">
          <NotificationDropdown />

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
