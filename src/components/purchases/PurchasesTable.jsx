import PurchaseRowActions from "@/components/purchases/PurchaseRowActions";

const purchases = [
  {
    id: "#PO-1001",
    supplier: "Auto Parts Albania",
    items: "Filtra vaji, filtra ajri",
    date: "02/07/2026",
    total: "42,000 Lek",
    status: "Në pritje",
  },
  {
    id: "#PO-1002",
    supplier: "Lubricants Tirana",
    items: "Vaj Castrol 5W-30",
    date: "01/07/2026",
    total: "68,000 Lek",
    status: "Në transport",
  },
  {
    id: "#PO-1003",
    supplier: "Balkan Auto Parts",
    items: "Disqe frenash, ferodo",
    date: "29/06/2026",
    total: "95,000 Lek",
    status: "Përfunduar",
  },
  {
    id: "#PO-1004",
    supplier: "Energy Auto",
    items: "Bateri Varta 74Ah",
    date: "27/06/2026",
    total: "81,000 Lek",
    status: "Përfunduar",
  },
];

export default function PurchasesTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e porosive</h2>
        <p className="mt-1 text-sm text-slate-500">
          Porositë e pjesëve dhe blerjet nga furnitorët.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Furnitori</th>
              <th className="px-6 py-4">Artikujt</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Totali</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-slate-50">
                <td className="px-6 py-5 text-sm font-bold text-blue-600">
                  {purchase.id}
                </td>

                <td className="px-6 py-5 font-bold text-slate-950">
                  {purchase.supplier}
                </td>

                <td className="px-6 py-5 text-sm text-slate-600">
                  {purchase.items}
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {purchase.date}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {purchase.total}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      purchase.status === "Përfunduar"
                        ? "bg-emerald-50 text-emerald-700"
                        : purchase.status === "Në transport"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {purchase.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end">
                    <PurchaseRowActions />
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
