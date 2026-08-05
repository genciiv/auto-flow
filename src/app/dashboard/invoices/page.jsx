import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateInvoiceModal from "@/components/invoices/CreateInvoiceModal";
import InvoiceStats from "@/components/invoices/InvoiceStats";
import InvoicesTable from "@/components/invoices/InvoicesTable";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";
import {
  addMoney,
  serializeMoney,
  toMoney,
} from "@/lib/money";

export default async function InvoicesPage() {
  const { businessId } = await requireBusinessContext();

  const [invoices, customers, vehicles, services] =
    await Promise.all([
      db.invoice.findMany({
        where: {
          businessId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          customer: true,
          vehicle: true,
          service: true,
        },
      }),

      db.customer.findMany({
        where: {
          businessId,
        },
        orderBy: {
          name: "asc",
        },
      }),

      db.vehicle.findMany({
        where: {
          businessId,
        },
        orderBy: {
          plate: "asc",
        },
      }),

      db.serviceRecord.findMany({
        where: {
          businessId,
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          vehicle: true,
          invoice: {
            select: {
              id: true,
              number: true,
            },
          },
        },
      }),
    ]);

  const totalInvoices = invoices.length;

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "PAID",
  ).length;

  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.status === "UNPAID",
  ).length;

  const draftInvoices = invoices.filter(
    (invoice) => invoice.status === "DRAFT",
  ).length;

  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === "OVERDUE",
  ).length;

  const pendingInvoices =
    unpaidInvoices + draftInvoices;

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce(
      (sum, invoice) =>
        addMoney(sum, invoice.total),
      toMoney(0),
    );

  const clientInvoices = JSON.parse(JSON.stringify(invoices));
  const clientCustomers = JSON.parse(JSON.stringify(customers));
  const clientVehicles = JSON.parse(JSON.stringify(vehicles));
  const clientServices = JSON.parse(JSON.stringify(services));

  const stats = {
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    draftInvoices,
    pendingInvoices,
    overdueInvoices,
    totalRevenue: serializeMoney(totalRevenue),
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Invoices
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Faturat
            </h1>

            <p className="mt-2 text-slate-500">
              Menaxho faturat, pagesat, borxhet dhe
              statuset financiare.
            </p>
          </div>

          <CreateInvoiceModal
            customers={clientCustomers}
            vehicles={clientVehicles}
            services={clientServices}
          />
        </div>

        <InvoiceStats stats={stats} />

        <InvoicesTable
          invoices={clientInvoices}
          customers={clientCustomers}
          vehicles={clientVehicles}
          services={clientServices}
        />
      </div>
    </DashboardLayout>
  );
}