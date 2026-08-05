import { notFound } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomerPaymentsPanel from "@/components/invoices/CustomerPaymentsPanel";
import InvoiceDetails from "@/components/invoices/details/InvoiceDetails";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

export default async function InvoiceDetailsPage({ params }) {
  const { businessId, businessRole } =
    await requireBusinessContext();

  const { id } = await params;

  if (!id) {
    notFound();
  }

  const invoice = await db.invoice.findFirst({
    where: {
      id,
      businessId,
    },
    include: {
      business: true,
      customer: true,
      vehicle: {
        include: {
          customer: true,
        },
      },
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
      customerPayments: {
        orderBy: {
          paidAt: "desc",
        },
        include: {
          recordedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      service: {
        include: {
          vehicle: true,
          laborItems: {
            orderBy: {
              createdAt: "asc",
            },
          },
          partsUsed: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              part: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const [customers, vehicles, services] =
    await Promise.all([
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

  const clientInvoice = JSON.parse(
    JSON.stringify(invoice),
  );

  const clientCustomers = JSON.parse(
    JSON.stringify(customers),
  );

  const clientVehicles = JSON.parse(
    JSON.stringify(vehicles),
  );

  const clientServices = JSON.parse(
    JSON.stringify(services),
  );

  const canRecordPayment = [
    "OWNER",
    "MANAGER",
    "RECEPTIONIST",
    "ACCOUNTANT",
  ].includes(businessRole);

  return (
    <DashboardLayout>
      <InvoiceDetails
        invoice={clientInvoice}
        customers={clientCustomers}
        vehicles={clientVehicles}
        services={clientServices}
      />

      <div className="mt-8">
        <CustomerPaymentsPanel
          invoice={clientInvoice}
          canRecordPayment={canRecordPayment}
        />
      </div>
    </DashboardLayout>
  );
}
