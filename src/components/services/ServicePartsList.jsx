export default function ServicePartsList({ parts = [] }) {
  if (parts.length === 0) {
    return (
      <p className="mt-2 text-xs text-slate-400">Nuk ka pjesë të përdorura.</p>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      {parts.map((usage) => (
        <div
          key={usage.id}
          className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"
        >
          <span className="font-semibold text-slate-700">
            {usage.part?.name} × {usage.quantity}
          </span>

          <span className="font-bold text-slate-950">
            {Number(usage.total || 0).toFixed(0)} Lek
          </span>
        </div>
      ))}
    </div>
  );
}
