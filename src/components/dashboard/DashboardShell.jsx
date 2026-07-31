"use client";

import { useState } from "react";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardShell({
  children,
  user,
  notificationData = null,
  badgeCounts = {},
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        businessRole={user.businessRole}
        businessName={user.businessName}
        businessId={user.businessId}
        memberships={user.memberships ?? []}
        globalRole={user.globalRole}
        badgeCounts={badgeCounts ?? {}}
      />

      <div className="min-h-screen lg:pl-72">
        <Topbar
          businessName={user.businessName}
          userName={user.name}
          userEmail={user.email}
          businessRole={user.businessRole}
          notificationData={notificationData}
          onOpenMenu={() => setSidebarOpen(true)}
        />

        <main className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
