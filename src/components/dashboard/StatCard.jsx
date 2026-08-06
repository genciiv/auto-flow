export default function StatCard({ title, value, change, icon: Icon }) {
  const hasChange = change !== undefined && change !== null && change !== "";

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
          <Icon size={20} strokeWidth={2.1} />
        </div>

        {hasChange ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            {change}
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-[13px] font-medium text-slate-500">{title}</p>
      <p className="mt-1.5 text-[1.65rem] font-extrabold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}
