import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RevenueChart from "@/components/dashboard/RevenueChart";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentServices from "@/components/dashboard/RecentServices";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import AiAssistantWidget from "@/components/dashboard/AiAssistantWidget";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const [
    customers,
    vehicles,
    services,
    invoices,
    parts,
    appointments,
    purchases,
  ] = await Promise.all([
    db.customer.findMany(),
    db.vehicle.findMany(),
    db.serviceRecord.findMany({
      orderBy: { createdAt: "desc" },
      include: { vehicle: true },
      take: 5,
    }),
    db.invoice.findMany(),
    db.part.findMany(),
    db.appointment.findMany({
      orderBy: { date: "asc" },
      include: { vehicle: true },
      take: 5,
    }),
    db.purchaseOrder.findMany(),
  ]);

  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

  const lowStockParts = parts.filter(
    (part) => Number(part.stock) <= Number(part.minStock),
  );

  const stats = {
    customers: customers.length,
    vehicles: vehicles.length,
    activeServices: services.filter(
      (service) => service.status === "IN_PROGRESS",
    ).length,
    revenue: paidRevenue,
    lowStock: lowStockParts.length,
    appointments: appointments.length,
    purchases: purchases.length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-blue-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Mirë se erdhe në AutoFlow
          </h1>
          <p className="mt-2 text-slate-500">
            Pamje reale nga databaza për servisin, klientët, faturat dhe
            magazinën.
          </p>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <RevenueChart invoices={invoices} />
          <AiAssistantWidget />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <RecentServices services={services} />
          <CalendarWidget appointments={appointments} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ActivityTimeline services={services} invoices={invoices} />
          <InventoryAlerts parts={lowStockParts} />
        </div>

        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
