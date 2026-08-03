import { notFound } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InvoiceDetails from "@/components/invoices/details/InvoiceDetails";
import CustomerPaymentsPanel from "@/components/invoices/CustomerPaymentsPanel";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

export default async function InvoiceDetailsPage({ params }) {
  const { businessId, businessRole } = await requireBusinessContext();
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
      items: { orderBy: { createdAt: "asc" } },
      customerPayments: { orderBy: { paidAt: "desc" }, include: { recordedBy: { select: { id:true, name:true } } } },
      service: {
        include: {
          vehicle: true,
          laborItems: { orderBy: { createdAt: "asc" } },
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

  const [customers, vehicles, services] = await Promise.all([
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

  return (
    <DashboardLayout>
      <InvoiceDetails
        invoice={invoice}
        customers={customers}
        vehicles={vehicles}
        services={services}
      />
      <div className="mt-8"><CustomerPaymentsPanel invoice={JSON.parse(JSON.stringify(invoice))} canRecordPayment={["OWNER","MANAGER","RECEPTIONIST","ACCOUNTANT"].includes(businessRole)} /></div>
    </DashboardLayout>
  );
}
