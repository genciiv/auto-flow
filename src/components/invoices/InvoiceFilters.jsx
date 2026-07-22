"use client";

import {
  ArrowDownAZ,
  CalendarArrowDown,
  CalendarArrowUp,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

const statusOptions = [
  {
    value: "ALL",
    label: "Të gjitha statuset",
  },
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "UNPAID",
    label: "E papaguar",
  },
  {
    value: "PAID",
    label: "E paguar",
  },
  {
    value: "OVERDUE",
    label: "E vonuar",
  },
];

const sortOptions = [
  {
    value: "NEWEST",
    label: "Më të rejat",
  },
  {
    value: "OLDEST",
    label: "Më të vjetrat",
  },
  {
    value: "TOTAL_HIGH",
    label: "Totali: më i larti",
  },
  {
    value: "TOTAL_LOW",
    label: "Totali: më i ulti",
  },
  {
    value: "NUMBER_ASC",
    label: "Numri i faturës A–Z",
  },
];

function SortIcon({ sort, className }) {
  if (sort === "OLDEST") {
    return <CalendarArrowUp className={className} />;
  }

  if (sort === "NEWEST") {
    return <CalendarArrowDown className={className} />;
  }

  return <ArrowDownAZ className={className} />;
}

export default function InvoiceFilters({
  search,
  status,
  sort,
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
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />

              <h2 className="text-sm font-semibold text-slate-900">
                Kërko dhe filtro
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Kërko sipas faturës, klientit, targës ose shërbimit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              {resultCount} nga {totalCount} fatura
            </span>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Pastro
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div>
          <label
            htmlFor="invoice-search"
            className="mb-2 block text-xs font-medium text-slate-600"
          >
            Kërko faturë
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="invoice-search"
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Numri, klienti, targa ose shërbimi..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Pastro kërkimin"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="invoice-status"
            className="mb-2 block text-xs font-medium text-slate-600"
          >
            Statusi
          </label>

          <select
            id="invoice-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="invoice-sort"
            className="mb-2 block text-xs font-medium text-slate-600"
          >
            Renditja
          </label>

          <div className="relative">
            <SortIcon
              sort={sort}
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />

            <select
              id="invoice-sort"
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.09 1.03l-4.25 4.5a.75.75 0 01-1.09 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
