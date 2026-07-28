import Link from "next/link";
import { CarFront, ShieldCheck } from "lucide-react";

import ActivateAccountForm from "./activate-account-form";

export const metadata = {
  title: "Aktivizo llogarinë | AutoFlow",
  description: "Aktivizo llogarinë e pronarit të biznesit AutoFlow.",
};

export default async function ActivateAccountPage({ searchParams }) {
  const params = await searchParams;

  const token = typeof params?.token === "string" ? params.token.trim() : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white">
            <CarFront className="size-6" />
          </div>

          <div>
            <p className="text-xl font-bold text-slate-950">AutoFlow</p>

            <p className="text-xs text-slate-500">Auto Service Management</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck className="size-6" />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            Aktivizo llogarinë
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Vendos password-in që do të përdorësh për të hyrë në dashboard-in e
            biznesit.
          </p>

          {token ? (
            <ActivateAccountForm token={token} />
          ) : (
            <div className="mt-8">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                Linku i aktivizimit nuk është i vlefshëm ose token-i mungon.
              </div>

              <Link
                href="/login"
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"
              >
                Shko te hyrja
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
