const services = [
  ["Ndërrim vaji", "168", "€6,420"],
  ["Diagnostikim", "96", "€2,880"],
  ["Frena", "74", "€4,260"],
  ["Goma", "58", "€2,150"],
];

export default function ServicePerformance() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">
        Shërbimet më të kërkuara
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Performanca sipas llojit të shërbimit.
      </p>

      <div className="mt-6 space-y-4">
        {services.map(([name, count, revenue]) => (
          <div key={name} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-950">{name}</p>
              <p className="text-sm font-bold text-blue-600">{revenue}</p>
            </div>
            <p className="mt-1 text-sm text-slate-500">{count} shërbime</p>
          </div>
        ))}
      </div>
    </div>
  );
}
