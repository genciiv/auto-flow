export default function PurchaseItemsList({ items = [] }) {
  if (items.length === 0) {
    return (
      <p className="mt-2 text-xs text-slate-400">Nuk ka artikuj të shtuar.</p>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"
        >
          <span className="font-semibold text-slate-700">
            {item.name} × {item.quantity}
          </span>

          <span className="font-bold text-slate-950">
            {Number(item.total || 0).toFixed(0)} Lek
          </span>
        </div>
      ))}
    </div>
  );
}
