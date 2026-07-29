"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";

import {
  renewSubscriptionAction,
  updateSubscriptionStatusAction,
} from "@/app/admin/subscriptions/actions";

function getTodayValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export default function SubscriptionActions({ subscription }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const [status, setStatus] = useState(subscription.status);
  const [billingInterval, setBillingInterval] = useState(
    subscription.billingInterval,
  );

  function runAction(action) {
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await action();

        setMessage({
          type: "success",
          text: result?.message || "Veprimi përfundoi me sukses.",
        });

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

    runAction(() => updateSubscriptionStatusAction(subscription.id, status));
  }

  function handleRenewSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    runAction(() => renewSubscriptionAction(subscription.id, formData));
  }

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
            Përditëso gjendjen aktuale të abonimit.
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
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="TRIALING">Trial</option>
              <option value="ACTIVE">Aktiv</option>
              <option value="PAST_DUE">Pagesë e vonuar</option>
              <option value="CANCELLED">Anuluar</option>
              <option value="EXPIRED">Skaduar</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={isPending || status === subscription.status}
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

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Rinovo abonimin</h2>

          <p className="mt-1 text-sm text-slate-500">
            Vendos periudhën dhe çmimin e rinovimit.
          </p>
        </div>

        <form
          onSubmit={handleRenewSubmit}
          className="mt-6 grid gap-5 lg:grid-cols-3"
        >
          <label>
            <span className="text-sm font-semibold text-slate-700">
              Faturimi
            </span>

            <select
              name="billingInterval"
              value={billingInterval}
              onChange={(event) => setBillingInterval(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="MONTHLY">Mujor</option>
              <option value="YEARLY">Vjetor</option>
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">
              Data e fillimit
            </span>

            <input
              type="date"
              name="periodStart"
              defaultValue={getTodayValue()}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Çmimi</span>

            <div className="relative mt-2">
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                placeholder={
                  billingInterval === "YEARLY"
                    ? String(subscription.plan.yearlyPrice)
                    : String(subscription.plan.monthlyPrice)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-16 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                Lekë
              </span>
            </div>
          </label>

          <div className="lg:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <RefreshCw size={17} />
              )}
              Rinovo abonimin
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
