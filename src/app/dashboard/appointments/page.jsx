import AppointmentStats from "@/components/appointments/AppointmentStats";
import AppointmentsView from "@/components/appointments/AppointmentsView";
import CreateAppointmentModal from "@/components/appointments/CreateAppointmentModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function AppointmentsPage() {
  const { businessId, businessRole } = await requireBusinessPermission(
    PERMISSIONS.APPOINTMENTS_VIEW,
  );

  const [appointments, customers, vehicles, staff] = await Promise.all([
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
        assignedUser: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, status: true } },
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

    db.businessUser.findMany({
      where: {
        businessId,
        isActive: true,
        role: { in: ["OWNER", "MANAGER", "MECHANIC", "RECEPTIONIST"] },
      },
      orderBy: { user: { name: "asc" } },
      select: {
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const clientAppointments = JSON.parse(
    JSON.stringify(appointments),
  );

  const clientCustomers = JSON.parse(
    JSON.stringify(customers),
  );

  const clientVehicles = JSON.parse(
    JSON.stringify(vehicles),
  );

  const clientStaff = JSON.parse(
    JSON.stringify(staff),
  );

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

  const canCreateAppointment = hasPermission(
    businessRole,
    PERMISSIONS.APPOINTMENTS_CREATE,
  );

  const canUpdateAppointment = hasPermission(
    businessRole,
    PERMISSIONS.APPOINTMENTS_UPDATE,
  );

  const canDeleteAppointment = hasPermission(
    businessRole,
    PERMISSIONS.APPOINTMENTS_DELETE,
  );

  const canCreateService = hasPermission(
    businessRole,
    PERMISSIONS.SERVICES_CREATE,
  );

  return (
    <DashboardLayout>
      <div className="af-page-stack">
        <div className="af-page-header">
          <div>
            <p className="af-page-eyebrow">
              Menaxhimi i servisit
            </p>

            <h1 className="af-page-title">
              Terminet
            </h1>

            <p className="af-page-description">
              Planifiko vizitat, menaxho rezervimet dhe nis shërbimet e
              automjeteve.
            </p>
          </div>

          {canCreateAppointment ? (
            <CreateAppointmentModal customers={clientCustomers} vehicles={clientVehicles} staff={clientStaff} />
          ) : null}
        </div>

        <AppointmentStats stats={stats} />

        <AppointmentsView
          appointments={clientAppointments}
          customers={clientCustomers}
          vehicles={clientVehicles}
          staff={clientStaff}
          canUpdateAppointment={canUpdateAppointment}
          canDeleteAppointment={canDeleteAppointment}
          canStartService={canUpdateAppointment && canCreateService}
        />
      </div>
    </DashboardLayout>
  );
}
