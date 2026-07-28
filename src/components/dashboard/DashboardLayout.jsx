import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { requireBusinessUser } from "@/lib/auth-guard";

export default async function DashboardLayout({
  children,
  notificationData = null,
  badgeCounts = {},
}) {
  const user = await requireBusinessUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        businessRole={user.businessRole}
        businessName={user.businessName}
        businessId={user.businessId}
        memberships={user.memberships ?? []}
        globalRole={user.globalRole}
        badgeCounts={badgeCounts ?? {}}
      />

      <div className="lg:pl-72">
        <Topbar
          businessName={user.businessName}
          userName={user.name}
          userEmail={user.email}
          businessRole={user.businessRole}
          notificationData={notificationData}
        />

        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
