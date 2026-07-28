import Link from "next/link";
import { Check, ChevronRight, Circle, ClipboardCheck } from "lucide-react";

const STEPS = [
  {
    key: "profile",
    title: "Plotëso profilin e biznesit",
    description: "Shto NIPT-in, kontaktet, adresën dhe orarin e punës.",
    href: "/dashboard/settings#business-settings",
  },
  {
    key: "customer",
    title: "Shto klientin e parë",
    description: "Regjistro klientin e parë të servisit.",
    href: "/dashboard/customers",
  },
  {
    key: "vehicle",
    title: "Shto automjetin e parë",
    description: "Lidh një automjet me klientin përkatës.",
    href: "/dashboard/vehicles",
  },
  {
    key: "service",
    title: "Krijo shërbimin e parë",
    description: "Regjistro një ndërhyrje ose punë servisi.",
    href: "/dashboard/services",
  },
  {
    key: "invoice",
    title: "Krijo faturën e parë",
    description: "Përfundo rrjedhën duke krijuar faturën e parë.",
    href: "/dashboard/invoices",
  },
];

export default function GettingStartedChecklist({
  profileComplete = false,
  customerCount = 0,
  vehicleCount = 0,
  serviceCount = 0,
  invoiceCount = 0,
}) {
  const completionState = {
    profile: profileComplete,
    customer: customerCount > 0,
    vehicle: vehicleCount > 0,
    service: serviceCount > 0,
    invoice: invoiceCount > 0,
  };

  const completedSteps = STEPS.filter(
    (step) => completionState[step.key],
  ).length;

  const completionPercentage = Math.round(
    (completedSteps / STEPS.length) * 100,
  );

  if (completedSteps === STEPS.length) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <ClipboardCheck className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-950">
                Fillo me AutoFlow
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {completedSteps}/{STEPS.length} hapa
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Përfundo këto hapa për ta bërë biznesin gati për përdorim të
              përditshëm.
            </p>
          </div>
        </div>

        <span className="text-sm font-bold text-blue-600">
          {completionPercentage}%
        </span>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width: `${completionPercentage}%`,
          }}
        />
      </div>

      <div className="mt-6 divide-y divide-slate-100">
        {STEPS.map((step) => {
          const completed = completionState[step.key];

          return (
            <Link
              key={step.key}
              href={step.href}
              className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    completed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold ${
                      completed
                        ? "text-slate-500 line-through"
                        : "text-slate-900"
                    }`}
                  >
                    {step.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
