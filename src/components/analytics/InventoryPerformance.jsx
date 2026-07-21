import { Package } from "lucide-react";

function formatMoney(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("sq-AL").format(Number(value || 0));
}

export default function InventoryPerformance({ items = [] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">
        Pjesët më të përdorura
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Artikujt që kanë lëvizur më shumë nga magazina.
      </p>

      {items.length === 0 ? (
        <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400">
            <Package size={22} />
          </div>

          <p className="mt-4 font-bold text-slate-700">
            Nuk ka përdorime pjesësh
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Pjesët do të shfaqen pasi të përdoren në shërbime.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-950">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.code || "Pa kod"}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-bold text-blue-600">
                  {formatNumber(item.quantity)} përdorime
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-xs font-medium text-slate-500">
                  Vlera e përdorur
                </span>

                <span className="text-sm font-bold text-slate-950">
                  {formatMoney(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
