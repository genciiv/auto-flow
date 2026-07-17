import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InvoiceStats from "@/components/invoices/InvoiceStats";
import InvoiceFilters from "@/components/invoices/InvoiceFilters";
import InvoicesTable from "@/components/invoices/InvoicesTable";
import CreateInvoiceModal from "@/components/invoices/CreateInvoiceModal";
import { db } from "@/lib/db";

export default async function InvoicesPage() {
  const [invoices, customers, vehicles, services] = await Promise.all([
    db.invoice.findMany({
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
      orderBy: {
        name: "asc",
      },
    }),

    db.vehicle.findMany({
      orderBy: {
        plate: "asc",
      },
    }),

    db.serviceRecord.findMany({
      where: {
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

  const pendingInvoices = unpaidInvoices + draftInvoices;

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => {
      return sum + Number(invoice.total || 0);
    }, 0);

  const stats = {
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    draftInvoices,
    pendingInvoices,
    overdueInvoices,
    totalRevenue,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Invoices</p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Faturat
            </h1>

            <p className="mt-2 text-slate-500">
              Menaxho faturat, pagesat, borxhet dhe statuset financiare.
            </p>
          </div>

          <CreateInvoiceModal
            customers={customers}
            vehicles={vehicles}
            services={services}
          />
        </div>

        <InvoiceStats stats={stats} />

        <InvoiceFilters />

        <InvoicesTable invoices={invoices} />
      </div>
    </DashboardLayout>
  );
}
