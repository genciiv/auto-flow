import Link from "next/link";
import { FileText } from "lucide-react";

export default function ApplicationNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <FileText size={28} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-950">
          Aplikimi nuk u gjet
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Aplikimi mund të jetë fshirë ose adresa nuk është e saktë.
        </p>

        <Link
          href="/admin/applications"
          className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Kthehu te aplikimet
        </Link>
      </div>
    </div>
  );
}
