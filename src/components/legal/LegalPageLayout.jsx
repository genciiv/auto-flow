import Link from "next/link";
import { ArrowLeft, CarFront, FileText } from "lucide-react";

export default function LegalPageLayout({
  eyebrow,
  title,
  description,
  lastUpdated = "30 korrik 2026",
  children,
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Kthehu në AutoFlow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <CarFront size={19} />
            </div>

            <div>
              <p className="font-black tracking-[-0.03em] text-slate-950">
                AutoFlow
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Automotive platform
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Kthehu
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-blue-100/50 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            <FileText size={14} />
            {eyebrow}
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            {description}
          </p>

          <p className="mt-6 text-xs font-semibold text-slate-400">
            Përditësuar më: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <article className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white px-5 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-10 sm:py-12">
          <div className="legal-content">{children}</div>
        </article>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AutoFlow.</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-slate-950">
              Privatësia
            </Link>

            <Link href="/terms" className="hover:text-slate-950">
              Kushtet
            </Link>

            <Link href="/cookies" className="hover:text-slate-950">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
