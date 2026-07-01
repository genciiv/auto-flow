export default function SidebarGroup({ title, items }) {
  return (
    <div>
      <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.active;

          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </a>
          );
        })}
      </div>
    </div>
  );
}
