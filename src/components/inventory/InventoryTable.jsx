"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { FileSearch, Package } from "lucide-react";

import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryRowActions from "@/components/inventory/InventoryRowActions";
import { formatCurrency } from "@/lib/formatters";

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("sq-AL");
}

function getStockStatus(part) {
  const stock = Number(part.stock || 0);
  const minStock = Number(part.minStock || 0);

  if (stock <= 0) {
    return "OUT_OF_STOCK";
  }

  if (stock <= minStock) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

function getPartSearchText(part) {
  return normalizeText(
    [
      part.id,
      part.code,
      part.name,
      part.category,
      part.supplier,
      part.stock,
      part.minStock,
      part.buyPrice,
      part.sellPrice,
    ]
      .filter((value) => value !== null && value !== undefined)
      .join(" "),
  );
}

function getInventoryValue(part) {
  return Number(part.stock || 0) * Number(part.buyPrice || 0);
}

function sortParts(parts, sort) {
  const sortedParts = [...parts];

  if (sort === "OLDEST") {
    return sortedParts.sort((first, second) => {
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );
    });
  }

  if (sort === "NAME_ASC") {
    return sortedParts.sort((first, second) =>
      String(first.name || "").localeCompare(
        String(second.name || ""),
        "sq-AL",
        { sensitivity: "base" },
      ),
    );
  }

  if (sort === "NAME_DESC") {
    return sortedParts.sort((first, second) =>
      String(second.name || "").localeCompare(
        String(first.name || ""),
        "sq-AL",
        { sensitivity: "base" },
      ),
    );
  }

  if (sort === "STOCK_HIGH") {
    return sortedParts.sort(
      (first, second) => Number(second.stock || 0) - Number(first.stock || 0),
    );
  }

  if (sort === "STOCK_LOW") {
    return sortedParts.sort(
      (first, second) => Number(first.stock || 0) - Number(second.stock || 0),
    );
  }

  if (sort === "BUY_HIGH") {
    return sortedParts.sort(
      (first, second) =>
        Number(second.buyPrice || 0) - Number(first.buyPrice || 0),
    );
  }

  if (sort === "SELL_HIGH") {
    return sortedParts.sort(
      (first, second) =>
        Number(second.sellPrice || 0) - Number(first.sellPrice || 0),
    );
  }

  if (sort === "VALUE_HIGH") {
    return sortedParts.sort(
      (first, second) => getInventoryValue(second) - getInventoryValue(first),
    );
  }

  return sortedParts.sort((first, second) => {
    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
}

const stockStatusConfig = {
  OUT_OF_STOCK: {
    label: "Jashtë stokut",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  LOW_STOCK: {
    label: "Stok i ulët",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  IN_STOCK: {
    label: "Në rregull",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export default function InventoryTable({ parts = [] }) {
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const deferredSearch = useDeferredValue(search);

  const filteredParts = useMemo(() => {
    const normalizedSearch = normalizeText(deferredSearch);

    const filtered = parts.filter((part) => {
      const currentStockStatus = getStockStatus(part);

      const matchesStockStatus =
        stockStatus === "ALL" || currentStockStatus === stockStatus;

      if (!matchesStockStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getPartSearchText(part).includes(normalizedSearch);
    });

    return sortParts(filtered, sort);
  }, [parts, deferredSearch, stockStatus, sort]);

  const hasActiveFilters =
    search.trim() !== "" || stockStatus !== "ALL" || sort !== "NEWEST";

  function handleResetFilters() {
    setSearch("");
    setStockStatus("ALL");
    setSort("NEWEST");
  }

  return (
    <div className="space-y-5">
      <InventoryFilters
        search={search}
        stockStatus={stockStatus}
        sort={sort}
        resultCount={filteredParts.length}
        totalCount={parts.length}
        onSearchChange={setSearch}
        onStockStatusChange={setStockStatus}
        onSortChange={setSort}
        onReset={handleResetFilters}
      />

      {parts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Package className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk ka ende pjesë
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Shto pjesën e parë për të menaxhuar stokun dhe çmimet.
          </p>
        </div>
      ) : filteredParts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileSearch className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk u gjet asnjë pjesë
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Ndrysho termin e kërkimit ose pastro filtrat aktivë.
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Pastro filtrat
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Lista e pjesëve
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Po shfaqen {filteredParts.length} nga {parts.length} pjesë.
              </p>
            </div>

            {hasActiveFilters && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Filtra aktivë
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Kodi</th>
                  <th className="px-6 py-4">Pjesa</th>
                  <th className="px-6 py-4">Kategoria</th>
                  <th className="px-6 py-4">Furnitori</th>
                  <th className="px-6 py-4">Stoku</th>
                  <th className="px-6 py-4">Blerje</th>
                  <th className="px-6 py-4">Shitje</th>
                  <th className="px-6 py-4">Statusi</th>
                  <th className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredParts.map((part) => {
                  const currentStockStatus = getStockStatus(part);

                  const statusDetails = stockStatusConfig[currentStockStatus];

                  return (
                    <tr
                      key={part.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-blue-600">
                        {part.code || "—"}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-950">
                          {part.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Minimumi: {Number(part.minStock || 0)}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {part.category || "—"}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {part.supplier || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-slate-950">
                        {Number(part.stock || 0)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-600">
                        {formatCurrency(part.buyPrice)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-600">
                        {formatCurrency(part.sellPrice)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusDetails.className}`}
                        >
                          {statusDetails.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="flex justify-end">
                          <InventoryRowActions part={part} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
