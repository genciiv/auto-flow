import Link from "next/link";

export default function SidebarGroup({ title, items, pathname, onNavigate }) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
        {title}
      </p>

      <div className="space-y-0.5">
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
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150 ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              {isActive ? (
                <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-blue-600" />
              ) : null}

              <Icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.9}
                className={`shrink-0 transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-500 group-hover:text-slate-800"
                }`}
              />

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
