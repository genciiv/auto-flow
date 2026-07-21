import { Wrench } from "lucide-react";

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

export default function ServicePerformance({ services = [] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">
        Shërbimet më të kërkuara
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Performanca sipas titullit të shërbimit.
      </p>

      {services.length === 0 ? (
        <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400">
            <Wrench size={22} />
          </div>

          <p className="mt-4 font-bold text-slate-700">Nuk ka ende shërbime</p>

          <p className="mt-1 text-sm text-slate-500">
            Statistikat do të shfaqen pasi të regjistrohen shërbimet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {services.map((service, index) => (
            <div
              key={`${service.name}-${index}`}
              className="rounded-2xl bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-950">
                    {service.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatNumber(service.count)}{" "}
                    {service.count === 1 ? "shërbim" : "shërbime"}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-bold text-blue-600">
                  {formatMoney(service.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
