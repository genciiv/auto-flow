import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AppointmentStats from "@/components/appointments/AppointmentStats";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentsTable from "@/components/appointments/AppointmentsTable";

export default function AppointmentsPage() {
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
              Menaxho rezervimet, oraret dhe statuset e termineve të servisit.
            </p>
          </div>

          <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Krijo termin
          </button>
        </div>

        <AppointmentStats />
        <AppointmentFilters />
        <AppointmentsTable />
      </div>
    </DashboardLayout>
  );
}
