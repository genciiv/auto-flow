import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";

import PlanForm from "@/components/admin/plans/PlanForm";

export default function NewPlanPage() {
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
              Krijo plan të ri
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Krijo një plan abonimi me çmimet, limitet dhe veçoritë që do t’u
              ofrohen bizneseve.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <PlusCircle size={23} />
          </div>
        </div>
      </div>

      <PlanForm />
    </div>
  );
}
