"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

export default function InventoryFilters({
  search = "",
  stockStatus = "ALL",
  sort = "NEWEST",
  resultCount = 0,
  totalCount = 0,
  onSearchChange,
  onStockStatusChange,
  onSortChange,
  onReset,
}) {
  const hasActiveFilters =
    search.trim() !== "" || stockStatus !== "ALL" || sort !== "NEWEST";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SlidersHorizontal className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Kërko dhe filtro
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Kërko sipas emrit, kodit, kategorisë ose furnitorit.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            {resultCount} nga {totalCount} pjesë
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Pastro
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_210px_220px]">
        <div>
          <label
            htmlFor="inventory-search"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Kërko pjesë
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="inventory-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Emri, kodi, kategoria ose furnitori..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="inventory-status"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Statusi i stokut
          </label>

          <select
            id="inventory-status"
            value={stockStatus}
            onChange={(event) => onStockStatusChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ALL">Të gjitha pjesët</option>
            <option value="OUT_OF_STOCK">Jashtë stokut</option>
            <option value="LOW_STOCK">Stok i ulët</option>
            <option value="IN_STOCK">Në rregull</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="inventory-sort"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Renditja
          </label>

          <select
            id="inventory-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="NEWEST">Më të rejat</option>
            <option value="OLDEST">Më të vjetrat</option>
            <option value="NAME_ASC">Emri A–Z</option>
            <option value="NAME_DESC">Emri Z–A</option>
            <option value="STOCK_HIGH">Stoku më i lartë</option>
            <option value="STOCK_LOW">Stoku më i ulët</option>
            <option value="BUY_HIGH">Blerja më e lartë</option>
            <option value="SELL_HIGH">Shitja më e lartë</option>
            <option value="VALUE_HIGH">Vlera më e lartë</option>
          </select>
        </div>
      </div>
    </div>
  );
}
