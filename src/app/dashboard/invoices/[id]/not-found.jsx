import Link from "next/link";
import { FileQuestion, MoveLeft } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function InvoiceNotFound() {
  return (
    <DashboardLayout>
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <FileQuestion className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Fatura nuk u gjet
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Fatura që po kërkon mund të jetë fshirë ose adresa mund të jetë e
            pasaktë.
          </p>

          <Link
            href="/dashboard/invoices"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <MoveLeft className="h-4 w-4" />
            Kthehu te faturat
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
