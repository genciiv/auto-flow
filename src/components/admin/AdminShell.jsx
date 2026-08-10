"use client";

import { useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminShell({ children, user, notificationSummary }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="af-admin-shell min-h-screen bg-slate-50">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">
        <AdminTopbar
          user={user}
          notificationSummary={notificationSummary}
          onOpenMenu={() => setSidebarOpen(true)}
        />

        <main className="px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
