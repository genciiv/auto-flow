import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

const marketplaceTypes = [
  {
    value: "",
    label: "Të gjitha",
  },
  {
    value: "VEHICLE",
    label: "Makina",
  },
  {
    value: "MOTORCYCLE",
    label: "Motorë",
  },
  {
    value: "PART",
    label: "Pjesë këmbimi",
  },
  {
    value: "ACCESSORY",
    label: "Aksesorë",
  },
  {
    value: "SERVICE",
    label: "Shërbime",
  },
];

export default function MarketplaceHero({
  search = "",
  type = "",
  city = "",
  sort = "NEWEST",
}) {
  const hasActiveFilters =
    Boolean(search) || Boolean(type) || Boolean(city) || sort !== "NEWEST";

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/80 via-white to-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
          <div className="grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                <Sparkles size={14} />
                Marketplace AutoFlow
              </div>

              <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Gjej makina, pjesë dhe shërbime automobilistike
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Shfleto publikime nga servise, biznese dhe shitës privatë në të
                gjithë Shqipërinë.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  <CarFront size={16} className="text-blue-600" />
                  Automjete
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  <Wrench size={16} className="text-blue-600" />
                  Pjesë dhe shërbime
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  <ShieldCheck size={16} className="text-blue-600" />
                  Biznese të verifikuara
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
              <div className="absolute -bottom-8 left-10 h-32 w-32 rounded-full bg-sky-100 blur-3xl" />

              <div className="relative rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="rounded-[1.35rem] bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-950">
                    Çfarë po kërkon?
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Kërko sipas markës, modelit, qytetit ose shërbimit.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ["Makina", "VEHICLE"],
                      ["Motorë", "MOTORCYCLE"],
                      ["Pjesë", "PART"],
                      ["Shërbime", "SERVICE"],
                    ].map(([label, value]) => (
                      <Link
                        key={value}
                        href={`/marketplace?type=${value}`}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-6 sm:px-10 lg:px-14">
            <form
              action="/marketplace"
              method="GET"
              className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_180px_145px]"
            >
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Kërko markë, model, pjesë ose shërbim..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <select
                name="type"
                defaultValue={type}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {marketplaceTypes.map((option) => (
                  <option key={option.value || "ALL"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="city"
                defaultValue={city}
                placeholder="Qyteti"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Kërko
                <ArrowRight size={17} />
              </button>

              <input type="hidden" name="sort" value={sort} />
            </form>

            {hasActiveFilters ? (
              <div className="mt-4 flex justify-end">
                <Link
                  href="/marketplace"
                  className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                >
                  Pastro filtrat
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
