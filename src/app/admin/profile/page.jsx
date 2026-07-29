import {
  BadgeCheck,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { requirePlatformAdmin } from "@/lib/auth-guard";

function getInitials(name) {
  const normalizedName = String(name || "AutoFlow Admin").trim();

  return normalizedName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AdminProfilePage() {
  const user = await requirePlatformAdmin();

  const name = user?.name || "AutoFlow Admin";
  const email = user?.email || "admin@autoflow.al";
  const initials = getInitials(name);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Profili
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Shiko informacionin e llogarisë dhe privilegjet e administratorit të
          platformës.
        </p>
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-600/20">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-slate-950">
                {name}
              </h2>

              <p className="mt-1 truncate text-sm text-slate-500">{email}</p>

              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <BadgeCheck size={14} />
                Administrator i platformës
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <UserRound size={19} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Emri i administratorit
            </p>

            <p className="mt-2 font-semibold text-slate-900">{name}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Mail size={19} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </p>

            <p className="mt-2 break-words font-semibold text-slate-900">
              {email}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <ShieldCheck size={19} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Roli
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              Platform Administrator
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ka akses të plotë në administrimin e platformës AutoFlow.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <KeyRound size={19} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Siguria
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              Llogari administrative
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kjo llogari mbrohet nga autentikimi dhe kontrolli i rolit
              administrativ.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Privilegjet administrative
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Administratori ka akses në modulet kryesore të platformës.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            "Menaxhimi i bizneseve",
            "Menaxhimi i aplikimeve",
            "Menaxhimi i planeve",
            "Menaxhimi i abonimeve",
            "Menaxhimi i pagesave",
            "Raportet dhe analitika",
            "Konfigurimet e platformës",
          ].map((permission) => (
            <div
              key={permission}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
            >
              <BadgeCheck size={17} className="shrink-0 text-emerald-600" />

              <span className="text-sm font-semibold text-slate-700">
                {permission}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
