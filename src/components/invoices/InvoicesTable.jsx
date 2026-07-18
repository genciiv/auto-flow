"use client";

import { useMemo, useState } from "react";
import { FileText, ReceiptText } from "lucide-react";

import EditInvoiceModal from "./EditInvoiceModal";
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
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function InvoicesTable({
  invoices = [],
  customers = [],
  vehicles = [],
  services = [],
}) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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

  function handleEdit(invoice) {
    setSelectedInvoice(invoice);
  }

  function handleCloseEdit() {
    setSelectedInvoice(null);
  }

  if (invoicesWithRelations.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="overflow-visible rounded-2xl border border-slate-200 bg-white">
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
              {invoicesWithRelations.map((invoice) => {
                const status =
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
                            ID: {invoice.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      {invoice.customer?.name || "—"}
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
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
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
