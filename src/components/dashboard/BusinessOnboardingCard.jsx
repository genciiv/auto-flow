import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Circle } from "lucide-react";

const FIELD_CONFIG = [
  {
    key: "nipt",
    label: "NIPT",
  },
  {
    key: "phone",
    label: "Telefoni",
  },
  {
    key: "email",
    label: "Email-i i biznesit",
  },
  {
    key: "city",
    label: "Qyteti",
  },
  {
    key: "address",
    label: "Adresa",
  },
  {
    key: "workingHours",
    label: "Orari i punës",
  },
];

function hasValue(value) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

export default function BusinessOnboardingCard({ business }) {
  if (!business) {
    return null;
  }

  const completedFields = FIELD_CONFIG.filter((field) =>
    hasValue(business[field.key]),
  );

  const missingFields = FIELD_CONFIG.filter(
    (field) => !hasValue(business[field.key]),
  );

  const completionPercentage = Math.round(
    (completedFields.length / FIELD_CONFIG.length) * 100,
  );

  if (completionPercentage === 100) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-blue-200 bg-white shadow-sm">
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-7">
        <div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-slate-950">
                  Plotëso profilin e biznesit
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {completionPercentage}% i plotësuar
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Plotëso të dhënat kryesore të biznesit që faturat, kontaktet dhe
                informacionet e servisit të shfaqen saktë në AutoFlow.
              </p>
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
              }}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {FIELD_CONFIG.map((field) => {
              const completed = hasValue(business[field.key]);

              return (
                <div
                  key={field.key}
                  className="flex items-center gap-2 text-sm"
                >
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                  )}

                  <span
                    className={
                      completed
                        ? "font-medium text-slate-700"
                        : "font-medium text-slate-400"
                    }
                  >
                    {field.label}
                  </span>
                </div>
              );
            })}
          </div>

          {missingFields.length > 0 ? (
            <p className="mt-5 text-xs font-medium text-slate-400">
              Mungojnë {missingFields.length} nga {FIELD_CONFIG.length} të dhëna
              kryesore.
            </p>
          ) : null}
        </div>

        <div className="lg:pl-4">
          <Link
            href="/dashboard/settings#business-settings"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 lg:w-auto"
          >
            Plotëso profilin
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
