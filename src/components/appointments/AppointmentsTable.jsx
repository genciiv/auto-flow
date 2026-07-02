import AppointmentRowActions from "@/components/appointments/AppointmentRowActions";

const appointments = [
  {
    id: "#APT-1001",
    customer: "Arben Hoxha",
    vehicle: "BMW X5",
    plate: "AA123BB",
    service: "Ndërrim vaji + filtra",
    date: "02/07/2026",
    time: "09:30",
    status: "Konfirmuar",
  },
  {
    id: "#APT-1002",
    customer: "Elira Dervishi",
    vehicle: "Audi A4",
    plate: "AB456CD",
    service: "Diagnostikim OBD",
    date: "02/07/2026",
    time: "11:00",
    status: "Në pritje",
  },
  {
    id: "#APT-1003",
    customer: "Gentian Kola",
    vehicle: "Mercedes C220",
    plate: "AC789EF",
    service: "Kontroll frenash",
    date: "02/07/2026",
    time: "13:45",
    status: "Përfunduar",
  },
  {
    id: "#APT-1004",
    customer: "Mira Leka",
    vehicle: "Toyota Yaris",
    plate: "AD321FG",
    service: "Goma + balancim",
    date: "03/07/2026",
    time: "10:15",
    status: "Konfirmuar",
  },
];

export default function AppointmentsTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e termineve</h2>
        <p className="mt-1 text-sm text-slate-500">
          Rezervimet e klientëve dhe statuset e tyre.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Klienti</th>
              <th className="px-6 py-4">Automjeti</th>
              <th className="px-6 py-4">Shërbimi</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Ora</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {appointments.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-5 text-sm font-bold text-blue-600">
                  {item.id}
                </td>

                <td className="px-6 py-5">
                  <p className="font-bold text-slate-950">{item.customer}</p>
                </td>

                <td className="px-6 py-5">
                  <p className="font-bold text-slate-950">{item.vehicle}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.plate}</p>
                </td>

                <td className="px-6 py-5 text-sm text-slate-600">
                  {item.service}
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {item.date}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {item.time}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.status === "Përfunduar"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "Në pritje"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end">
                    <AppointmentRowActions />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
