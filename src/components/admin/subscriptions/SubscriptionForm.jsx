"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Save,
  X,
} from "lucide-react";

import { createSubscriptionAction } from "@/app/admin/subscriptions/actions";

function formatPrice(value) {
  return new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getTodayValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export default function SubscriptionForm({
  businesses = [],
  plans = [],
  paymentMethods = [],
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingInterval, setBillingInterval] = useState("MONTHLY");
  const [customPrice, setCustomPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(
    paymentMethods[0]?.value || "OTHER",
  );

  const selectedBusiness = useMemo(
    () =>
      businesses.find((business) => business.id === selectedBusinessId) || null,
    [businesses, selectedBusinessId],
  );

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || null,
    [plans, selectedPlanId],
  );

  const defaultPrice = selectedPlan
    ? billingInterval === "YEARLY"
      ? Number(selectedPlan.yearlyPrice)
      : Number(selectedPlan.monthlyPrice)
    : 0;

  function handlePlanChange(event) {
    setSelectedPlanId(event.target.value);
    setCustomPrice("");
  }

  function handleIntervalChange(event) {
    setBillingInterval(event.target.value);
    setCustomPrice("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await createSubscriptionAction(formData);

        setMessage({
          type: "success",
          text:
            result?.message ||
            "Pagesa u konfirmua dhe abonimi u aktivizua me sukses.",
        });

        router.refresh();

        setTimeout(() => {
          router.push("/admin/subscriptions");
        }, 700);
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Abonimi nuk mund të krijohej.",
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
          <h2 className="text-lg font-bold text-slate-950">
            Biznesi dhe plani
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Zgjidh biznesin dhe planin që do të aktivizohet.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Biznesi
            </span>

            <select
              name="businessId"
              required
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Zgjidh biznesin</option>

              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                  {business.city ? ` — ${business.city}` : ""}
                </option>
              ))}
            </select>

            {selectedBusiness ? (
              <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  {selectedBusiness.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedBusiness.email || "Pa email"}
                  {selectedBusiness.city ? ` · ${selectedBusiness.city}` : ""}
                </p>

                {selectedBusiness.subscriptions?.length > 0 ? (
                  <p className="mt-2 text-xs font-semibold text-amber-700">
                    Ky biznes ka një abonim aktiv ose trial. Abonimi aktual do
                    të mbyllet kur të aktivizohet plani i ri.
                  </p>
                ) : null}
              </div>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Plani</span>

            <select
              name="planId"
              required
              value={selectedPlanId}
              onChange={handlePlanChange}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Zgjidh planin</option>

              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>

            {selectedPlan ? (
              <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  {selectedPlan.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatPrice(selectedPlan.monthlyPrice)} Lekë/muaj ·{" "}
                  {formatPrice(selectedPlan.yearlyPrice)} Lekë/vit
                </p>
              </div>
            ) : null}
          </label>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Periudha e abonimit
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Zgjidh faturimin mujor ose vjetor dhe datën e fillimit.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Faturimi
            </span>

            <select
              name="billingInterval"
              value={billingInterval}
              onChange={handleIntervalChange}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="MONTHLY">Mujor</option>
              <option value="YEARLY">Vjetor</option>
            </select>
          </label>

          <label className="block">
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

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Çmimi</span>

            <div className="relative mt-2">
              <input
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                value={customPrice}
                onChange={(event) => setCustomPrice(event.target.value)}
                placeholder={
                  selectedPlan ? String(defaultPrice) : "Zgjidh planin"
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-16 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                Lekë
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Lëre bosh për të përdorur çmimin e planit:{" "}
              <span className="font-semibold text-slate-700">
                {formatPrice(defaultPrice)} Lekë
              </span>
            </p>
          </label>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/60 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <CreditCard size={18} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-emerald-950">
              Pagesa e abonimit
            </h2>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Abonimi aktivizohet vetëm pasi kjo pagesë të regjistrohet si e
              konfirmuar. Aktivizimi dhe pagesa ruhen në të njëjtin transaksion.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <label>
            <span className="text-sm font-semibold text-emerald-900">
              Metoda e pagesës
            </span>
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-emerald-900">
              Data e pagesës
            </span>
            <input
              type="date"
              name="paidAt"
              defaultValue={getTodayValue()}
              className="mt-2 h-12 w-full rounded-2xl border border-emerald-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-emerald-900">
              Referenca {paymentMethod === "BANK_TRANSFER" ? "*" : ""}
            </span>
            <input
              type="text"
              name="paymentReference"
              required={paymentMethod === "BANK_TRANSFER"}
              placeholder={
                paymentMethod === "BANK_TRANSFER"
                  ? "P.sh. TRX-2026-0001"
                  : "Opsionale"
              }
              className="mt-2 h-12 w-full rounded-2xl border border-emerald-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-6">
        <h2 className="text-sm font-bold text-blue-900">
          Çfarë ndodh pas aktivizimit?
        </h2>

        <p className="mt-2 text-sm leading-6 text-blue-800">
          Trial-i ose abonimi i mëparshëm do të mbyllet. Sistemi krijon abonimin
          e ri me status Aktiv dhe një pagesë PAID të lidhur me të. Kështu një
          plan me pagesë nuk mund të rezultojë aktiv me 0 pagesa.
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={() => router.push("/admin/subscriptions")}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={17} />
          Anulo
        </button>

        <button
          type="submit"
          disabled={
            isPending ||
            !selectedBusinessId ||
            !selectedPlanId ||
            paymentMethods.length === 0
          }
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Duke aktivizuar...
            </>
          ) : (
            <>
              <Save size={17} />
              Konfirmo pagesën dhe aktivizo
            </>
          )}
        </button>
      </div>
    </form>
  );
}
