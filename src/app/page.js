import { ArrowRight, Calendar, Car, Package, Wrench } from "lucide-react";

const features = [
  {
    icon: Wrench,
    title: "Menaxhim servisi",
    description:
      "Organizo klientët, automjetet, shërbimet dhe faturat në një vend.",
  },
  {
    icon: Package,
    title: "Magazina e pjesëve",
    description:
      "Kontrollo stokun, çmimet, furnitorët dhe pjesët që përdoren në servis.",
  },
  {
    icon: Calendar,
    title: "Rezervime online",
    description:
      "Klientët mund të rezervojnë termine dhe të marrin njoftime automatike.",
  },
  {
    icon: Car,
    title: "Marketplace automotive",
    description:
      "Pjesë këmbimi, makina, motorë dhe pajisje për industrinë automotive.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Car size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight">AutoFlow</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-950">
              Features
            </a>
            <a href="#marketplace" className="hover:text-slate-950">
              Marketplace
            </a>
            <a href="#pricing" className="hover:text-slate-950">
              Pricing
            </a>
            <a href="#contact" className="hover:text-slate-950">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:block">
              Login
            </button>
            <button className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800">
              Get Started
            </button>
          </div>
        </div>
      </header>

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
              AutoFlow ndihmon serviset, gomisteritë, autoelektrikët dhe dyqanet
              e pjesëve të menaxhojnë klientët, automjetet, shërbimet,
              magazinën, faturat dhe marketplace-in.
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

      <section
        id="features"
        className="border-t border-slate-100 bg-slate-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Features
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Çdo gjë që i duhet një biznesi automotive.
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="marketplace" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Marketplace
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Pjesë këmbimi, makina dhe pajisje në një vend.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                AutoFlow lidh serviset me furnitorët, dyqanet e pjesëve dhe
                shitësit e automjeteve. Bli, shiko stokun dhe menaxho porositë
                direkt nga platforma.
              </p>

              <button className="mt-8 rounded-full bg-slate-950 px-7 py-4 text-sm font-bold text-white hover:bg-slate-800">
                Eksploro Marketplace
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Vaj motori", "2,500 Lek"],
                ["Disk frenash", "8,000 Lek"],
                ["Goma Michelin", "9,500 Lek"],
                ["BMW 320d", "2,200,000 Lek"],
              ].map(([name, price]) => (
                <div
                  key={name}
                  className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="mb-6 h-32 rounded-3xl bg-white shadow-inner" />
                  <h3 className="font-bold text-slate-950">{name}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
    </main>
  );
}
