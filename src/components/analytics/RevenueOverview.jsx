function formatMoney(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatCompactMoney(value) {
  return new Intl.NumberFormat("sq-AL", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function formatChange(value) {
  const number = Number(value || 0);
  const sign = number > 0 ? "+" : "";

  return `${sign}${number.toFixed(1)}%`;
}

export default function RevenueOverview({
  monthlyRevenue = [],
  revenueChange = 0,
}) {
  const maximumRevenue = Math.max(
    ...monthlyRevenue.map((item) => Number(item.revenue || 0)),
    1,
  );

  const totalRevenue = monthlyRevenue.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0,
  );

  const isPositive = Number(revenueChange || 0) >= 0;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Të ardhurat</h2>

          <p className="mt-1 text-sm text-slate-500">
            Përmbledhje e faturave të paguara gjatë 12 muajve të fundit.
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {formatMoney(totalRevenue)}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
            isPositive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {formatChange(revenueChange)}
        </span>
      </div>

      {monthlyRevenue.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50">
          <p className="text-sm font-medium text-slate-500">
            Nuk ka ende të ardhura të regjistruara.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex h-72 min-w-[720px] items-end gap-3">
            {monthlyRevenue.map((item) => {
              const revenue = Number(item.revenue || 0);

              const height =
                revenue > 0 ? Math.max((revenue / maximumRevenue) * 100, 5) : 2;

              return (
                <div
                  key={item.key}
                  className="group flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-6 items-center">
                    <span className="text-[10px] font-bold text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                      {formatCompactMoney(revenue)} L
                    </span>
                  </div>

                  <div className="flex h-52 w-full items-end">
                    <div
                      className="w-full rounded-t-2xl bg-blue-600/80 transition hover:bg-blue-600"
                      style={{
                        height: `${height}%`,
                      }}
                      title={formatMoney(revenue)}
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {item.label}
                  </span>

                  <span className="text-[10px] font-medium text-slate-400">
                    {item.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
