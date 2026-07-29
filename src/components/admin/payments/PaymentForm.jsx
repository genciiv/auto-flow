"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Save,
  X,
} from "lucide-react";

import { createPaymentAction } from "@/app/admin/payments/actions";

function formatPrice(value) {
  return new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getTodayValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getStatusLabel(status) {
  const labels = {
    TRIALING: "Trial",
    ACTIVE: "Aktiv",
    PAST_DUE: "Pagesë e vonuar",
    CANCELLED: "Anuluar",
    EXPIRED: "Skaduar",
  };

  return labels[status] || status;
}

export default function PaymentForm({
  subscriptions = [],
  paymentMethods = [],
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const [subscriptionId, setSubscriptionId] = useState("");
  const [status, setStatus] = useState("PAID");
  const [method, setMethod] = useState(paymentMethods[0]?.value || "OTHER");
  const [customAmount, setCustomAmount] = useState("");

  const selectedSubscription = useMemo(
    () =>
      subscriptions.find(
        (subscription) => subscription.id === subscriptionId,
      ) || null,
    [subscriptions, subscriptionId],
  );

  const defaultAmount = selectedSubscription
    ? Number(selectedSubscription.price || 0)
    : 0;

  function handleSubscriptionChange(event) {
    setSubscriptionId(event.target.value);
    setCustomAmount("");
    setMessage(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await createPaymentAction(formData);

        setMessage({
          type: "success",
          text: result?.message || "Pagesa u regjistrua me sukses.",
        });

        router.refresh();

        setTimeout(() => {
          router.push("/admin/payments");
        }, 700);
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Pagesa nuk mund të regjistrohej.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {message ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          ) : (
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
          )}

          <p className="font-medium">{message.text}</p>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Abonimi</h2>

          <p className="mt-1 text-sm text-slate-500">
            Zgjidh abonimin për të cilin po regjistrohet pagesa.
          </p>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-slate-700">
            Biznesi dhe plani
          </span>

          <select
            name="subscriptionId"
            required
            value={subscriptionId}
            onChange={handleSubscriptionChange}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Zgjidh abonimin</option>

            {subscriptions.map((subscription) => (
              <option key={subscription.id} value={subscription.id}>
                {subscription.business.name} — {subscription.plan.name}
              </option>
            ))}
          </select>
        </label>

        {selectedSubscription ? (
          <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Biznesi
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {selectedSubscription.business.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {selectedSubscription.business.email || "Pa email"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Plani
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {selectedSubscription.plan.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {selectedSubscription.billingInterval === "YEARLY"
                  ? "Faturim vjetor"
                  : "Faturim mujor"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Statusi
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {getStatusLabel(selectedSubscription.status)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatDate(selectedSubscription.currentPeriodStart)} —{" "}
                {formatDate(selectedSubscription.currentPeriodEnd)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Shuma e abonimit
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {formatPrice(defaultAmount)} Lekë
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Detajet e pagesës
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Vendos shumën, metodën, statusin dhe datën e pagesës.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Shuma</span>

            <div className="relative mt-2">
              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                placeholder={
                  selectedSubscription
                    ? String(defaultAmount)
                    : "Zgjidh abonimin"
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-16 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                Lekë
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Lëre bosh për të përdorur shumën e abonimit:{" "}
              <span className="font-semibold text-slate-700">
                {formatPrice(defaultAmount)} Lekë
              </span>
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Data e pagesës
            </span>

            <input
              type="date"
              name="paidAt"
              defaultValue={getTodayValue()}
              disabled={status !== "PAID"}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Përdoret vetëm kur pagesa është e konfirmuar.
            </p>
          </label>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Metoda</span>

            <select
              name="method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod.value} value={paymentMethod.value}>
                  {paymentMethod.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Statusi
            </span>

            <select
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="PAID">E paguar</option>
              <option value="PENDING">Në pritje</option>
              <option value="FAILED">E dështuar</option>
            </select>
          </label>
        </div>

        {method === "BANK_TRANSFER" ? (
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">
              Referenca e transfertës
            </span>

            <input
              type="text"
              name="reference"
              required
              placeholder="P.sh. TRX-2026-0001"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>
        ) : (
          <input type="hidden" name="reference" value="" />
        )}

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">
            Përshkrimi
          </span>

          <textarea
            name="description"
            rows={4}
            placeholder="Shënime shtesë për pagesën..."
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </section>

      <section className="rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-6">
        <div className="flex items-start gap-3">
          {method === "CASH" ? (
            <Banknote size={21} className="mt-0.5 shrink-0 text-blue-700" />
          ) : (
            <CreditCard size={21} className="mt-0.5 shrink-0 text-blue-700" />
          )}

          <div>
            <h2 className="text-sm font-bold text-blue-900">
              Çfarë ndodh pas regjistrimit?
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              Nëse statusi është “E paguar”, pagesa ruhet si e konfirmuar dhe
              abonimi lidhet me statusin aktiv. Nëse statusi është “Në pritje”,
              pagesa ruhet, por abonimi nuk aktivizohet derisa pagesa të
              konfirmohet.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={() => router.push("/admin/payments")}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={17} />
          Anulo
        </button>

        <button
          type="submit"
          disabled={isPending || !subscriptionId}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Duke regjistruar...
            </>
          ) : (
            <>
              <Save size={17} />
              Regjistro pagesën
            </>
          )}
        </button>
      </div>
    </form>
  );
}
