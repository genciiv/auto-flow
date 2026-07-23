import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, CarFront, Link2, ShieldCheck } from "lucide-react";

import VehicleClaimSearch from "@/components/customer/VehicleClaimSearch";
import { searchWorkshopVehicles } from "@/app/customer/vehicles/claim-actions";
import { db } from "@/lib/db";
import { requireCustomerContext } from "@/lib/customer-context";

export const metadata = {
  title: "Lidh automjetin me servisin | AutoFlow",
};

export default async function VehicleClaimPage({ params }) {
  const { profileId } = await requireCustomerContext();
  const resolvedParams = await params;

  const customerVehicle = await db.customerVehicle.findFirst({
    where: {
      id: resolvedParams.id,
      profileId,
    },

    select: {
      id: true,
      plate: true,
      brand: true,
      model: true,
      year: true,
      vin: true,
    },
  });

  if (!customerVehicle) {
    notFound();
  }

  const title = [customerVehicle.brand, customerVehicle.model]
    .filter(Boolean)
    .join(" ");

  const searchAction = searchWorkshopVehicles.bind(null, customerVehicle.id);

  return (
    <div className="space-y-7">
      <Link
        href={`/customer/vehicles/${customerVehicle.id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Kthehu te automjeti
      </Link>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <Link2 size={14} />
              Lidhja me servisin
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              {title || customerVehicle.brand}
            </h1>

            <div className="mt-4 inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <CarFront size={19} />
              </div>

              <span className="text-sm font-black tracking-[0.18em] text-blue-300">
                {customerVehicle.plate}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.34fr]">
        <VehicleClaimSearch
          customerVehicle={customerVehicle}
          searchAction={searchAction}
        />

        <aside className="h-fit rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <ShieldCheck size={21} />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-950">
            Pse kërkohet miratimi?
          </h2>

          <p className="mt-2 text-xs leading-6 text-slate-600">
            Historiku i serviseve dhe faturat janë informacion privat. Servisi
            duhet të konfirmojë se automjeti të përket ty para se të dhënat të
            shfaqen në portal.
          </p>
        </aside>
      </div>
    </div>
  );
}
