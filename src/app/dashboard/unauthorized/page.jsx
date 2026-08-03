import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Akses i paautorizuar | AutoFlow",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert size={30} />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
          Akses i kufizuar
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Nuk ke leje për këtë faqe
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          Roli yt në këtë biznes nuk e lejon hapjen e kësaj pjese. Kontakto
          pronarin ose menaxherin nëse të duhet akses shtesë.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Kthehu te dashboard-i
        </Link>
      </section>
    </main>
  );
}
