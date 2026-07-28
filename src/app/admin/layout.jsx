import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { requirePlatformAdmin } from "@/lib/auth-guard";

export default async function AdminLayout({ children }) {
  const user = await requirePlatformAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-72">
        <AdminTopbar userName={user.name} userEmail={user.email} />

        <main className="px-6 py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
