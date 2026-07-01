import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Platformë SaaS për industrinë automotive
          </div>

          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 md:text-7xl">
            Menaxho servisin dhe biznesin tënd nga një platformë e vetme.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            AutoFlow ndihmon serviset, gomisteritë, autoelektrikët dhe dyqanet e
            pjesëve të menaxhojnë klientët, automjetet, shërbimet, magazinën,
            faturat dhe marketplace-in.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700">
              Fillo falas
              <ArrowRight size={18} />
            </button>

            <button className="rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50">
              Shiko demo
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-blue-100/60 blur-3xl" />

          <div className="relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Dashboard
                  </p>
                  <h3 className="text-2xl font-bold text-slate-950">
                    Servisi AutoFlow
                  </h3>
                </div>

                <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                  Online
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Klientë", "1,248"],
                  ["Automjete", "2,410"],
                  ["Shërbime", "486"],
                  ["Të ardhura", "€18,920"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-slate-200 bg-white p-5"
                  >
                    <p className="text-sm font-medium text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold text-slate-950">
                    Shërbimet e sotme
                  </h4>
                  <span className="text-sm font-semibold text-blue-600">
                    12 termine
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    ["BMW X5", "Ndërrim vaji", "09:30"],
                    ["Audi A4", "Diagnostikim", "11:00"],
                    ["VW Golf 7", "Frena", "13:45"],
                  ].map(([car, service, time]) => (
                    <div
                      key={car}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                    >
                      <div>
                        <p className="font-bold text-slate-950">{car}</p>
                        <p className="text-sm text-slate-500">{service}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
