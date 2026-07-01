const services = [
  ["BMW X5", "Ndërrim vaji + filtra", "Në proces", "09:30"],
  ["Audi A4", "Diagnostikim OBD", "Në pritje", "11:00"],
  ["VW Golf 7", "Kontroll frenash", "Përfunduar", "13:45"],
  ["Mercedes C220", "Goma + balancim", "Në proces", "15:20"],
];

export default function RecentServices() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Shërbimet e sotme</h2>
      <div className="mt-6 space-y-4">
        {services.map(([car, service, status, time]) => (
          <div
            key={car}
            className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-bold text-slate-950">{car}</p>
              <p className="mt-1 text-sm text-slate-500">{service}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                {time}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
