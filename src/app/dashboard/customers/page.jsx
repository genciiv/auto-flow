import CreateCustomerModal from "@/components/customers/CreateCustomerModal";
import CustomerStats from "@/components/customers/CustomerStats";
import CustomersTable from "@/components/customers/CustomersTable";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

export default async function CustomersPage() {
  const { businessId } = await requireBusinessContext();

  const customers = await db.customer.findMany({
    where: {
      businessId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      vehicles: {
        where: {
          businessId,
        },
      },
      invoices: {
        where: {
          businessId,
        },
      },
    },
  });

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter((customer) => {
    return customer.vehicles.length > 0 || customer.invoices.length > 0;
  }).length;

  const totalVehicles = customers.reduce((sum, customer) => {
    return sum + customer.vehicles.length;
  }, 0);

  const totalSpent = customers.reduce((sum, customer) => {
    const customerSpent = customer.invoices.reduce((invoiceSum, invoice) => {
      return invoiceSum + Number(invoice.total ?? 0);
    }, 0);

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

          <CreateCustomerModal />
        </div>

        <CustomerStats stats={stats} />

        <CustomersTable customers={customers} />
      </div>
    </DashboardLayout>
  );
}
