import Link from "next/link";
import { Filter, Search, X } from "lucide-react";

export default function InquiryFilters({ search = "", status = "ALL" }) {
  const hasFilters = Boolean(search) || status !== "ALL";

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <form
        action="/dashboard/marketplace/inquiries"
        method="GET"
        className="flex flex-col gap-3 lg:flex-row"
      >
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Kërko emër, telefon, email ose publikim..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="relative lg:w-52">
          <Filter
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            name="status"
            defaultValue={status}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ALL">Të gjitha</option>
            <option value="UNREAD">Të palexuara</option>
            <option value="READ">Të lexuara</option>
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Filtro
        </button>

        {hasFilters ? (
          <Link
            href="/dashboard/marketplace/inquiries"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <X size={17} />
            Pastro
          </Link>
        ) : null}
      </form>
    </div>
  );
}
