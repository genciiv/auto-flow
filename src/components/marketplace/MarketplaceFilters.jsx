import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

function buildFilterUrl({ search = "", type = "", status = "" }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (type) {
    params.set("type", type);
  }

  if (status) {
    params.set("status", status);
  }

  const query = params.toString();

  return query ? `/dashboard/marketplace?${query}` : "/dashboard/marketplace";
}

export default function MarketplaceFilters({
  search = "",
  selectedType = "",
  selectedStatus = "",
}) {
  const filters = [
    {
      label: "Të gjitha",
      value: "",
    },
    {
      label: "Pjesë",
      value: "PART",
    },
    {
      label: "Makina",
      value: "VEHICLE",
    },
  ];

  return (
    <form
      method="GET"
      className="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-md">
        <Search size={18} className="shrink-0 text-slate-400" />

        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Kërko produkt, makinë, pjesë..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = selectedType === filter.value;

          return (
            <Link
              key={filter.value || "all"}
              href={buildFilterUrl({
                search,
                type: filter.value,
                status: selectedStatus,
              })}
              className={
                isActive
                  ? "rounded-full bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700"
                  : "rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              }
            >
              {filter.label}
            </Link>
          );
        })}

        <select
          name="status"
          defaultValue={selectedStatus}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50"
        >
          <option value="">Të gjitha statuset</option>
          <option value="PUBLISHED">Publikuar</option>
          <option value="DRAFT">Draft</option>
          <option value="SOLD">Shitur</option>
          <option value="ARCHIVED">Arkivuar</option>
          <option value="REJECTED">Refuzuar</option>
        </select>

        <input type="hidden" name="type" value={selectedType} />

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <SlidersHorizontal size={17} />
          Filtra
        </button>
      </div>
    </form>
  );
}
