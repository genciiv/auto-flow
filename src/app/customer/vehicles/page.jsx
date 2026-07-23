import Link from "next/link";

import {
  ArrowRight,
  CarFront,
  Fuel,
  Gauge,
  Plus,
  Search,
  Settings2,
} from "lucide-react";

import { db } from "@/lib/db";
import { requireCustomerContext } from "@/lib/customer-context";

export const metadata = {
  title: "Makinat e mia | AutoFlow",
  description: "Menaxho automjetet personale në AutoFlow.",
};

function formatMileage(value) {
  if (value === null || value === undefined) {
    return "Nuk është vendosur";
  }

  return `${new Intl.NumberFormat("sq-AL").format(value)} km`;
}

export default async function CustomerVehiclesPage({ searchParams }) {
  const { profileId } = await requireCustomerContext();
  const resolvedSearchParams = await searchParams;
  const query = String(resolvedSearchParams?.q || "").trim();

  const vehicles = await db.customerVehicle.findMany({
    where: {
      profileId,

      ...(query
        ? {
            OR: [
              {
                plate: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                brand: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                model: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                vin: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <CarFront size={14} />
                Garazhi im personal
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Makinat e mia
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Regjistro dhe menaxho automjetet, kilometrat, VIN-in dhe të
                dhënat teknike.
              </p>
            </div>

            <Link
              href="/customer/vehicles/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
            >
              <Plus size={17} />
              Shto automjet
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Kërko sipas targës, markës, modelit ose VIN-it..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            Kërko
          </button>

          {query ? (
            <Link
              href="/customer/vehicles"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Pastro
            </Link>
          ) : null}
        </form>
      </section>

      {vehicles.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CarFront size={29} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-950">
            {query
              ? "Nuk u gjet asnjë automjet"
              : "Nuk ke regjistruar ende automjete"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {query
              ? "Provo të kërkosh me një targë, markë, model ose VIN tjetër."
              : "Shto makinën tënde të parë për të ruajtur informacionin teknik dhe historikun e saj."}
          </p>

          {!query ? (
            <Link
              href="/customer/vehicles/new"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600"
            >
              <Plus size={17} />
              Shto makinën e parë
            </Link>
          ) : null}
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => {
            const vehicleTitle = [vehicle.brand, vehicle.model]
              .filter(Boolean)
              .join(" ");

            return (
              <Link
                key={vehicle.id}
                href={`/customer/vehicles/${vehicle.id}`}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <div className="border-b border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <CarFront size={23} />
                    </div>

                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black tracking-wider text-slate-950 shadow-sm">
                      {vehicle.plate}
                    </span>
                  </div>

                  <h2 className="mt-5 truncate text-lg font-bold text-slate-950">
                    {vehicleTitle || vehicle.brand}
                  </h2>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {vehicle.year || "Viti i papërcaktuar"}
                  </p>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Fuel size={15} />
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          Karburanti
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm font-bold text-slate-800">
                        {vehicle.fuel || "—"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Settings2 size={15} />
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          Kambio
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm font-bold text-slate-800">
                        {vehicle.transmission || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Gauge size={16} />

                      <span className="text-xs font-semibold">
                        {formatMileage(vehicle.mileage)}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600">
                      Detajet
                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
