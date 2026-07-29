import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  ReceiptText,
} from "lucide-react";

import PaymentActions from "@/components/admin/payments/PaymentActions";
import { getPaymentById } from "@/services/admin/payment-service";

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

function formatPrice(value, currency = "ALL") {
  const amount = new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  return currency === "ALL" ? `${amount} Lekë` : `${amount} ${currency}`;
}

function getStatusConfig(status) {
  const configs = {
    PENDING: {
      label: "Në pritje",
      className: "bg-amber-50 text-amber-700",
    },
    PAID: {
      label: "E paguar",
      className: "bg-emerald-50 text-emerald-700",
    },
    FAILED: {
      label: "E dështuar",
      className: "bg-red-50 text-red-700",
    },
    REFUNDED: {
      label: "E rimbursuar",
      className: "bg-violet-50 text-violet-700",
    },
  };

  return (
    configs[status] || {
      label: status,
      className: "bg-slate-100 text-slate-700",
    }
  );
}

function getMethodLabel(method) {
  const labels = {
    CASH: "Cash",
    BANK_TRANSFER: "Transfertë bankare",
    CARD: "Kartë",
    OTHER: "Tjetër",
  };

  return labels[method] || method;
}

export default async function PaymentDetailsPage({ params }) {
  const resolvedParams = await params;
  const payment = await getPaymentById(resolvedParams.paymentId);

  if (!payment) {
    notFound();
  }

  const status = getStatusConfig(payment.status);
  const owner = payment.business.users[0]?.user;

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Kthehu te pagesat
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Platform Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Menaxho pagesën
            </h1>

            <p className="mt-2 text-slate-500">
              Shiko detajet, ndrysho statusin ose rimburso pagesën.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <Building2 size={20} className="text-blue-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Biznesi
          </p>

          <Link
            href={`/admin/businesses/${payment.business.id}`}
            className="mt-2 block font-bold text-slate-950 transition hover:text-blue-600"
          >
            {payment.business.name}
          </Link>

          <p className="mt-1 text-sm text-slate-500">
            {payment.business.city || "Qyteti i pacaktuar"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <ReceiptText size={20} className="text-blue-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Shuma
          </p>

          <p className="mt-2 text-xl font-bold text-slate-950">
            {formatPrice(payment.amount, payment.currency)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {getMethodLabel(payment.method)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <CreditCard size={20} className="text-blue-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Plani
          </p>

          <p className="mt-2 font-bold text-slate-950">
            {payment.subscription?.plan?.name || "Pa abonim"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {payment.subscription
              ? payment.subscription.billingInterval === "YEARLY"
                ? "Faturim vjetor"
                : "Faturim mujor"
              : "Pagesë e palidhur"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <CalendarDays size={20} className="text-blue-600" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Data
          </p>

          <p className="mt-2 font-bold text-slate-950">
            {formatDate(payment.paidAt || payment.createdAt)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {payment.paidAt ? "Data e pagesës" : "Data e regjistrimit"}
          </p>
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pronari
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              {owner?.name || "Pa pronar"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {owner?.email || payment.business.email || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Referenca
            </p>

            <p className="mt-2 break-words text-sm font-semibold text-slate-700">
              {payment.reference || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Periudha e mbuluar
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {formatDate(payment.periodStart)} —{" "}
              {formatDate(payment.periodEnd)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Regjistruar
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {formatDate(payment.createdAt)}
            </p>
          </div>
        </div>
      </section>

      {payment.description ? (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <FileText size={20} className="mt-0.5 shrink-0 text-blue-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-950">Përshkrimi</h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                {payment.description}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <PaymentActions payment={payment} />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            {payment.method === "CASH" ? (
              <Banknote size={21} className="text-blue-600" />
            ) : (
              <ReceiptText size={21} className="text-blue-600" />
            )}

            <div>
              <h2 className="font-bold text-slate-950">Abonimi i lidhur</h2>

              <p className="mt-1 text-sm text-slate-500">
                Shiko ose menaxho abonimin që lidhet me këtë pagesë.
              </p>
            </div>
          </div>

          {payment.subscription ? (
            <Link
              href={`/admin/subscriptions/${payment.subscription.id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Menaxho abonimin
            </Link>
          ) : (
            <span className="text-sm font-semibold text-slate-400">
              Pa abonim të lidhur
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
