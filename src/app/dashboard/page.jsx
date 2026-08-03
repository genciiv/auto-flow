import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BusinessOnboardingCard from "@/components/dashboard/BusinessOnboardingCard";
import GettingStartedChecklist from "@/components/dashboard/GettingStartedChecklist";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RevenueChart from "@/components/dashboard/RevenueChart";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentServices from "@/components/dashboard/RecentServices";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import AiAssistantWidget from "@/components/dashboard/AiAssistantWidget";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

const MONTH_NAMES = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"];
const ACTIVE_SERVICE_STATUSES = ["PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_PICKUP"];
const COMPLETED_SERVICE_STATUSES = ["COMPLETED", "DELIVERED"];

function hasValue(value) {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}

function percentageChange(current, previous) {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

function monthStart(date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function getExecutiveDashboardData(businessId) {
  const now = new Date();
  const currentStart = monthStart(now);
  const nextStart = monthStart(now, 1);
  const previousStart = monthStart(now, -1);
  const sixMonthsStart = monthStart(now, -5);

  const [
    payments,
    expenses,
    services,
    invoices,
    parts,
    totalCustomers,
    totalVehicles,
    mechanicMemberships,
    customers,
  ] = await Promise.all([
    db.customerPayment.findMany({
      where: { businessId, paidAt: { gte: sixMonthsStart, lt: nextStart } },
      select: { amount: true, paidAt: true },
    }),
    db.businessExpense.findMany({
      where: {
        businessId,
        status: "POSTED",
        expenseDate: { gte: sixMonthsStart, lt: nextStart },
      },
      select: { amount: true, expenseDate: true },
    }),
    db.serviceRecord.findMany({
      where: { businessId, createdAt: { gte: previousStart, lt: nextStart } },
      select: {
        id: true,
        customerId: true,
        assignedUserId: true,
        status: true,
        total: true,
        createdAt: true,
      },
    }),
    db.invoice.findMany({
      where: { businessId },
      select: {
        id: true,
        customerId: true,
        status: true,
        total: true,
        customerPayments: { select: { amount: true } },
      },
    }),
    db.part.findMany({
      where: { businessId },
      select: { stock: true, minStock: true, buyPrice: true },
    }),
    db.customer.count({ where: { businessId } }),
    db.vehicle.count({ where: { businessId } }),
    db.businessUser.findMany({
      where: { businessId, role: "MECHANIC", isActive: true },
      select: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.customer.findMany({
      where: { businessId },
      select: {
        id: true,
        name: true,
        _count: { select: { vehicles: true } },
      },
    }),
  ]);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = monthStart(now, index - 5);
    return { key: monthKey(date), label: MONTH_NAMES[date.getMonth()], revenue: 0, expenses: 0 };
  });
  const monthMap = new Map(months.map((item) => [item.key, item]));

  for (const payment of payments) {
    const bucket = monthMap.get(monthKey(new Date(payment.paidAt)));
    if (bucket) bucket.revenue += Number(payment.amount || 0);
  }
  for (const expense of expenses) {
    const bucket = monthMap.get(monthKey(new Date(expense.expenseDate)));
    if (bucket) bucket.expenses += Number(expense.amount || 0);
  }

  const currentRevenue = payments
    .filter((item) => item.paidAt >= currentStart && item.paidAt < nextStart)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const previousRevenue = payments
    .filter((item) => item.paidAt >= previousStart && item.paidAt < currentStart)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const currentExpenses = expenses
    .filter((item) => item.expenseDate >= currentStart && item.expenseDate < nextStart)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const previousExpenses = expenses
    .filter((item) => item.expenseDate >= previousStart && item.expenseDate < currentStart)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const currentServicesList = services.filter((item) => item.createdAt >= currentStart);
  const previousServicesList = services.filter((item) => item.createdAt < currentStart);
  const allBusinessServices = await db.serviceRecord.findMany({
    where: { businessId },
    select: { id: true, customerId: true, assignedUserId: true, status: true, total: true },
  });

  const serviceStatuses = Object.fromEntries(
    ACTIVE_SERVICE_STATUSES.map((status) => [
      status,
      allBusinessServices.filter((service) => service.status === status).length,
    ]),
  );

  const receivables = invoices.reduce((sum, invoice) => {
    if (invoice.status === "PAID") return sum;
    const paid = invoice.customerPayments.reduce((value, payment) => value + Number(payment.amount || 0), 0);
    return sum + Math.max(0, Number(invoice.total || 0) - paid);
  }, 0);

  const customerRevenue = new Map();
  const customerServices = new Map();
  for (const service of allBusinessServices) {
    if (!service.customerId) continue;
    customerServices.set(service.customerId, (customerServices.get(service.customerId) || 0) + 1);
  }
  for (const invoice of invoices) {
    if (!invoice.customerId) continue;
    const paid = invoice.customerPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    customerRevenue.set(invoice.customerId, (customerRevenue.get(invoice.customerId) || 0) + paid);
  }

  const topCustomers = customers
    .map((customer) => ({
      id: customer.id,
      name: customer.name,
      revenue: customerRevenue.get(customer.id) || 0,
      services: customerServices.get(customer.id) || 0,
      vehicles: customer._count.vehicles,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.services - a.services)
    .slice(0, 5);

  const mechanics = mechanicMemberships.map(({ user }) => {
    const assigned = allBusinessServices.filter((service) => service.assignedUserId === user.id);
    const completed = assigned.filter((service) => COMPLETED_SERVICE_STATUSES.includes(service.status));
    const active = assigned.filter((service) => ACTIVE_SERVICE_STATUSES.includes(service.status));
    const completionRate = assigned.length > 0 ? Math.round((completed.length / assigned.length) * 100) : 0;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      active: active.length,
      completed: completed.length,
      revenue: completed.reduce((sum, service) => sum + Number(service.total || 0), 0),
      completionRate,
    };
  });

  const currentProfit = currentRevenue - currentExpenses;
  const previousProfit = previousRevenue - previousExpenses;

  return {
    months,
    currentRevenue,
    previousRevenue,
    currentExpenses,
    currentProfit,
    revenueChange: percentageChange(currentRevenue, previousRevenue),
    profitChange: percentageChange(currentProfit, previousProfit),
    currentServices: currentServicesList.length,
    completedServices: currentServicesList.filter((item) => COMPLETED_SERVICE_STATUSES.includes(item.status)).length,
    serviceChange: percentageChange(currentServicesList.length, previousServicesList.length),
    serviceStatuses,
    activeServiceTotal: Object.values(serviceStatuses).reduce((sum, value) => sum + value, 0),
    waitingForParts: serviceStatuses.WAITING_FOR_PARTS || 0,
    readyForPickup: serviceStatuses.READY_FOR_PICKUP || 0,
    inventoryValue: parts.reduce((sum, part) => sum + Number(part.stock || 0) * Number(part.buyPrice || 0), 0),
    lowStock: parts.filter((part) => Number(part.stock) <= Number(part.minStock)).length,
    unpaidInvoices: invoices.filter((invoice) => invoice.status !== "PAID").length,
    receivables,
    totalCustomers,
    totalVehicles,
    mechanics,
    topCustomers,
  };
}

export default async function DashboardPage() {
  const { businessId, businessRole } = await requireBusinessContext();

  if (["OWNER", "MANAGER"].includes(businessRole)) {
    const [business, executiveData] = await Promise.all([
      db.business.findUnique({ where: { id: businessId }, select: { name: true } }),
      getExecutiveDashboardData(businessId),
    ]);

    return (
      <DashboardLayout>
        <ExecutiveDashboard
          data={executiveData}
          businessName={business?.name}
          role={businessRole}
        />
      </DashboardLayout>
    );
  }

  const [
    business,
    customerCount,
    vehicleCount,
    activeServiceCount,
    totalServiceCount,
    appointmentCount,
    purchaseCount,
    recentServices,
    invoices,
    parts,
    upcomingAppointments,
  ] = await Promise.all([
    db.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, nipt: true, city: true, address: true, phone: true, email: true, workingHours: true },
    }),
    db.customer.count({ where: { businessId } }),
    db.vehicle.count({ where: { businessId } }),
    db.serviceRecord.count({ where: { businessId, status: "IN_PROGRESS" } }),
    db.serviceRecord.count({ where: { businessId } }),
    db.appointment.count({ where: { businessId } }),
    db.purchaseOrder.count({ where: { businessId } }),
    db.serviceRecord.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, include: { vehicle: true }, take: 5 }),
    db.invoice.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
    db.part.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
    db.appointment.findMany({ where: { businessId }, orderBy: { date: "asc" }, include: { vehicle: true, customer: true }, take: 5 }),
  ]);

  const paidRevenue = invoices.filter((invoice) => invoice.status === "PAID").reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const lowStockParts = parts.filter((part) => Number(part.stock) <= Number(part.minStock));
  const profileComplete = Boolean(
    business && hasValue(business.nipt) && hasValue(business.phone) && hasValue(business.email) && hasValue(business.city) && hasValue(business.address) && hasValue(business.workingHours),
  );

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
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Mirë se erdhe në AutoFlow</h1>
          <p className="mt-2 text-slate-500">Pamje operative nga databaza për detyrat e rolit tënd.</p>
        </div>
        <BusinessOnboardingCard business={business} />
        <GettingStartedChecklist profileComplete={profileComplete} customerCount={customerCount} vehicleCount={vehicleCount} serviceCount={totalServiceCount} invoiceCount={invoices.length} />
        <StatsGrid stats={stats} />
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><RevenueChart invoices={invoices} /><AiAssistantWidget /></div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><RecentServices services={recentServices} /><CalendarWidget appointments={upcomingAppointments} /></div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><ActivityTimeline services={recentServices} invoices={invoices} /><InventoryAlerts parts={lowStockParts} /></div>
        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
