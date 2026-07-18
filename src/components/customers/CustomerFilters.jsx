"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

export default function CustomerFilters({
  search = "",
  status = "ALL",
  sort = "NEWEST",
  resultCount = 0,
  totalCount = 0,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onReset,
}) {
  const hasActiveFilters =
    search.trim() !== "" || status !== "ALL" || sort !== "NEWEST";

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
              Kërko sipas klientit, telefonit, qytetit ose automjetit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            {resultCount} nga {totalCount} klientë
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

      <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
        <div>
          <label
            htmlFor="customer-search"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Kërko klient
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Emri, telefoni, email-i, qyteti ose targa..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="customer-status"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Statusi
          </label>

          <select
            id="customer-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ALL">Të gjithë klientët</option>
            <option value="ACTIVE">Aktivë</option>
            <option value="INACTIVE">Jo aktivë</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="customer-sort"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Renditja
          </label>

          <select
            id="customer-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="NEWEST">Më të rejat</option>
            <option value="OLDEST">Më të vjetrat</option>
            <option value="NAME_ASC">Emri A–Z</option>
            <option value="NAME_DESC">Emri Z–A</option>
            <option value="SPENT_HIGH">Shpenzimi më i lartë</option>
            <option value="SPENT_LOW">Shpenzimi më i ulët</option>
          </select>
        </div>
      </div>
    </div>
  );
}
