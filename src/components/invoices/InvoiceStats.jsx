import { BadgeEuro, CheckCircle2, Clock3, FileText } from "lucide-react";

const stats = [
  { title: "Total fatura", value: "428", icon: FileText },
  { title: "Të paguara", value: "364", icon: CheckCircle2 },
  { title: "Në pritje", value: "42", icon: Clock3 },
  { title: "Të ardhura", value: "€32,480", icon: BadgeEuro },
];

export default function InvoiceStats() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon size={22} />
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              {stat.title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
