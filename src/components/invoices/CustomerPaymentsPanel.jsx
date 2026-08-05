"use client";

import { useState } from "react";

import { recordCustomerPaymentAction } from "@/actions/invoice-payment-actions";
import { getInvoicePaymentSummary } from "@/lib/invoice-payment-status";
import { formatCurrency } from "@/lib/formatters";
import { moneyToString } from "@/lib/money";

export default function CustomerPaymentsPanel({
  invoice,
  canRecordPayment,
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const { paid, remaining } = getInvoicePaymentSummary(invoice);
  const hasRemainingBalance = remaining.gt(0);

  async function submit(formData) {
    setBusy(true);
    setMessage("");

    const result = await recordCustomerPaymentAction(formData);

    setMessage(result?.message || "");
    setBusy(false);

    if (result?.success) {
      window.location.reload();
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Pagesat e klientit
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pagesa të plota ose të pjesshme për këtë faturë.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 text-right">
          <div>
            <p className="text-xs text-slate-500">Paguar</p>
            <p className="text-lg font-bold text-emerald-700">
              {formatCurrency(paid)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Detyrimi i mbetur</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
      </div>

      {canRecordPayment && hasRemainingBalance ? (
        <form
          action={submit}
          className="mt-5 grid gap-3 md:grid-cols-4"
        >
          <input type="hidden" name="invoiceId" value={invoice.id} />

          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            max={moneyToString(remaining)}
            required
            placeholder="Shuma"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />

          <select
            name="method"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="CASH">Cash</option>
            <option value="CARD">Kartë</option>
            <option value="BANK_TRANSFER">Transfertë</option>
            <option value="OTHER">Tjetër</option>
          </select>

          <input
            name="reference"
            placeholder="Referenca (opsionale)"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />

          <button
            disabled={busy}
            className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Duke regjistruar..." : "Regjistro pagesën"}
          </button>
        </form>
      ) : null}

      <div className="mt-5 divide-y divide-slate-100">
        {invoice.customerPayments?.length ? (
          invoice.customerPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex justify-between gap-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {payment.method} · {payment.recordedBy?.name || "Stafi"}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(payment.paidAt).toLocaleString("sq-AL")}
                  {payment.reference ? ` · ${payment.reference}` : ""}
                </p>
              </div>

              <strong className="text-emerald-700">
                {formatCurrency(payment.amount)}
              </strong>
            </div>
          ))
        ) : (
          <p className="py-4 text-sm text-slate-500">
            Nuk ka ende pagesa.
          </p>
        )}
      </div>

      {message ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}
