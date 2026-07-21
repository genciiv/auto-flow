import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessContext } from "@/lib/business-context";

export default async function UnauthorizedPage() {
  const { businessRole } = await requireBusinessContext();

  return (
    <DashboardLayout>
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldX size={30} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-wider text-red-600">
            Akses i kufizuar
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Nuk keni leje për këtë faqe
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Roli juaj aktual është{" "}
            <span className="font-bold text-slate-700">{businessRole}</span>.
            Kontaktoni pronarin ose menaxherin e biznesit nëse mendoni se duhet
            të keni akses.
          </p>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
            Kthehu te Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
