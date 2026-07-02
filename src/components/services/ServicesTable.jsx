import ServiceRowActions from "@/components/services/ServiceRowActions";

const services = [
  {
    id: "#SRV-1024",
    vehicle: "BMW X5",
    plate: "AA123BB",
    customer: "Arben Hoxha",
    service: "Ndërrim vaji + filtra",
    mechanic: "Ilir",
    status: "Në proces",
    total: "€240",
  },
  {
    id: "#SRV-1025",
    vehicle: "Audi A4",
    plate: "AB456CD",
    customer: "Elira Dervishi",
    service: "Diagnostikim OBD",
    mechanic: "Ardi",
    status: "Në pritje",
    total: "€35",
  },
  {
    id: "#SRV-1026",
    vehicle: "VW Golf 7",
    plate: "AC789EF",
    customer: "Gentian Kola",
    service: "Kontroll frenash",
    mechanic: "Ilir",
    status: "Përfunduar",
    total: "€180",
  },
  {
    id: "#SRV-1027",
    vehicle: "Mercedes C220",
    plate: "AD321FG",
    customer: "Mira Leka",
    service: "Goma + balancim",
    mechanic: "Ardi",
    status: "Në proces",
    total: "€90",
  },
];

export default function ServicesTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e shërbimeve</h2>
        <p className="mt-1 text-sm text-slate-500">
          Punët aktive dhe historiku i shërbimeve.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Automjeti</th>
              <th className="px-6 py-4">Klienti</th>
              <th className="px-6 py-4">Shërbimi</th>
              <th className="px-6 py-4">Mekaniku</th>
              <th className="px-6 py-4">Totali</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {services.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-5 text-sm font-bold text-blue-600">
                  {item.id}
                </td>

                <td className="px-6 py-5">
                  <p className="font-bold text-slate-950">{item.vehicle}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.plate}</p>
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {item.customer}
                </td>

                <td className="px-6 py-5 text-sm text-slate-600">
                  {item.service}
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {item.mechanic}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {item.total}
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
                    <ServiceRowActions />
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
