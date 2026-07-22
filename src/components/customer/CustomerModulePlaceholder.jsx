import Link from "next/link";

import { ArrowLeft, Construction } from "lucide-react";

export default function CustomerModulePlaceholder({ title, description }) {
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Construction size={28} />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
          {description}
        </p>

        <Link
          href="/customer/dashboard"
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600"
        >
          <ArrowLeft size={17} />
          Kthehu te përmbledhja
        </Link>
      </div>
    </div>
  );
}
