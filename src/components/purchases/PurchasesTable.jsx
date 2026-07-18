"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { FileSearch, ShoppingCart } from "lucide-react";

import AddPurchaseItemModal from "@/components/purchases/AddPurchaseItemModal";
import PurchaseFilters from "@/components/purchases/PurchaseFilters";
import PurchaseItemsList from "@/components/purchases/PurchaseItemsList";
import PurchaseRowActions from "@/components/purchases/PurchaseRowActions";
import ReceivePurchaseButton from "@/components/purchases/ReceivePurchaseButton";
import { formatCurrency } from "@/lib/formatters";

const statusConfig = {
  PENDING: {
    label: "Në pritje",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  ORDERED: {
    label: "Në transport",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  RECEIVED: {
    label: "Përfunduar",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Anuluar",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("sq-AL");
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${padNumber(date.getDate())}.${padNumber(
    date.getMonth() + 1,
  )}.${date.getFullYear()}`;
}

function getPurchaseItemsCount(purchase) {
  return (purchase.items || []).reduce((sum, item) => {
    return sum + Number(item.quantity || 0);
  }, 0);
}

function getPurchaseSearchText(purchase) {
  return normalizeText(
    [
      purchase.id,
      purchase.supplier,
      purchase.notes,
      purchase.status,
      purchase.business?.name,
      purchase.business?.city,
      purchase.total,
      ...(purchase.items || []).map((item) => item.name),
      ...(purchase.items || []).map((item) => item.quantity),
      ...(purchase.items || []).map((item) => item.unitPrice),
      ...(purchase.items || []).map((item) => item.total),
    ]
      .filter((value) => value !== null && value !== undefined && value !== "")
      .join(" "),
  );
}

function sortPurchases(purchases, sort) {
  const sortedPurchases = [...purchases];

  if (sort === "OLDEST") {
    return sortedPurchases.sort((first, second) => {
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );
    });
  }

  if (sort === "TOTAL_HIGH") {
    return sortedPurchases.sort((first, second) => {
      return Number(second.total || 0) - Number(first.total || 0);
    });
  }

  if (sort === "TOTAL_LOW") {
    return sortedPurchases.sort((first, second) => {
      return Number(first.total || 0) - Number(second.total || 0);
    });
  }

  if (sort === "SUPPLIER_ASC") {
    return sortedPurchases.sort((first, second) => {
      return String(first.supplier || "").localeCompare(
        String(second.supplier || ""),
        "sq-AL",
        {
          sensitivity: "base",
        },
      );
    });
  }

  if (sort === "SUPPLIER_DESC") {
    return sortedPurchases.sort((first, second) => {
      return String(second.supplier || "").localeCompare(
        String(first.supplier || ""),
        "sq-AL",
        {
          sensitivity: "base",
        },
      );
    });
  }

  if (sort === "ITEMS_HIGH") {
    return sortedPurchases.sort((first, second) => {
      return getPurchaseItemsCount(second) - getPurchaseItemsCount(first);
    });
  }

  return sortedPurchases.sort((first, second) => {
    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
}

export default function PurchasesTable({ purchases = [] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const deferredSearch = useDeferredValue(search);

  const filteredPurchases = useMemo(() => {
    const normalizedSearch = normalizeText(deferredSearch);

    const filtered = purchases.filter((purchase) => {
      const matchesStatus = status === "ALL" || purchase.status === status;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getPurchaseSearchText(purchase).includes(normalizedSearch);
    });

    return sortPurchases(filtered, sort);
  }, [purchases, deferredSearch, status, sort]);

  const hasActiveFilters =
    search.trim() !== "" || status !== "ALL" || sort !== "NEWEST";

  function handleResetFilters() {
    setSearch("");
    setStatus("ALL");
    setSort("NEWEST");
  }

  return (
    <div className="space-y-5">
      <PurchaseFilters
        search={search}
        status={status}
        sort={sort}
        resultCount={filteredPurchases.length}
        totalCount={purchases.length}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onReset={handleResetFilters}
      />

      {purchases.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <ShoppingCart className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk ka ende porosi
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Krijo porosinë e parë për të menaxhuar blerjet dhe furnitorët.
          </p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileSearch className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk u gjet asnjë porosi
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
        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Lista e porosive
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Po shfaqen {filteredPurchases.length} nga {purchases.length}{" "}
                porosi.
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
                  <th className="px-6 py-4">Furnitori</th>
                  <th className="px-6 py-4">Artikujt</th>
                  <th className="px-6 py-4">Biznesi</th>
                  <th className="px-6 py-4">Totali</th>
                  <th className="px-6 py-4">Statusi</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPurchases.map((purchase) => {
                  const statusDetails =
                    statusConfig[purchase.status] || statusConfig.PENDING;

                  return (
                    <tr
                      key={purchase.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-950">
                          {purchase.supplier || "Pa furnitor"}
                        </p>

                        {purchase.notes && (
                          <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                            {purchase.notes}
                          </p>
                        )}
                      </td>

                      <td className="max-w-[340px] px-6 py-5 text-sm text-slate-600">
                        {(purchase.items || []).length > 0 ? (
                          <PurchaseItemsList items={purchase.items} />
                        ) : (
                          <span className="text-slate-400">Pa artikuj</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">
                        {purchase.business?.name || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-slate-950">
                        {formatCurrency(purchase.total)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusDetails.className}`}
                        >
                          {statusDetails.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">
                        {formatDate(purchase.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {purchase.status !== "RECEIVED" &&
                            purchase.status !== "CANCELLED" && (
                              <AddPurchaseItemModal
                                purchaseOrderId={purchase.id}
                              />
                            )}

                          <ReceivePurchaseButton
                            purchaseOrderId={purchase.id}
                            status={purchase.status}
                            itemCount={(purchase.items || []).length}
                          />

                          <PurchaseRowActions purchase={purchase} />
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
