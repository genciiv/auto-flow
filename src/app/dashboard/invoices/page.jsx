import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateInvoiceModal from "@/components/invoices/CreateInvoiceModal";
import InvoiceStats from "@/components/invoices/InvoiceStats";
import InvoicesTable from "@/components/invoices/InvoicesTable";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { FileText, ReceiptText, ShieldCheck } from "lucide-react";

import {
  addMoney,
  serializeMoney,
  toMoney,
} from "@/lib/money";

export default async function InvoicesPage() {
  const { businessId, businessRole } = await requireBusinessPermission(
    PERMISSIONS.INVOICES_VIEW,
  );

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

  const canCreateInvoice = hasPermission(
    businessRole,
    PERMISSIONS.INVOICES_CREATE,
  );
  const canUpdateInvoice = hasPermission(
    businessRole,
    PERMISSIONS.INVOICES_UPDATE,
  );
  const canDeleteInvoice = hasPermission(
    businessRole,
    PERMISSIONS.INVOICES_DELETE,
  );

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
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ReceiptText size={23} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Faturimi</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Faturat</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Menaxho faturat, pagesat, detyrimet dhe statuset financiare nga një workspace i vetëm.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex"><ShieldCheck size={16} /> Të dhëna të verifikuara</div>
              {canCreateInvoice ? <CreateInvoiceModal customers={clientCustomers} vehicles={clientVehicles} services={clientServices} /> : null}
            </div>
          </div>
        </header>

        <InvoiceStats stats={stats} />

        <InvoicesTable
          invoices={clientInvoices}
          customers={clientCustomers}
          vehicles={clientVehicles}
          services={clientServices}
          canUpdate={canUpdateInvoice}
          canDelete={canDeleteInvoice}
        />
      </div>
    </DashboardLayout>
  );
}