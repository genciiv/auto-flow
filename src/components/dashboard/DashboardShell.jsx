"use client";

import { useState } from "react";

import AiAssistantWidget from "@/components/ai/AiAssistantWidget";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

import {
  hasPermission,
  PERMISSIONS,
} from "@/lib/permissions";

export default function DashboardShell({
  children,
  user,
  notificationData = null,
  badgeCounts = {},
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const canUseAiAssistant = hasPermission(
    user.businessRole,
    PERMISSIONS.AI_ASSISTANT_USE,
  );

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

        <main className="w-full">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {canUseAiAssistant ? (
        <AiAssistantWidget />
      ) : null}
    </div>
  );
}
