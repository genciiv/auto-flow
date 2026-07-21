"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { FileSearch, Users } from "lucide-react";

import CustomerFilters from "@/components/customers/CustomerFilters";
import CustomerRowActions from "@/components/customers/CustomerRowActions";
import { formatCurrency } from "@/lib/formatters";

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("sq-AL");
}

function getCustomerSpent(customer) {
  return (customer.invoices || []).reduce((sum, invoice) => {
    return sum + Number(invoice.total || 0);
  }, 0);
}

function isCustomerActive(customer) {
  return (
    (customer.vehicles || []).length > 0 || (customer.invoices || []).length > 0
  );
}

function getCustomerSearchText(customer) {
  const vehicles = customer.vehicles || [];

  return normalizeText(
    [
      customer.id,
      customer.name,
      customer.phone,
      customer.email,
      customer.city,
      ...vehicles.map((vehicle) => vehicle.plate),
      ...vehicles.map((vehicle) => vehicle.brand),
      ...vehicles.map((vehicle) => vehicle.model),
      ...vehicles.map((vehicle) => vehicle.vin),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function sortCustomers(customers, sort) {
  const sortedCustomers = [...customers];

  if (sort === "OLDEST") {
    return sortedCustomers.sort((first, second) => {
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );
    });
  }

  if (sort === "NAME_ASC") {
    return sortedCustomers.sort((first, second) => {
      return String(first.name || "").localeCompare(
        String(second.name || ""),
        "sq-AL",
        {
          sensitivity: "base",
        },
      );
    });
  }

  if (sort === "NAME_DESC") {
    return sortedCustomers.sort((first, second) => {
      return String(second.name || "").localeCompare(
        String(first.name || ""),
        "sq-AL",
        {
          sensitivity: "base",
        },
      );
    });
  }

  if (sort === "SPENT_HIGH") {
    return sortedCustomers.sort((first, second) => {
      return getCustomerSpent(second) - getCustomerSpent(first);
    });
  }

  if (sort === "SPENT_LOW") {
    return sortedCustomers.sort((first, second) => {
      return getCustomerSpent(first) - getCustomerSpent(second);
    });
  }

  return sortedCustomers.sort((first, second) => {
    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
}

export default function CustomersTable({
  customers = [],
  canUpdateCustomer = false,
  canDeleteCustomer = false,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const deferredSearch = useDeferredValue(search);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = normalizeText(deferredSearch);

    const filtered = customers.filter((customer) => {
      const active = isCustomerActive(customer);

      const matchesStatus =
        status === "ALL" ||
        (status === "ACTIVE" && active) ||
        (status === "INACTIVE" && !active);

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getCustomerSearchText(customer).includes(normalizedSearch);
    });

    return sortCustomers(filtered, sort);
  }, [customers, deferredSearch, status, sort]);

  const hasActiveFilters =
    search.trim() !== "" || status !== "ALL" || sort !== "NEWEST";

  function handleResetFilters() {
    setSearch("");
    setStatus("ALL");
    setSort("NEWEST");
  }

  return (
    <div className="space-y-5">
      <CustomerFilters
        search={search}
        status={status}
        sort={sort}
        resultCount={filteredCustomers.length}
        totalCount={customers.length}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onReset={handleResetFilters}
      />

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Users className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk ka ende klientë
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Shto klientin e parë për të menaxhuar automjetet dhe faturat.
          </p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileSearch className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nuk u gjet asnjë klient
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
                Lista e klientëve
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Po shfaqen {filteredCustomers.length} nga {customers.length}{" "}
                klientë.
              </p>
            </div>

            {hasActiveFilters && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Filtra aktivë
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Klienti</th>
                  <th className="px-6 py-4">Qyteti</th>
                  <th className="px-6 py-4">Automjetet</th>
                  <th className="px-6 py-4">Fatura</th>
                  <th className="px-6 py-4">Shpenzuar</th>
                  <th className="px-6 py-4">Statusi</th>
                  <th className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCustomers.map((customer) => {
                  const spent = getCustomerSpent(customer);
                  const active = isCustomerActive(customer);

                  const statusLabel = active ? "Aktiv" : "Jo aktiv";

                  return (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-950">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {customer.phone || customer.email || "Pa kontakt"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">
                        {customer.city || "—"}
                      </td>

                      <td className="max-w-[260px] px-6 py-5 text-sm text-slate-600">
                        {(customer.vehicles || []).length > 0
                          ? customer.vehicles
                              .map((vehicle) => {
                                return [vehicle.brand, vehicle.model]
                                  .filter(Boolean)
                                  .join(" ");
                              })
                              .filter(Boolean)
                              .join(", ")
                          : "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-slate-950">
                        {(customer.invoices || []).length}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-slate-950">
                        {formatCurrency(spent)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="flex justify-end">
                          <CustomerRowActions
                            customer={customer}
                            canUpdate={canUpdateCustomer}
                            canDelete={canDeleteCustomer}
                          />
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
