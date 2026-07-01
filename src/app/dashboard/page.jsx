import DashboardLayout from "@/components/dashboard/DashboardLayout";

import StatsGrid from "@/components/dashboard/StatsGrid";
import RevenueChart from "@/components/dashboard/RevenueChart";
import AiAssistantWidget from "@/components/dashboard/AiAssistantWidget";

import RecentServices from "@/components/dashboard/RecentServices";
import CalendarWidget from "@/components/dashboard/CalendarWidget";

import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";

import QuickActions from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-blue-600">Dashboard</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Mirë se erdhe në AutoFlow
          </h1>

          <p className="mt-2 text-slate-500">
            Pamje e përgjithshme e servisit, terminet, magazina dhe aktivitetet.
          </p>
        </div>

        {/* Statistics */}
        <StatsGrid />

        {/* Revenue + AI */}
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <RevenueChart />
          <AiAssistantWidget />
        </div>

        {/* Services + Calendar */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <RecentServices />
          <CalendarWidget />
        </div>

        {/* Activity + Inventory */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ActivityTimeline />
          <InventoryAlerts />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
