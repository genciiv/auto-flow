import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomerStats from "@/components/customers/CustomerStats";
import CustomerFilters from "@/components/customers/CustomerFilters";
import CustomersTable from "@/components/customers/CustomersTable";
import { db } from "@/lib/db";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicles: true,
      invoices: true,
    },
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) => customer.vehicles.length > 0 || customer.invoices.length > 0,
  ).length;

  const totalVehicles = customers.reduce(
    (sum, customer) => sum + customer.vehicles.length,
    0,
  );

  const totalSpent = customers.reduce((sum, customer) => {
    const customerSpent = customer.invoices.reduce(
      (invoiceSum, invoice) => invoiceSum + Number(invoice.total || 0),
      0,
    );

    return sum + customerSpent;
  }, 0);

  const stats = {
    totalCustomers,
    activeCustomers,
    totalVehicles,
    totalSpent,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Customers</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Klientët
            </h1>
            <p className="mt-2 text-slate-500">
              Menaxho klientët, kontaktet dhe automjetet e lidhura me ta.
            </p>
          </div>

          <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Shto klient
          </button>
        </div>

        <CustomerStats stats={stats} />
        <CustomerFilters />
        <CustomersTable customers={customers} />
      </div>
    </DashboardLayout>
  );
}
