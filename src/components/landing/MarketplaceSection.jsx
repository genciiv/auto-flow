import Link from "next/link";

export default function MarketplaceSection() {
  return (
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

            <Link
              href="/marketplace"
              className="mt-8 inline-flex rounded-full bg-slate-950 px-7 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Eksploro Marketplace
            </Link>
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
  );
}
