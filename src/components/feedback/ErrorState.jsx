"use client";

import { CircleAlert, RotateCcw } from "lucide-react";

export default function ErrorState({ title = "Diçka shkoi keq", description = "Faqja nuk mund të ngarkohej. Provo përsëri.", reset }) {
  return <div className="flex min-h-[50vh] items-center justify-center p-6"><div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><CircleAlert className="size-7" /></div><h1 className="mt-5 text-2xl font-black text-slate-950">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p><button type="button" onClick={reset} className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"><RotateCcw className="size-4" />Provo përsëri</button></div></div>;
}
