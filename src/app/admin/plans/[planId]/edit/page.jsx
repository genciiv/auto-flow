import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";

import PlanForm from "@/components/admin/plans/PlanForm";
import { getPlanById } from "@/services/admin/plan-service";
import { moneyToNumber } from "@/lib/money";

export default async function EditPlanPage({ params }) {
  const resolvedParams = await params;
  const plan = await getPlanById(resolvedParams.planId);

  if (!plan) {
    notFound();
  }

  const serializedPlan = {
    ...plan,
    monthlyPrice: moneyToNumber(plan.monthlyPrice),
    yearlyPrice: moneyToNumber(plan.yearlyPrice),
  };

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/admin/plans"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Kthehu te planet
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Platform Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Modifiko planin
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Përditëso çmimet, limitet, veçoritë dhe statusin e planit{" "}
              <span className="font-semibold text-slate-700">{plan.name}</span>.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <PencilLine size={22} />
          </div>
        </div>
      </div>

      {plan.slug === "free-trial" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800">
            Ky është plani bazë i provës falas 7-ditore.
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-700">
            Slug-u, çmimi dhe statusi aktiv mbrohen nga sistemi sepse ky plan
            përdoret automatikisht kur aprovohet një biznes i ri.
          </p>
        </div>
      ) : null}

      <PlanForm plan={serializedPlan} />
    </div>
  );
}
