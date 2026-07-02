import MarketplaceProductActions from "@/components/marketplace/MarketplaceProductActions";

const products = [
  {
    name: "Vaj motori Castrol 5W-30",
    category: "Vajra",
    price: "2,200 Lek",
    stock: "18 në stok",
    status: "Aktiv",
  },
  {
    name: "Disk frenash Brembo Golf 7",
    category: "Frena",
    price: "7,500 Lek",
    stock: "2 në stok",
    status: "Stok i ulët",
  },
  {
    name: "BMW 320d 2018",
    category: "Makina",
    price: "2,200,000 Lek",
    stock: "1 në shitje",
    status: "Aktiv",
  },
  {
    name: "Bateri Varta 74Ah",
    category: "Bateri",
    price: "13,500 Lek",
    stock: "9 në stok",
    status: "Aktiv",
  },
  {
    name: "Diagnostikë OBD Professional",
    category: "Vegla",
    price: "45,000 Lek",
    stock: "4 në stok",
    status: "Aktiv",
  },
  {
    name: "Goma Michelin 225/45/R17",
    category: "Goma",
    price: "9,500 Lek",
    stock: "12 në stok",
    status: "Aktiv",
  },
];

export default function MarketplaceGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <div
          key={product.name}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
        >
          <div className="relative h-48 bg-slate-100">
            <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
              {product.category}
            </div>

            <div className="absolute right-4 top-4">
              <MarketplaceProductActions />
            </div>

            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
              Product image
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-950">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{product.stock}</p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  product.status === "Aktiv"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {product.status}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xl font-bold text-slate-950">
                {product.price}
              </p>

              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                Shiko
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
