import { notFound } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InvoiceDetails from "@/components/invoices/details/InvoiceDetails";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

export default async function InvoiceDetailsPage({ params }) {
  const { businessId } = await requireBusinessContext();
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
      service: {
        include: {
          vehicle: true,
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
    </DashboardLayout>
  );
}
