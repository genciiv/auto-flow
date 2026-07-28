import Link from "next/link";
import { CarFront, MailCheck } from "lucide-react";

import ResendVerificationForm from "./resend-verification-form";

export const metadata = {
  title: "Ridërgo email-in e verifikimit | AutoFlow",
  description: "Merr një link të ri për verifikimin e llogarisë AutoFlow.",
};

export default async function ResendVerificationPage({ searchParams }) {
  const params = await searchParams;

  const initialEmail =
    typeof params?.email === "string" ? params.email.trim().toLowerCase() : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white">
            <CarFront className="size-6" />
          </div>

          <div>
            <p className="text-xl font-bold text-slate-950">AutoFlow</p>

            <p className="text-xs text-slate-500">Portali i klientit</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <MailCheck className="size-6" />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            Ridërgo email-in
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Vendos email-in me të cilin u regjistrove dhe do të marrësh një link
            të ri verifikimi.
          </p>

          <ResendVerificationForm initialEmail={initialEmail} />

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Kthehu te hyrja
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
