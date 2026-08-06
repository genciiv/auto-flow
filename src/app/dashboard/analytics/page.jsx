import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AnalyticsStats from "@/components/analytics/AnalyticsStats";
import RevenueOverview from "@/components/analytics/RevenueOverview";
import ServicePerformance from "@/components/analytics/ServicePerformance";
import InventoryPerformance from "@/components/analytics/InventoryPerformance";
import TopCustomersTable from "@/components/analytics/TopCustomersTable";

import {
  requireBusinessFeature,
  requireBusinessPermission,
} from "@/lib/business-context";
import { PLAN_FEATURES } from "@/services/plan-access-service";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { getAppMonthKey, getAppMonthRange } from "@/lib/financial-period";

const MONTH_NAMES = [
  "Jan",
  "Shk",
  "Mar",
  "Pri",
  "Maj",
  "Qer",
  "Kor",
  "Gus",
  "Sht",
  "Tet",
  "Nën",
  "Dhj",
];

function getLastTwelveMonths(referenceDate = new Date()) {
  const months = [];

  for (let index = 11; index >= 0; index -= 1) {
    const period = getAppMonthRange(referenceDate, -index);

    months.push({
      key: `${period.year}-${String(period.month).padStart(2, "0")}`,
      label: MONTH_NAMES[period.month - 1],
      month: period.month - 1,
      year: period.year,
      revenue: 0,
    });
  }

  return months;
}

function calculatePercentageChange(currentValue, previousValue) {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);

  if (previous === 0) {
    return current > 0 ? null : 0;
  }

  return ((current - previous) / previous) * 100;
}

function normalizeServiceTitle(title) {
  return String(title || "Pa titull")
    .trim()
    .replace(/\s+/g, " ");
}

export default async function AnalyticsPage() {
  await requireBusinessPermission(PERMISSIONS.ANALYTICS_VIEW);
  const { businessId } = await requireBusinessFeature(PLAN_FEATURES.ANALYTICS);

  const now = new Date();

  const currentMonth = getAppMonthRange(now);
  const previousMonth = getAppMonthRange(now, -1);
  const twelveMonthsBack = getAppMonthRange(now, -11);
  const currentMonthStart = currentMonth.start;
  const nextMonthStart = currentMonth.endExclusive;
  const previousMonthStart = previousMonth.start;
  const twelveMonthsAgo = twelveMonthsBack.start;

  const [
    customerPayments,
    services,
    vehicles,
    partsUsed,
    customers,
    currentMonthServiceCount,
    previousMonthServiceCount,
    currentMonthVehicleCount,
    previousMonthVehicleCount,
    currentMonthPartsUsage,
    previousMonthPartsUsage,
  ] = await Promise.all([
    db.customerPayment.findMany({
      where: {
        businessId,
        paidAt: {
          gte: twelveMonthsAgo,
          lt: nextMonthStart,
        },
      },
      select: {
        amount: true,
        paidAt: true,
        invoice: {
          select: {
            customerId: true,
          },
        },
      },
      orderBy: {
        paidAt: "asc",
      },
    }),

    db.serviceRecord.findMany({
      where: {
        businessId,
        createdAt: {
          gte: twelveMonthsAgo,
          lt: nextMonthStart,
        },
      },
      select: {
        id: true,
        customerId: true,
        vehicleId: true,
        title: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.vehicle.findMany({
      where: {
        businessId,
      },
      select: {
        id: true,
        customerId: true,
        plate: true,
        brand: true,
        model: true,
        createdAt: true,
      },
    }),

    db.servicePartUsage.findMany({
      where: {
        service: {
          businessId,
        },
      },
      select: {
        id: true,
        quantity: true,
        total: true,
        createdAt: true,
        part: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.customer.findMany({
      where: {
        businessId,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        vehicles: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        invoices: {
          where: {
            status: "PAID",
          },
          select: {
            id: true,
            total: true,
            vehicleId: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),

    db.serviceRecord.count({
      where: {
        businessId,
        createdAt: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
    }),

    db.serviceRecord.count({
      where: {
        businessId,
        createdAt: {
          gte: previousMonthStart,
          lt: currentMonthStart,
        },
      },
    }),

    db.vehicle.count({
      where: {
        businessId,
        createdAt: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
    }),

    db.vehicle.count({
      where: {
        businessId,
        createdAt: {
          gte: previousMonthStart,
          lt: currentMonthStart,
        },
      },
    }),

    db.servicePartUsage.aggregate({
      where: {
        service: {
          businessId,
        },
        createdAt: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
      _sum: {
        quantity: true,
      },
    }),

    db.servicePartUsage.aggregate({
      where: {
        service: {
          businessId,
        },
        createdAt: {
          gte: previousMonthStart,
          lt: currentMonthStart,
        },
      },
      _sum: {
        quantity: true,
      },
    }),
  ]);

  const currentMonthPayments = customerPayments.filter((payment) => {
    const paidAt = new Date(payment.paidAt);
    return paidAt >= currentMonthStart && paidAt < nextMonthStart;
  });

  const previousMonthPayments = customerPayments.filter((payment) => {
    const paidAt = new Date(payment.paidAt);
    return paidAt >= previousMonthStart && paidAt < currentMonthStart;
  });

  const currentMonthRevenue = currentMonthPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const previousMonthRevenue = previousMonthPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const currentMonthPartsCount = currentMonthPartsUsage._sum.quantity || 0;

  const previousMonthPartsCount = previousMonthPartsUsage._sum.quantity || 0;

  const stats = {
    monthlyRevenue: currentMonthRevenue,
    monthlyRevenueChange: calculatePercentageChange(
      currentMonthRevenue,
      previousMonthRevenue,
    ),

    services: currentMonthServiceCount,
    servicesChange: calculatePercentageChange(
      currentMonthServiceCount,
      previousMonthServiceCount,
    ),

    vehicles: vehicles.length,
    vehiclesChange: calculatePercentageChange(
      currentMonthVehicleCount,
      previousMonthVehicleCount,
    ),

    partsUsed: currentMonthPartsCount,
    partsUsedChange: calculatePercentageChange(
      currentMonthPartsCount,
      previousMonthPartsCount,
    ),
  };

  const monthlyRevenueMap = new Map();

  for (const month of getLastTwelveMonths(now)) {
    monthlyRevenueMap.set(month.key, month);
  }

  for (const payment of customerPayments) {
    const monthKey = getAppMonthKey(payment.paidAt);
    const existingMonth = monthlyRevenueMap.get(monthKey);

    if (existingMonth) {
      existingMonth.revenue += Number(payment.amount || 0);
    }
  }

  const monthlyRevenue = Array.from(monthlyRevenueMap.values());

  const currentRevenue = monthlyRevenue.at(-1)?.revenue || 0;
  const previousRevenue = monthlyRevenue.at(-2)?.revenue || 0;

  const revenueChange = calculatePercentageChange(
    currentRevenue,
    previousRevenue,
  );

  const servicePerformanceMap = new Map();

  for (const service of services) {
    if (service.status === "CANCELLED") {
      continue;
    }

    const serviceName = normalizeServiceTitle(service.title);
    const serviceKey = serviceName.toLowerCase();

    const existingService = servicePerformanceMap.get(serviceKey);

    if (existingService) {
      existingService.count += 1;
      existingService.revenue += Number(service.total || 0);
    } else {
      servicePerformanceMap.set(serviceKey, {
        name: serviceName,
        count: 1,
        revenue: Number(service.total || 0),
      });
    }
  }

  const servicePerformance = Array.from(servicePerformanceMap.values())
    .sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }

      return second.revenue - first.revenue;
    })
    .slice(0, 5);

  const inventoryPerformanceMap = new Map();

  for (const usage of partsUsed) {
    const partId = usage.part.id;
    const existingPart = inventoryPerformanceMap.get(partId);

    if (existingPart) {
      existingPart.quantity += Number(usage.quantity || 0);
      existingPart.value += Number(usage.total || 0);
    } else {
      inventoryPerformanceMap.set(partId, {
        id: partId,
        name: usage.part.name,
        code: usage.part.code,
        quantity: Number(usage.quantity || 0),
        value: Number(usage.total || 0),
      });
    }
  }

  const inventoryPerformance = Array.from(inventoryPerformanceMap.values())
    .sort((first, second) => {
      if (second.quantity !== first.quantity) {
        return second.quantity - first.quantity;
      }

      return second.value - first.value;
    })
    .slice(0, 5);

  const customerServiceVisits = new Map();

  for (const service of services) {
    if (!service.customerId || service.status === "CANCELLED") {
      continue;
    }

    const existingCount = customerServiceVisits.get(service.customerId) || 0;

    customerServiceVisits.set(service.customerId, existingCount + 1);
  }

  const topCustomers = customers
    .map((customer) => {
      const totalSpent = customer.invoices.reduce(
        (sum, invoice) => sum + Number(invoice.total || 0),
        0,
      );

      const invoiceVisits = customer.invoices.length;
      const serviceVisits = customerServiceVisits.get(customer.id) || 0;

      const visits = Math.max(invoiceVisits, serviceVisits);

      const vehicle = customer.vehicles[0] || null;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        vehicle: vehicle
          ? `${vehicle.brand} ${vehicle.model || ""}`.trim()
          : "Pa automjet",
        plate: vehicle?.plate || null,
        visits,
        totalSpent,
      };
    })
    .filter((customer) => {
      return customer.visits > 0 || customer.totalSpent > 0;
    })
    .sort((first, second) => {
      if (second.totalSpent !== first.totalSpent) {
        return second.totalSpent - first.totalSpent;
      }

      return second.visits - first.visits;
    })
    .slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-sm font-semibold text-blue-600">Analitika</p>

          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-950">
            Analitika
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Analizo të ardhurat, shërbimet, magazinën dhe klientët më të
            vlefshëm.
          </p>
        </div>

        <AnalyticsStats stats={stats} />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <RevenueOverview
            monthlyRevenue={monthlyRevenue}
            revenueChange={revenueChange}
          />

          <ServicePerformance services={servicePerformance} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
          <InventoryPerformance items={inventoryPerformance} />
          <TopCustomersTable customers={topCustomers} />
        </div>
      </div>
    </DashboardLayout>
  );
}
