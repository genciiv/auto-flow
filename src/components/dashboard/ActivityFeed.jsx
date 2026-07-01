const activities = [
  ["BMW X5", "U përditësua statusi në proces", "2 min më parë"],
  ["Audi A4", "U krijua faturë e re", "18 min më parë"],
  ["VW Golf 7", "U shtua pjesë nga magazina", "42 min më parë"],
  ["Mercedes C220", "Klienti konfirmoi terminin", "1 orë më parë"],
];

export default function ActivityFeed() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Aktivitetet e fundit</h2>

      <div className="mt-6 space-y-4">
        {activities.map(([title, description, time]) => (
          <div
            key={title + time}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-bold text-slate-950">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>

            <span className="text-sm font-semibold text-slate-400">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
