import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children, user }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AdminSidebar />

      <div className="lg:pl-72">
        <AdminTopbar user={user} />

        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
