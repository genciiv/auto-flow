import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InvoiceStats from "@/components/invoices/InvoiceStats";
import InvoiceFilters from "@/components/invoices/InvoiceFilters";
import InvoicesTable from "@/components/invoices/InvoicesTable";

export default function InvoicesPage() {
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

          <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Krijo faturë
          </button>
        </div>

        <InvoiceStats />
        <InvoiceFilters />
        <InvoicesTable />
      </div>
    </DashboardLayout>
  );
}
