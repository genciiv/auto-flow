import PurchaseRowActions from "@/components/purchases/PurchaseRowActions";

export default function PurchasesTable({ purchases }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e porosive</h2>
        <p className="mt-1 text-sm text-slate-500">
          Porositë e regjistruara në databazë.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Furnitori</th>
              <th className="px-6 py-4">Artikujt</th>
              <th className="px-6 py-4">Biznesi</th>
              <th className="px-6 py-4">Totali</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {purchases.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Nuk ka porosi në databazë.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => {
                const itemsLabel =
                  purchase.items.length > 0
                    ? purchase.items
                        .map((item) => `${item.name} (${item.quantity})`)
                        .join(", ")
                    : "-";

                const statusLabel =
                  purchase.status === "RECEIVED"
                    ? "Përfunduar"
                    : purchase.status === "ORDERED"
                      ? "Në transport"
                      : purchase.status === "PENDING"
                        ? "Në pritje"
                        : "Anuluar";

                return (
                  <tr key={purchase.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {purchase.supplier}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {itemsLabel}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {purchase.business?.name || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-950">
                      {Number(purchase.total || 0).toFixed(0)} Lek
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          purchase.status === "RECEIVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : purchase.status === "ORDERED"
                              ? "bg-blue-50 text-blue-700"
                              : purchase.status === "PENDING"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {new Intl.DateTimeFormat("sq-AL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(purchase.createdAt))}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <PurchaseRowActions />
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
