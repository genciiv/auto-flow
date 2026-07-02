const items = [
  ["Vaj 5W-30", "124 përdorime"],
  ["Filtra vaji", "98 përdorime"],
  ["Ferodo", "64 përdorime"],
  ["Disk frenash", "42 përdorime"],
];

export default function InventoryPerformance() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">
        Pjesët më të përdorura
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Artikujt që lëvizin më shumë nga magazina.
      </p>

      <div className="mt-6 space-y-4">
        {items.map(([name, usage]) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
          >
            <p className="font-bold text-slate-950">{name}</p>
            <p className="text-sm font-semibold text-slate-500">{usage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
