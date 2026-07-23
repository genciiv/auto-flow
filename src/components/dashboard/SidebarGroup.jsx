import Link from "next/link";

export default function SidebarGroup({ title, items, pathname }) {
  return (
    <div>
      <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          const badge = Number(item.badge || 0);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon size={19} />

              <span className="min-w-0 flex-1 truncate">{item.name}</span>

              {badge > 0 ? (
                <span
                  className={`inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
