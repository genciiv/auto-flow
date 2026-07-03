export default function InventoryAlerts({ parts = [] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Sinjalizime magazine</h2>

      <div className="mt-6 space-y-3">
        {parts.length === 0 ? (
          <p className="text-sm text-slate-500">Nuk ka stok të ulët.</p>
        ) : (
          parts.map((part) => (
            <div
              key={part.id}
              className="rounded-2xl border border-amber-100 bg-amber-50 p-4"
            >
              <p className="font-bold text-slate-950">{part.name}</p>
              <p className="text-sm font-semibold text-amber-700">
                Mbetur {part.stock} copë
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
