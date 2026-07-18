import AddServicePartModal from "@/components/services/AddServicePartModal";
import ServicePartsList from "@/components/services/ServicePartsList";
import ServiceRowActions from "@/components/services/ServiceRowActions";
import { formatCurrency } from "@/lib/formatters";

export default function ServicesTable({
  services = [],
  vehicles = [],
  parts = [],
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e shërbimeve</h2>

        <p className="mt-1 text-sm text-slate-500">
          Shërbimet e regjistruara në databazë.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Automjeti</th>
              <th className="px-6 py-4">Përshkrimi</th>
              <th className="px-6 py-4">Biznesi</th>
              <th className="px-6 py-4">Totali</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {services.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Nuk ka shërbime në databazë.
                </td>
              </tr>
            ) : (
              services.map((service) => {
                const statusLabel =
                  service.status === "COMPLETED"
                    ? "Përfunduar"
                    : service.status === "PENDING"
                      ? "Në pritje"
                      : service.status === "IN_PROGRESS"
                        ? "Në proces"
                        : "Anuluar";

                return (
                  <tr key={service.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-5 text-sm font-bold text-blue-600">
                      {service.id.slice(0, 8)}
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {service.vehicle?.brand} {service.vehicle?.model || ""}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {service.vehicle?.plate || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {service.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {service.description || "-"}
                      </p>

                      <ServicePartsList parts={service.partsUsed || []} />
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {service.business?.name || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-950">
                      {formatCurrency(service.total)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          service.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : service.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : service.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-red-50 text-red-700"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <AddServicePartModal
                          serviceId={service.id}
                          parts={parts}
                        />

                        <ServiceRowActions
                          service={service}
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
