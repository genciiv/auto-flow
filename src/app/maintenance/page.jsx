import { Clock3, Mail, Settings2 } from "lucide-react";

import SubscriptionLogoutButton from "@/components/subscription/SubscriptionLogoutButton";
import { requireUser } from "@/lib/auth-guard";
import { getMaintenanceStatus } from "@/services/maintenance-service";

export default async function MaintenancePage() {
  await requireUser();

  const maintenance = await getMaintenanceStatus();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Settings2 size={30} />
        </div>

        <p className="mt-6 text-sm font-semibold text-blue-600">
          {maintenance.platformName}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Platforma është në mirëmbajtje
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
          Po kryejmë disa përmirësime teknike. Aksesi do të rikthehet sapo
          mirëmbajtja të përfundojë.
        </p>

        <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left">
          <div className="flex items-start gap-3">
            <Clock3 size={19} className="mt-0.5 shrink-0 text-blue-700" />

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Provo përsëri më vonë
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Llogaria dhe të dhënat e biznesit janë të sigurta. Nuk kërkohet
                asnjë veprim nga ana jote.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={`mailto:${maintenance.supportEmail}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Mail size={17} />
            Kontakto suportin
          </a>

          <SubscriptionLogoutButton />
        </div>
      </section>
    </main>
  );
}
