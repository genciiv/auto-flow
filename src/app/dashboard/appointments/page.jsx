import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AppointmentStats from "@/components/appointments/AppointmentStats";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentsTable from "@/components/appointments/AppointmentsTable";
import CreateAppointmentModal from "@/components/appointments/CreateAppointmentModal";
import { db } from "@/lib/db";

export default async function AppointmentsPage() {
  const [appointments, customers, vehicles] = await Promise.all([
    db.appointment.findMany({
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

  const totalAppointments = appointments.length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "PENDING",
  ).length;

  const inProgressAppointments = appointments.filter(
    (appointment) => appointment.status === "IN_PROGRESS",
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "COMPLETED",
  ).length;

  const stats = {
    totalAppointments,
    pendingAppointments,
    inProgressAppointments,
    completedAppointments,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Appointments</p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Terminet
            </h1>

            <p className="mt-2 text-slate-500">
              Menaxho rezervimet, servisët e planifikuar dhe statuset e tyre.
            </p>
          </div>

          <CreateAppointmentModal customers={customers} vehicles={vehicles} />
        </div>

        <AppointmentStats stats={stats} />

        <AppointmentFilters />

        <AppointmentsTable
          appointments={appointments}
          customers={customers}
          vehicles={vehicles}
        />
      </div>
    </DashboardLayout>
  );
}
