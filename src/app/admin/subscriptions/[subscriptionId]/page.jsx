import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CreditCard,
  UserRound,
} from "lucide-react";

import SubscriptionActions from "@/components/admin/subscriptions/SubscriptionActions";
import {
  getEnabledSubscriptionPaymentMethods,
  getSubscriptionById,
} from "@/services/admin/subscription-service";

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(value) {
  return new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
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

export default async function SubscriptionDetailsPage({ params }) {
  const resolvedParams = await params;

  const [subscription, paymentMethods] = await Promise.all([
    getSubscriptionById(resolvedParams.subscriptionId),
    getEnabledSubscriptionPaymentMethods(),
  ]);

  if (!subscription) {
    notFound();
  }

  const owner = subscription.business.users[0]?.user;
  const subscriptionActionsData = {
    id: subscription.id,
    status: subscription.status,
    billingInterval: subscription.billingInterval,
    plan: {
      monthlyPrice: Number(subscription.plan.monthlyPrice || 0),
      yearlyPrice: Number(subscription.plan.yearlyPrice || 0),
    },
  };

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/admin/subscriptions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Kthehu te abonimet
        </Link>

        <div className="mt-5">
          <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Menaxho abonimin
          </h1>

          <p className="mt-2 text-slate-500">
            Shiko detajet, ndrysho statusin ose rinovo abonimin.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <Building2 size={20} className="text-blue-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Biznesi
          </p>

          <p className="mt-2 font-bold text-slate-950">
            {subscription.business.name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {subscription.business.city || "Qyteti i pacaktuar"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <CreditCard size={20} className="text-blue-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Plani
          </p>

          <p className="mt-2 font-bold text-slate-950">
            {subscription.plan.name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {formatPrice(subscription.price)} Lekë
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <CalendarDays size={20} className="text-blue-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Periudha
          </p>

          <p className="mt-2 font-bold text-slate-950">
            {subscription.billingInterval === "YEARLY" ? "Vjetore" : "Mujore"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {formatDate(subscription.currentPeriodStart)} —{" "}
            {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <UserRound size={20} className="text-blue-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pronari
          </p>

          <p className="mt-2 font-bold text-slate-950">
            {owner?.name || "Pa pronar"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {owner?.email || subscription.business.email || "—"}
          </p>
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Statusi
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              {getStatusLabel(subscription.status)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fillimi i trial-it
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {formatDate(subscription.trialStartsAt)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fundi i trial-it
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {formatDate(subscription.trialEndsAt)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pagesat
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {subscription.payments.length} pagesa
            </p>
          </div>
        </div>
      </section>

      <SubscriptionActions
        subscription={subscriptionActionsData}
        paymentMethods={paymentMethods}
      />

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-950">
            Historiku i pagesave
          </h2>
        </div>

        {subscription.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Shuma
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Metoda
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Statusi
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Data
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Veprime
                  </th>
                </tr>
              </thead>

              <tbody>
                {subscription.payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                      {formatPrice(payment.amount)} Lekë
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {payment.method}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {payment.status}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(payment.paidAt || payment.createdAt)}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/payments/${payment.id}`}
                        className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Menaxho
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Nuk ka pagesa të regjistruara për këtë abonim.
          </div>
        )}
      </section>
    </div>
  );
}
