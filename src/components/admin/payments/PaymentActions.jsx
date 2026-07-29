"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";

import {
  refundPaymentAction,
  updatePaymentStatusAction,
} from "@/app/admin/payments/actions";

export default function PaymentActions({ payment }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(payment.status);

  function runAction(action) {
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await action();

        setMessage({
          type: "success",
          text: result?.message || "Veprimi përfundoi me sukses.",
        });

        setStatus(result?.status || status);
        router.refresh();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Veprimi nuk mund të përfundohej.",
        });
      }
    });
  }

  function handleStatusSubmit(event) {
    event.preventDefault();

    runAction(() => updatePaymentStatusAction(payment.id, status));
  }

  function handleRefund() {
    const confirmed = window.confirm(
      "Je i sigurt që dëshiron ta shënosh këtë pagesë si të rimbursuar?",
    );

    if (!confirmed) {
      return;
    }

    runAction(() => refundPaymentAction(payment.id));
  }

  const canRefund = payment.status === "PAID";

  return (
    <div className="space-y-6">
      {message ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}

          <p className="font-medium">{message.text}</p>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Ndrysho statusin</h2>

          <p className="mt-1 text-sm text-slate-500">
            Konfirmo, rikthe në pritje ose shëno pagesën si të dështuar.
          </p>
        </div>

        <form
          onSubmit={handleStatusSubmit}
          className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <label className="flex-1">
            <span className="text-sm font-semibold text-slate-700">
              Statusi
            </span>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={payment.status === "REFUNDED"}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="PENDING">Në pritje</option>
              <option value="PAID">E paguar</option>
              <option value="FAILED">E dështuar</option>

              {payment.status === "REFUNDED" ? (
                <option value="REFUNDED">E rimbursuar</option>
              ) : null}
            </select>
          </label>

          <button
            type="submit"
            disabled={
              isPending ||
              status === payment.status ||
              payment.status === "REFUNDED"
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            Ruaj statusin
          </button>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-red-200 bg-red-50/70 p-6">
        <h2 className="text-lg font-bold text-red-900">Rimburso pagesën</h2>

        <p className="mt-2 text-sm leading-6 text-red-700">
          Ky veprim e shënon pagesën si të rimbursuar. Abonimi nuk çaktivizohet
          automatikisht; statusin e abonimit mund ta menaxhosh veçmas.
        </p>

        <button
          type="button"
          onClick={handleRefund}
          disabled={isPending || !canRefund}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RotateCcw size={16} />
          )}

          {payment.status === "REFUNDED"
            ? "Pagesa është rimbursuar"
            : "Rimburso pagesën"}
        </button>
      </section>
    </div>
  );
}
