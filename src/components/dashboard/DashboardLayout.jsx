import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

import { getDashboardNotifications } from "@/services/dashboard-notification-service";

export default async function DashboardLayout({ children }) {
  const { userId, businessId, businessRole, business } =
    await requireBusinessContext();

  const [user, notificationData] = await Promise.all([
    db.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        name: true,
        email: true,
      },
    }),

    getDashboardNotifications(businessId),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar businessRole={businessRole} businessName={business?.name} />

      <div className="lg:pl-72">
        <Topbar
          businessName={business?.name}
          userName={user?.name}
          userEmail={user?.email}
          businessRole={businessRole}
          notificationData={notificationData}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
