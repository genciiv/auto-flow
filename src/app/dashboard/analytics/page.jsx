import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AnalyticsStats from "@/components/analytics/AnalyticsStats";
import RevenueOverview from "@/components/analytics/RevenueOverview";
import ServicePerformance from "@/components/analytics/ServicePerformance";
import InventoryPerformance from "@/components/analytics/InventoryPerformance";
import TopCustomersTable from "@/components/analytics/TopCustomersTable";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

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

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getLastTwelveMonths() {
  const months = [];
  const currentDate = new Date();

  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - index,
      1,
    );

    months.push({
      key: getMonthKey(date),
      label: MONTH_NAMES[date.getMonth()],
      month: date.getMonth(),
      year: date.getFullYear(),
      revenue: 0,
    });
  }

  return months;
}

function calculatePercentageChange(currentValue, previousValue) {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function normalizeServiceTitle(title) {
  return String(title || "Pa titull")
    .trim()
    .replace(/\s+/g, " ");
}

export default async function AnalyticsPage() {
  const { businessId } = await requireBusinessContext();

  const now = new Date();

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    paidInvoices,
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
    db.invoice.findMany({
      where: {
        businessId,
        status: "PAID",
        createdAt: {
          gte: twelveMonthsAgo,
          lt: nextMonthStart,
        },
      },
      select: {
        id: true,
        customerId: true,
        vehicleId: true,
        total: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
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

  const currentMonthInvoices = paidInvoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.createdAt);

    return invoiceDate >= currentMonthStart && invoiceDate < nextMonthStart;
  });

  const previousMonthInvoices = paidInvoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.createdAt);

    return invoiceDate >= previousMonthStart && invoiceDate < currentMonthStart;
  });

  const currentMonthRevenue = currentMonthInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0,
  );

  const previousMonthRevenue = previousMonthInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
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

  for (const month of getLastTwelveMonths()) {
    monthlyRevenueMap.set(month.key, month);
  }

  for (const invoice of paidInvoices) {
    const invoiceDate = new Date(invoice.createdAt);
    const monthKey = getMonthKey(invoiceDate);
    const existingMonth = monthlyRevenueMap.get(monthKey);

    if (existingMonth) {
      existingMonth.revenue += Number(invoice.total || 0);
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
