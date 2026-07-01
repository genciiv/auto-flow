export default function AiSection() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                AI Assistant
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                AI që ndihmon servisin të punojë më shpejt.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Përshkruaj defektin, ngarko raportin OBD ose faturën dhe
                AutoFlow AI sugjeron shkaqet, pjesët dhe hapat e kontrollit.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white">
              <p className="text-sm text-slate-400">AutoFlow AI</p>

              <div className="mt-6 rounded-2xl bg-white/10 p-4">
                Makina bën zhurmë kur frenoj. Çfarë mund të jetë?
              </div>

              <div className="mt-4 space-y-3 rounded-2xl bg-white p-4 text-slate-900">
                <p className="font-bold">Sugjerime të mundshme:</p>
                <p>1. Ferodo të konsumuara</p>
                <p>2. Disqe frenash të dëmtuara</p>
                <p>3. Kushinetë rrote</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
