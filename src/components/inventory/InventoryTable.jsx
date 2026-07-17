import InventoryRowActions from "@/components/inventory/InventoryRowActions";

export default function InventoryTable({ parts }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e pjesëve</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pjesët e regjistruara në databazë.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Kodi</th>
              <th className="px-6 py-4">Pjesa</th>
              <th className="px-6 py-4">Kategoria</th>
              <th className="px-6 py-4">Furnitori</th>
              <th className="px-6 py-4">Stoku</th>
              <th className="px-6 py-4">Blerje</th>
              <th className="px-6 py-4">Shitje</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {parts.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Nuk ka pjesë në databazë.
                </td>
              </tr>
            ) : (
              parts.map((part) => {
                const lowStock =
                  Number(part.stock || 0) <= Number(part.minStock || 0);

                return (
                  <tr key={part.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5 text-sm font-bold text-blue-600">
                      {part.code || "-"}
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">{part.name}</p>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {part.category || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {part.supplier || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-950">
                      {part.stock}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {Number(part.buyPrice || 0).toFixed(0)} Lek
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {Number(part.sellPrice || 0).toFixed(0)} Lek
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          lowStock
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {lowStock ? "Stok i ulët" : "Në rregull"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <InventoryRowActions part={part} />
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
