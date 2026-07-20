import Link from "next/link";
import { Building2 } from "lucide-react";

export default function BusinessNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Building2 size={28} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-950">
          Biznesi nuk u gjet
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Biznesi mund të jetë fshirë ose adresa e përdorur nuk është e saktë.
        </p>

        <Link
          href="/admin/businesses"
          className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Kthehu te bizneset
        </Link>
      </div>
    </div>
  );
}
