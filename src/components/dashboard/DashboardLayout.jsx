import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

export default async function DashboardLayout({ children }) {
  const { userId, businessRole, business } = await requireBusinessContext();

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar businessRole={businessRole} businessName={business?.name} />

      <div className="lg:pl-72">
        <Topbar
          businessName={business?.name}
          userName={user?.name}
          userEmail={user?.email}
          businessRole={businessRole}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
