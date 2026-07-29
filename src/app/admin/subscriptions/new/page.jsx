import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

import SubscriptionForm from "@/components/admin/subscriptions/SubscriptionForm";
import { getSubscriptionFormData } from "@/services/admin/subscription-service";

export default async function NewSubscriptionPage() {
  const { businesses, plans } = await getSubscriptionFormData();

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

        <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Platform Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Aktivizo abonim
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Zgjidh biznesin, planin dhe periudhën e faturimit për të
              aktivizuar një abonim me pagesë.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CreditCard size={22} />
          </div>
        </div>
      </div>

      {businesses.length === 0 ? (
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-base font-bold text-amber-900">
            Nuk ka biznese aktive
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Duhet të ekzistojë të paktën një biznes aktiv përpara se të krijosh
            një abonim.
          </p>

          <Link
            href="/admin/businesses"
            className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Shiko bizneset
          </Link>
        </section>
      ) : plans.length === 0 ? (
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-base font-bold text-amber-900">
            Nuk ka plane me pagesë aktive
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Krijo ose aktivizo të paktën një plan me pagesë. Plani Free Trial
            nuk mund të zgjidhet manualisht.
          </p>

          <Link
            href="/admin/plans"
            className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Menaxho planet
          </Link>
        </section>
      ) : (
        <SubscriptionForm businesses={businesses} plans={plans} />
      )}
    </div>
  );
}
