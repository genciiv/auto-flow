const alerts = [
  ["Filtra vaji", "Mbetur 4 copë"],
  ["Vaj 5W-30", "Mbetur 6 bidona"],
  ["Ferodo Golf 7", "Mbetur 2 sete"],
];

export default function InventoryAlerts() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Sinjalizime magazine</h2>
      <div className="mt-6 space-y-3">
        {alerts.map(([item, stock]) => (
          <div
            key={item}
            className="rounded-2xl border border-amber-100 bg-amber-50 p-4"
          >
            <p className="font-bold text-slate-950">{item}</p>
            <p className="text-sm font-semibold text-amber-700">{stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
