"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { FileSearch, FileText, ReceiptText, RotateCcw } from "lucide-react";

import EditInvoiceModal from "./EditInvoiceModal";
import InvoiceFilters from "./InvoiceFilters";
import InvoiceRowActions from "./InvoiceRowActions";

const statusConfig = {
  DRAFT: {
    label: "Draft",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },

  UNPAID: {
    label: "E papaguar",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },

  PAID: {
    label: "E paguar",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  OVERDUE: {
    label: "E vonuar",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

function formatCurrency(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("sq-AL");
}

function getInvoiceSearchText(invoice) {
  return normalizeText(
    [
      invoice.number,
      invoice.customer?.name,
      invoice.customer?.phone,
      invoice.customer?.email,
      invoice.vehicle?.plate,
      invoice.vehicle?.brand,
      invoice.vehicle?.model,
      invoice.service?.title,
      invoice.status,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function sortInvoices(invoices, sort) {
  const sortedInvoices = [...invoices];

  if (sort === "OLDEST") {
    return sortedInvoices.sort((first, second) => {
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );
    });
  }

  if (sort === "TOTAL_HIGH") {
    return sortedInvoices.sort((first, second) => {
      return Number(second.total || 0) - Number(first.total || 0);
    });
  }

  if (sort === "TOTAL_LOW") {
    return sortedInvoices.sort((first, second) => {
      return Number(first.total || 0) - Number(second.total || 0);
    });
  }

  if (sort === "NUMBER_ASC") {
    return sortedInvoices.sort((first, second) => {
      return String(first.number || "").localeCompare(
        String(second.number || ""),
        "sq-AL",
        {
          numeric: true,
          sensitivity: "base",
        },
      );
    });
  }

  return sortedInvoices.sort((first, second) => {
    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
}

export default function InvoicesTable({
  invoices = [],
  customers = [],
  vehicles = [],
  services = [],
}) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const deferredSearch = useDeferredValue(search);

  const invoicesWithRelations = useMemo(() => {
    return invoices.map((invoice) => {
      const customer =
        invoice.customer ||
        customers.find((item) => item.id === invoice.customerId) ||
        null;

      const vehicle =
        invoice.vehicle ||
        vehicles.find((item) => item.id === invoice.vehicleId) ||
        null;

      const service =
        invoice.service ||
        services.find((item) => item.id === invoice.serviceId) ||
        null;

      return {
        ...invoice,
        customer,
        vehicle,
        service,
      };
    });
  }, [invoices, customers, vehicles, services]);

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = normalizeText(deferredSearch);

    const filtered = invoicesWithRelations.filter((invoice) => {
      const matchesStatus = status === "ALL" || invoice.status === status;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = getInvoiceSearchText(invoice);

      return searchableText.includes(normalizedSearch);
    });

    return sortInvoices(filtered, sort);
  }, [invoicesWithRelations, deferredSearch, status, sort]);

  const hasActiveFilters =
    search.trim() !== "" || status !== "ALL" || sort !== "NEWEST";

  function handleEdit(invoice) {
    setSelectedInvoice(invoice);
  }

  function handleCloseEdit() {
    setSelectedInvoice(null);
  }

  function handleResetFilters() {
    setSearch("");
    setStatus("ALL");
    setSort("NEWEST");
  }

  return (
    <>
      <div className="space-y-5">
        <InvoiceFilters
          search={search}
          status={status}
          sort={sort}
          resultCount={filteredInvoices.length}
          totalCount={invoicesWithRelations.length}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onSortChange={setSort}
          onReset={handleResetFilters}
        />

        {invoicesWithRelations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FileText className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Nuk ka ende fatura
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Krijo faturën e parë manualisht ose nga një shërbim i përfunduar.
            </p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FileSearch className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Nuk u gjet asnjë faturë
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ndrysho termin e kërkimit ose pastro filtrat aktivë.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Pastro filtrat
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-visible rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Lista e faturave
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Po shfaqen {filteredInvoices.length} nga{" "}
                  {invoicesWithRelations.length} fatura.
                </p>
              </div>

              {hasActiveFilters && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  Filtra aktivë
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Fatura
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Klienti
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Automjeti
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Shërbimi
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Totali
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statusi
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Data
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Veprime
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredInvoices.map((invoice) => {
                    const statusDetails =
                      statusConfig[invoice.status] || statusConfig.DRAFT;

                    return (
                      <tr
                        key={invoice.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <ReceiptText className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {invoice.number}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                ID:{" "}
                                {String(invoice.id).slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          {invoice.customer ? (
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {invoice.customer.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {invoice.customer.phone ||
                                  invoice.customer.email ||
                                  "Pa kontakt"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          {invoice.vehicle ? (
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {invoice.vehicle.plate}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {[invoice.vehicle.brand, invoice.vehicle.model]
                                  .filter(Boolean)
                                  .join(" ") || "Pa të dhëna"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="max-w-[220px] px-6 py-4">
                          <p className="truncate text-sm text-slate-700">
                            {invoice.service?.title || "Faturë manuale"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatCurrency(invoice.total)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusDetails.className}`}
                          >
                            {statusDetails.label}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {formatDate(invoice.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <InvoiceRowActions
                            invoice={invoice}
                            onEdit={handleEdit}
                          />
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

      {selectedInvoice && (
        <EditInvoiceModal
          key={selectedInvoice.id}
          invoice={selectedInvoice}
          customers={customers}
          vehicles={vehicles}
          services={services}
          onClose={handleCloseEdit}
        />
      )}
    </>
  );
}
