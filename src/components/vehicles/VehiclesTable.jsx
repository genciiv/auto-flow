import VehicleRowActions from "@/components/vehicles/VehicleRowActions";

export default function VehiclesTable({ vehicles }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">
          Lista e automjeteve
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Automjetet e regjistruara në databazë.
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
              <th className="px-6 py-4">Shërbime</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Nuk ka automjete në databazë.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => {
                const latestService = vehicle.services[0];
                const status =
                  latestService?.status === "COMPLETED"
                    ? "Aktiv"
                    : latestService?.status === "PENDING"
                      ? "Në pritje"
                      : latestService?.status === "IN_PROGRESS"
                        ? "Në servis"
                        : "Aktiv";

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {vehicle.plate}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {vehicle.brand} {vehicle.model || ""}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {vehicle.year || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {vehicle.customer?.name || "Pa pronar"}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {vehicle.vin || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-950">
                      {vehicle.services.length}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          status === "Aktiv"
                            ? "bg-emerald-50 text-emerald-700"
                            : status === "Në pritje"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <VehicleRowActions />
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
