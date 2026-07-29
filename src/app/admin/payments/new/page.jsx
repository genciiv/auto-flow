import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";

import PaymentForm from "@/components/admin/payments/PaymentForm";
import { getPaymentFormData } from "@/services/admin/payment-service";

export default async function NewPaymentPage() {
  const { subscriptions, paymentMethods } = await getPaymentFormData();

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
              Regjistro pagesë
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Regjistro një pagesë cash, transfertë bankare ose metodë tjetër
              dhe lidhe me abonimin e biznesit.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ReceiptText size={22} />
          </div>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-base font-bold text-amber-900">
            Nuk ka abonime të disponueshme
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Duhet të ekzistojë të paktën një abonim i lidhur me një plan me
            pagesë përpara se të regjistrosh pagesën.
          </p>

          <Link
            href="/admin/subscriptions"
            className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Shiko abonimet
          </Link>
        </section>
      ) : (
        <PaymentForm
          subscriptions={subscriptions}
          paymentMethods={paymentMethods}
        />
      )}
    </div>
  );
}
