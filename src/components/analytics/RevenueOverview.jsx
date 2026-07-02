const bars = [42, 58, 48, 76, 69, 84, 72, 91, 80, 96, 88, 100];

export default function RevenueOverview() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Të ardhurat</h2>
          <p className="mt-1 text-sm text-slate-500">
            Përmbledhje mujore e performancës financiare.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          +18%
        </span>
      </div>

      <div className="flex h-72 items-end gap-3">
        {bars.map((height, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-2xl bg-blue-600/80"
              style={{ height: `${height}%` }}
            />
            <span className="text-xs font-semibold text-slate-400">
              {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
