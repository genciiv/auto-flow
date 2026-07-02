const options = [
  "Njoftime për termine",
  "Njoftime për stok të ulët",
  "Njoftime për fatura të papaguara",
  "Njoftime për marketplace",
];

export default function SettingsNotifications() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Njoftimet</h2>
      <p className="mt-1 text-sm text-slate-500">
        Zgjidh cilat njoftime do të marrë servisi.
      </p>

      <div className="mt-6 space-y-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
          >
            <span className="text-sm font-semibold text-slate-700">
              {option}
            </span>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </label>
        ))}
      </div>
    </div>
  );
}
