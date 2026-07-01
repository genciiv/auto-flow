import { CalendarPlus, Car, FileText, PackagePlus } from "lucide-react";

const actions = [
  { title: "Shto klient", icon: Car },
  { title: "Krijo termin", icon: CalendarPlus },
  { title: "Shto pjesë", icon: PackagePlus },
  { title: "Krijo faturë", icon: FileText },
];

export default function QuickActions() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Veprime të shpejta</h2>
      <p className="mt-1 text-sm text-slate-500">
        Hapat më të përdorur nga servisi.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Icon size={19} />
              </div>
              {action.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
