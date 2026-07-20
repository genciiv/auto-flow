import AppointmentStats from "@/components/appointments/AppointmentStats";
import AppointmentsView from "@/components/appointments/AppointmentsView";
import CreateAppointmentModal from "@/components/appointments/CreateAppointmentModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

export default async function AppointmentsPage() {
  const { businessId } = await requireBusinessContext();

  const [appointments, customers, vehicles] = await Promise.all([
    db.appointment.findMany({
      where: {
        businessId,
      },
      orderBy: {
        date: "asc",
      },
      include: {
        vehicle: true,
        customer: true,
        business: true,
      },
    }),

    db.customer.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    }),

    db.vehicle.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        customerId: true,
        plate: true,
        brand: true,
        model: true,
      },
    }),
  ]);

  const stats = {
    totalAppointments: appointments.length,

    pendingAppointments: appointments.filter(
      (appointment) => appointment.status === "PENDING",
    ).length,

    inProgressAppointments: appointments.filter(
      (appointment) => appointment.status === "IN_PROGRESS",
    ).length,

    completedAppointments: appointments.filter(
      (appointment) => appointment.status === "COMPLETED",
    ).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Menaxhimi i servisit
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Terminet
            </h1>

            <p className="mt-2 text-slate-500">
              Planifiko vizitat, menaxho rezervimet dhe nis shërbimet e
              automjeteve.
            </p>
          </div>

          <CreateAppointmentModal customers={customers} vehicles={vehicles} />
        </div>

        <AppointmentStats stats={stats} />

        <AppointmentsView
          appointments={appointments}
          customers={customers}
          vehicles={vehicles}
        />
      </div>
    </DashboardLayout>
  );
}
