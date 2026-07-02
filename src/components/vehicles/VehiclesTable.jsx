import VehicleRowActions from "@/components/vehicles/VehicleRowActions";

const vehicles = [
  {
    plate: "AA123BB",
    brand: "BMW X5",
    year: "2018",
    owner: "Arben Hoxha",
    vin: "WBA1234567890X5",
    lastService: "12/06/2026",
    status: "Në servis",
  },
  {
    plate: "AB456CD",
    brand: "Audi A4",
    year: "2017",
    owner: "Elira Dervishi",
    vin: "WAU987654321A4",
    lastService: "03/06/2026",
    status: "Aktiv",
  },
  {
    plate: "AC789EF",
    brand: "Mercedes C220",
    year: "2019",
    owner: "Gentian Kola",
    vin: "WDD1122334455C220",
    lastService: "29/05/2026",
    status: "Në pritje",
  },
  {
    plate: "AD321FG",
    brand: "Toyota Yaris",
    year: "2016",
    owner: "Mira Leka",
    vin: "JTD5566778899YR",
    lastService: "15/05/2026",
    status: "Aktiv",
  },
];

export default function VehiclesTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">
          Lista e automjeteve
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Automjetet e regjistruara në servis.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Targa</th>
              <th className="px-6 py-4">Automjeti</th>
              <th className="px-6 py-4">Pronari</th>
              <th className="px-6 py-4">VIN</th>
              <th className="px-6 py-4">Servisi i fundit</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.plate} className="hover:bg-slate-50">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-950">{vehicle.plate}</p>
                </td>

                <td className="px-6 py-5">
                  <p className="font-bold text-slate-950">{vehicle.brand}</p>
                  <p className="mt-1 text-sm text-slate-500">{vehicle.year}</p>
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {vehicle.owner}
                </td>

                <td className="px-6 py-5 text-sm text-slate-600">
                  {vehicle.vin}
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {vehicle.lastService}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      vehicle.status === "Aktiv"
                        ? "bg-emerald-50 text-emerald-700"
                        : vehicle.status === "Në pritje"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end">
                    <VehicleRowActions />
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
