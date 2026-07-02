import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AnalyticsStats from "@/components/analytics/AnalyticsStats";
import RevenueOverview from "@/components/analytics/RevenueOverview";
import ServicePerformance from "@/components/analytics/ServicePerformance";
import InventoryPerformance from "@/components/analytics/InventoryPerformance";
import TopCustomersTable from "@/components/analytics/TopCustomersTable";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-blue-600">Analytics</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Analitika
          </h1>
          <p className="mt-2 text-slate-500">
            Analizo të ardhurat, shërbimet, magazinën dhe klientët më të
            vlefshëm.
          </p>
        </div>

        <AnalyticsStats />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <RevenueOverview />
          <ServicePerformance />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
          <InventoryPerformance />
          <TopCustomersTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
