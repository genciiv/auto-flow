import Link from "next/link";
import { CarFront, KeyRound } from "lucide-react";

import ForgotPasswordForm from "./forgot-password-form";

export const metadata = {
  title: "Harrove password-in? | AutoFlow",
  description:
    "Kërko një link për rivendosjen e password-it të llogarisë AutoFlow.",
};

export default function ForgotPasswordPage() {
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
            <KeyRound className="size-6" />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            Harrove password-in?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Vendos email-in e llogarisë dhe do të marrësh një link për të
            krijuar një password të ri.
          </p>

          <ForgotPasswordForm />

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
