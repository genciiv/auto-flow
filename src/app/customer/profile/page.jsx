import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import CustomerProfileForm from "@/components/customer/CustomerProfileForm";
import { requireCustomerContext } from "@/lib/customer-context";

export const metadata = {
  title: "Profili im | AutoFlow",
  description: "Menaxho të dhënat personale të llogarisë tënde AutoFlow.",
};

function formatDate(value) {
  if (!value) {
    return "Nuk është vendosur";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Nuk është vendosur";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function CustomerProfilePage() {
  const { user, profile } = await requireCustomerContext();

  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    user.name ||
    "Klient AutoFlow";

  const profileFields = [
    profile.firstName,
    profile.lastName,
    profile.phone || user.phone,
    profile.city,
    profile.address,
    profile.birthDate,
  ];

  const completedFields = profileFields.filter(Boolean).length;
  const completionPercentage = Math.round(
    (completedFields / profileFields.length) * 100,
  );

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <UserRound size={14} />
              Llogaria personale
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Profili im
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Mbaji të përditësuara të dhënat personale për një eksperiencë më
              të mirë në AutoFlow.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserRound size={29} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              {fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">{user.email}</p>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Plotësimi i profilit
                </p>

                <span className="text-sm font-bold text-blue-600">
                  {completionPercentage}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-start gap-3">
                <Mail size={17} className="mt-0.5 shrink-0 text-slate-400" />

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Email</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={17} className="mt-0.5 shrink-0 text-slate-400" />

                <div>
                  <p className="text-xs font-medium text-slate-500">Telefoni</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {profile.phone || user.phone || "Nuk është vendosur"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-slate-400" />

                <div>
                  <p className="text-xs font-medium text-slate-500">Qyteti</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {profile.city || "Nuk është vendosur"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Datëlindja
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(profile.birthDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950">
                  Të dhënat e tua janë private
                </h3>

                <p className="mt-1 text-xs leading-6 text-slate-600">
                  Informacioni përdoret vetëm për funksionet e portalit dhe për
                  komunikimin me bizneset që zgjedh të kontaktosh.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-slate-950">
              Të dhënat personale
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Përditëso informacionin e profilit tënd.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <CustomerProfileForm user={user} profile={profile} />
          </div>
        </div>
      </section>
    </div>
  );
}
