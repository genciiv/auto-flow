import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RevenueChart from "@/components/dashboard/RevenueChart";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentServices from "@/components/dashboard/RecentServices";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import AiAssistantWidget from "@/components/dashboard/AiAssistantWidget";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const { businessId } = await requireBusinessContext();

  const [
    customerCount,
    vehicleCount,
    activeServiceCount,
    appointmentCount,
    purchaseCount,
    recentServices,
    invoices,
    parts,
    upcomingAppointments,
  ] = await Promise.all([
    db.customer.count({
      where: {
        businessId,
      },
    }),

    db.vehicle.count({
      where: {
        businessId,
      },
    }),

    db.serviceRecord.count({
      where: {
        businessId,
        status: "IN_PROGRESS",
      },
    }),

    db.appointment.count({
      where: {
        businessId,
      },
    }),

    db.purchaseOrder.count({
      where: {
        businessId,
      },
    }),

    db.serviceRecord.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vehicle: true,
      },
      take: 5,
    }),

    db.invoice.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.part.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.appointment.findMany({
      where: {
        businessId,
      },
      orderBy: {
        date: "asc",
      },
      include: {
        vehicle: true,
        customer: true,
      },
      take: 5,
    }),
  ]);

  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => {
      return sum + Number(invoice.total || 0);
    }, 0);

  const lowStockParts = parts.filter((part) => {
    return Number(part.stock) <= Number(part.minStock);
  });

  const stats = {
    customers: customerCount,
    vehicles: vehicleCount,
    activeServices: activeServiceCount,
    revenue: paidRevenue,
    lowStock: lowStockParts.length,
    appointments: appointmentCount,
    purchases: purchaseCount,
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
          <RecentServices services={recentServices} />
          <CalendarWidget appointments={upcomingAppointments} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ActivityTimeline services={recentServices} invoices={invoices} />

          <InventoryAlerts parts={lowStockParts} />
        </div>

        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
