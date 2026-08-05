"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  ReceiptText,
  Trash2,
} from "lucide-react";

import {
  addLaborItemAction,
  removeLaborItemAction,
} from "@/actions/service-operation-actions";
import { createInvoiceFromServiceAction } from "@/actions/invoice-payment-actions";
import { addPartToService } from "@/actions/service-part-actions";
import { formatCurrency } from "@/lib/formatters";
import {
  getInvoicePaymentSummary,
  INVOICE_PAYMENT_STATUS,
} from "@/lib/invoice-payment-status";

const paymentStatusConfig = {
  [INVOICE_PAYMENT_STATUS.NO_INVOICE]: {
    label: "Pa faturë",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  [INVOICE_PAYMENT_STATUS.UNPAID]: {
    label: "E papaguar",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  [INVOICE_PAYMENT_STATUS.PARTIALLY_PAID]: {
    label: "Pjesërisht e paguar",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  [INVOICE_PAYMENT_STATUS.PAID]: {
    label: "E paguar",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export default function ServiceOperationsPanel({
  service,
  parts,
  canManageParts,
  canCreateInvoice,
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const paymentSummary = getInvoicePaymentSummary(service.invoice);
  const paymentDetails = paymentStatusConfig[paymentSummary.status];

  async function run(action) {
    setBusy(true);
    setMessage("");

    const result = await action();

    setMessage(result?.message || "");
    setBusy(false);

    if (result?.success) {
      router.refresh();
    }

    if (result?.invoiceId) {
      router.push(`/dashboard/invoices/${result.invoiceId}`);
    }
  }

  async function addLabor(formData) {
    await run(() => addLaborItemAction(formData));
  }

  async function addPart(formData) {
    await run(() => addPartToService(formData));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Punët e kryera
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Regjistro shërbimin, sasinë dhe çmimin e punës.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              {service.laborItems.length}
            </span>
          </div>

          <form action={addLabor} className="mt-4 space-y-2.5">
            <input type="hidden" name="serviceId" value={service.id} />
            <input
              name="description"
              required
              placeholder="P.sh. Ndërrim vaji"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-2.5">
              <input
                name="quantity"
                type="number"
                min="0.1"
                step="0.1"
                defaultValue="1"
                aria-label="Sasia e punës"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <input
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="Çmimi"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
            <button
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              <Plus size={16} /> Shto punën
            </button>
          </form>

          <div className="mt-4 max-h-56 divide-y divide-slate-100 overflow-y-auto pr-1">
            {service.laborItems.length === 0 ? (
              <p className="py-3 text-sm text-slate-500">
                Nuk ka ende punë të regjistruara.
              </p>
            ) : (
              service.laborItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <strong className="text-sm">
                      {formatCurrency(item.total)}
                    </strong>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(() => removeLaborItemAction(item.id))}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                      aria-label="Hiq punën"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Pjesët e përdorura
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Regjistrimi ul stokun dhe ruan lëvizjen në inventar.
            </p>
          </div>

          {canManageParts ? (
            <form action={addPart} className="mt-4 space-y-2.5">
              <input type="hidden" name="serviceId" value={service.id} />
              <select
                name="partId"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">Zgjidh pjesën...</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name} · stok {part.stock} · {formatCurrency(part.sellPrice)}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-2.5">
                <input
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  defaultValue="1"
                  aria-label="Sasia e pjesës"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
                <button
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  <Plus size={16} /> Regjistro pjesën
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
              Nuk ke leje për të regjistruar pjesë.
            </p>
          )}

          <div className="mt-4 max-h-56 divide-y divide-slate-100 overflow-y-auto pr-1">
            {service.partsUsed.length === 0 ? (
              <p className="py-3 text-sm text-slate-500">
                Nuk ka pjesë të përdorura.
              </p>
            ) : (
              service.partsUsed.map((usage) => (
                <div
                  key={usage.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {usage.part.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {usage.quantity} × {formatCurrency(usage.unitPrice)}
                    </p>
                  </div>
                  <strong className="shrink-0 text-sm">
                    {formatCurrency(usage.total)}
                  </strong>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-950">Faturimi</h2>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${paymentDetails.className}`}
            >
              {paymentDetails.label}
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">
              Totali i urdhër-punës
            </p>
            <p className="mt-1 text-xl font-bold text-slate-950">
              {formatCurrency(service.total)}
            </p>
          </div>

          {service.invoice ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl border border-slate-100 p-2.5">
                <p className="text-xs text-slate-500">Fatura</p>
                <p className="mt-1 truncate font-bold text-slate-900">
                  {service.invoice.number}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5">
                <p className="text-xs text-slate-500">Paguar</p>
                <p className="mt-1 font-bold text-emerald-700">
                  {formatCurrency(paymentSummary.paid)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5">
                <p className="text-xs text-slate-500">Mbetur</p>
                <p className="mt-1 font-bold text-red-700">
                  {formatCurrency(paymentSummary.remaining)}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Nuk është krijuar ende faturë për këtë shërbim.
            </p>
          )}

          <div className="mt-4">
            {service.invoice ? (
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/invoices/${service.invoice.id}`)
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
              >
                <ReceiptText size={17} /> Hape faturën
              </button>
            ) : canCreateInvoice ? (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(() => createInvoiceFromServiceAction(service.id))
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                <ReceiptText size={17} /> Krijo faturën
              </button>
            ) : (
              <span className="block rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                Fatura krijohet nga recepsioni, financieri ose menaxheri.
              </span>
            )}
          </div>
        </section>
      </div>

      {message ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {busy ? (
            <Loader2 className="mr-2 inline animate-spin" size={15} />
          ) : null}
          {message}
        </p>
      ) : null}
    </div>
  );
}
