import Link from "next/link";
import { ArrowLeft, Check, CreditCard } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import PlanRequestButton from "./PlanRequestButton";

const FEATURE_LABELS = {
  appointments: "Takime dhe rezervime",
  customers: "Menaxhim klientësh",
  vehicles: "Menaxhim automjetesh",
  services: "Regjistrim i punëve të servisit",
  invoices: "Krijim faturash",
  inventory: "Inventar dhe stok",
  purchases: "Blerje dhe furnitorë",
  analytics: "Analitika",
  advancedAnalytics: "Analitika të avancuara",
  reports: "Raporte të avancuara",
  exports: "Eksporte",
  auditLogs: "Audit logs",
  staffRoles: "Role dhe leje për stafin",
  prioritySupport: "Mbështetje prioritare",
};

function formatMoney(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getFeatureLabels(features) {
  if (!Array.isArray(features)) {
    return [];
  }

  return features.map((feature) => FEATURE_LABELS[feature] || feature);
}

export default async function SubscriptionSettingsPage() {
  const { businessId } = await requireBusinessPermission(
    PERMISSIONS.BILLING_MANAGE,
  );

  const [business, currentSubscription, plans] = await Promise.all([
    db.business.findUnique({
      where: { id: businessId },
      select: { name: true },
    }),
    db.subscription.findFirst({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      select: {
        planId: true,
        status: true,
        plan: { select: { name: true } },
      },
    }),
    db.plan.findMany({
      where: {
        isActive: true,
        slug: { not: "free-trial" },
      },
      orderBy: [{ sortOrder: "asc" }, { monthlyPrice: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        monthlyPrice: true,
        yearlyPrice: true,
        maxUsers: true,
        maxCustomers: true,
        maxVehicles: true,
        features: true,
        isRecommended: true,
      },
    }),
  ]);


  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-5">
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Kthehu te cilësimet
          </Link>

          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <CreditCard size={14} />
                Planet dhe faturimi
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Zgjidh planin e AutoFlow
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Shiko planet aktive dhe dërgo kërkesën për ndryshim. Aktivizimi përfundimtar bëhet pasi pagesa të konfirmohet nga administratori.
              </p>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {plans.map((plan) => {
            const isCurrent = currentSubscription?.planId === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative rounded-[2rem] border bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  plan.isRecommended
                    ? "border-blue-500 ring-4 ring-blue-50"
                    : "border-slate-200"
                }`}
              >
                {plan.isRecommended ? (
                  <span className="absolute right-6 top-6 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    I rekomanduar
                  </span>
                ) : null}

                <h2 className="pr-28 text-2xl font-black text-slate-950">
                  {plan.name}
                </h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-black tracking-tight text-slate-950">
                    {formatMoney(plan.monthlyPrice)}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">/ muaj</span>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-600">
                  {formatMoney(plan.yearlyPrice)} / vit
                </p>

                <div className="my-6 h-px bg-slate-200" />

                <ul className="space-y-3">
                  {getFeatureLabels(plan.features).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-slate-600"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p>Deri në {plan.maxUsers ?? "pa kufi"} përdorues</p>
                  <p className="mt-1">
                    {plan.maxCustomers ?? "Pa kufi"} klientë · {" "}
                    {plan.maxVehicles ?? "Pa kufi"} automjete
                  </p>
                </div>

                {isCurrent ? (
                  <div className="mt-6 rounded-full bg-emerald-50 px-5 py-3 text-center text-sm font-black text-emerald-700">
                    Plani aktual · {currentSubscription.status}
                  </div>
                ) : (
                  <PlanRequestButton planId={plan.id} planName={plan.name} />
                )}
              </article>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
