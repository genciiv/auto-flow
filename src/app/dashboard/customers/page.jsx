import CreateCustomerModal from "@/components/customers/CreateCustomerModal";
import CustomerStats from "@/components/customers/CustomerStats";
import CustomersTable from "@/components/customers/CustomersTable";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import {
  hasPermission,
  PERMISSIONS,
} from "@/lib/permissions";

export default async function CustomersPage() {
  const { businessId, businessRole } =
    await requireBusinessPermission(
      PERMISSIONS.CUSTOMERS_VIEW,
    );

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

  const activeCustomers = customers.filter(
    (customer) =>
      customer.vehicles.length > 0 ||
      customer.invoices.length > 0,
  ).length;

  const totalVehicles = customers.reduce(
    (sum, customer) =>
      sum + customer.vehicles.length,
    0,
  );

  const totalSpent = customers.reduce(
    (sum, customer) => {
      const customerSpent =
        customer.invoices.reduce(
          (invoiceSum, invoice) =>
            invoiceSum +
            Number(invoice.total ?? 0),
          0,
        );

      return sum + customerSpent;
    },
    0,
  );

  const stats = {
    totalCustomers,
    activeCustomers,
    totalVehicles,
    totalSpent,
  };

  /*
   * Prisma Decimal nuk mund të kalojë drejtpërdrejt nga
   * Server Component te CustomersTable, i cili është Client Component.
   * Serializimi konverton Decimal dhe Date në vlera plain JSON.
   */
  const clientCustomers = JSON.parse(
    JSON.stringify(customers),
  );

  const canCreateCustomer = hasPermission(
    businessRole,
    PERMISSIONS.CUSTOMERS_CREATE,
  );

  const canUpdateCustomer = hasPermission(
    businessRole,
    PERMISSIONS.CUSTOMERS_UPDATE,
  );

  const canDeleteCustomer = hasPermission(
    businessRole,
    PERMISSIONS.CUSTOMERS_DELETE,
  );

  return (
    <DashboardLayout>
      <div className="af-page-stack">
        <div className="af-page-header">
          <div>
            <p className="af-page-eyebrow">
              Klientët
            </p>

            <h1 className="af-page-title">
              Klientët
            </h1>

            <p className="af-page-description">
              Menaxho klientët, kontaktet dhe automjetet
              e lidhura me ta.
            </p>
          </div>

          {canCreateCustomer ? (
            <CreateCustomerModal />
          ) : null}
        </div>

        <CustomerStats stats={stats} />

        <CustomersTable
          customers={clientCustomers}
          canUpdateCustomer={canUpdateCustomer}
          canDeleteCustomer={canDeleteCustomer}
        />
      </div>
    </DashboardLayout>
  );
}
