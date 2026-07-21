import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { requireBusinessContext } from "@/lib/business-context";

export default async function DashboardLayout({ children }) {
  const { businessRole } = await requireBusinessContext();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar businessRole={businessRole} />

      <div className="lg:pl-72">
        <Topbar />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
