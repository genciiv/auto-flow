import AppointmentRowActions from "@/components/appointments/AppointmentRowActions";

function formatDate(date) {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function AppointmentsTable({
  appointments,
  customers,
  vehicles,
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e termineve</h2>

        <p className="mt-1 text-sm text-slate-500">
          Terminet e regjistruara në databazë.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Titulli</th>
              <th className="px-6 py-4">Klienti</th>
              <th className="px-6 py-4">Automjeti</th>
              <th className="px-6 py-4">Biznesi</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {appointments.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Nuk ka termine në databazë.
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => {
                const statusLabel =
                  appointment.status === "COMPLETED"
                    ? "Përfunduar"
                    : appointment.status === "IN_PROGRESS"
                      ? "Në proces"
                      : appointment.status === "PENDING"
                        ? "Në pritje"
                        : "Anuluar";

                return (
                  <tr key={appointment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {appointment.title}
                      </p>

                      {appointment.description && (
                        <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                          {appointment.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {appointment.customer?.name || "-"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {appointment.customer?.phone || "Pa numër telefoni"}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {appointment.vehicle
                          ? `${appointment.vehicle.brand} ${
                              appointment.vehicle.model || ""
                            }`
                          : "-"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {appointment.vehicle?.plate || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {appointment.business?.name || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {formatDate(appointment.date)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          appointment.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : appointment.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : appointment.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-red-50 text-red-700"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <AppointmentRowActions
                          appointment={appointment}
                          customers={customers}
                          vehicles={vehicles}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
