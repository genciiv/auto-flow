import InventoryRowActions from "@/components/inventory/InventoryRowActions";

const parts = [
  {
    code: "MANN-HU7020",
    name: "Filtri vajit MANN",
    category: "Filtra",
    supplier: "Auto Parts Albania",
    stock: 4,
    minStock: 5,
    buyPrice: "700 Lek",
    sellPrice: "1,200 Lek",
    status: "Stok i ulët",
  },
  {
    code: "CASTROL-5W30",
    name: "Vaj motori Castrol 5W-30",
    category: "Vajra",
    supplier: "Lubricants Tirana",
    stock: 18,
    minStock: 6,
    buyPrice: "1,400 Lek",
    sellPrice: "2,200 Lek",
    status: "Në stok",
  },
  {
    code: "BREMBO-DISK-G7",
    name: "Disk frenash Brembo Golf 7",
    category: "Frena",
    supplier: "Balkan Auto Parts",
    stock: 2,
    minStock: 4,
    buyPrice: "4,500 Lek",
    sellPrice: "7,500 Lek",
    status: "Stok i ulët",
  },
  {
    code: "BAT-VARTA-74AH",
    name: "Bateri Varta 74Ah",
    category: "Bateri",
    supplier: "Energy Auto",
    stock: 9,
    minStock: 3,
    buyPrice: "9,000 Lek",
    sellPrice: "13,500 Lek",
    status: "Në stok",
  },
];

export default function InventoryTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e pjesëve</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pjesët e regjistruara në magazinën e servisit.
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
              <th className="px-6 py-4">Çmimi blerjes</th>
              <th className="px-6 py-4">Çmimi shitjes</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {parts.map((part) => (
              <tr key={part.code} className="hover:bg-slate-50">
                <td className="px-6 py-5 text-sm font-bold text-blue-600">
                  {part.code}
                </td>

                <td className="px-6 py-5">
                  <p className="font-bold text-slate-950">{part.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Minimumi: {part.minStock}
                  </p>
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {part.category}
                </td>

                <td className="px-6 py-5 text-sm text-slate-600">
                  {part.supplier}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {part.stock}
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {part.buyPrice}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {part.sellPrice}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      part.status === "Në stok"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {part.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end">
                    <InventoryRowActions />
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
