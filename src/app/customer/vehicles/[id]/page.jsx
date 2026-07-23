import Link from "next/link";
import { notFound } from "next/navigation";
import { Link2 } from "lucide-react";

import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Fuel,
  Gauge,
  Hash,
  Palette,
  Settings2,
} from "lucide-react";

import CustomerVehicleForm from "@/components/customer/CustomerVehicleForm";
import DeleteCustomerVehicleButton from "@/components/customer/DeleteCustomerVehicleButton";
import { updateCustomerVehicle } from "@/app/customer/vehicles/actions";
import { db } from "@/lib/db";
import { requireCustomerContext } from "@/lib/customer-context";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  return {
    title: `Automjeti ${resolvedParams.id} | AutoFlow`,
  };
}

function formatMileage(value) {
  if (value === null || value === undefined) {
    return "Nuk është vendosur";
  }

  return `${new Intl.NumberFormat("sq-AL").format(value)} km`;
}

export default async function CustomerVehicleDetailsPage({ params }) {
  const { profileId } = await requireCustomerContext();
  const resolvedParams = await params;
  const vehicleId = resolvedParams.id;

  const vehicle = await db.customerVehicle.findFirst({
    where: {
      id: vehicleId,
      profileId,
    },
  });

  if (!vehicle) {
    notFound();
  }

  const vehicleTitle =
    [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || vehicle.brand;

  const updateAction = updateCustomerVehicle.bind(null, vehicle.id);

  const details = [
    {
      label: "Targa",
      value: vehicle.plate,
      icon: Hash,
    },
    {
      label: "Viti",
      value: vehicle.year || "Nuk është vendosur",
      icon: CalendarDays,
    },
    {
      label: "Karburanti",
      value: vehicle.fuel || "Nuk është vendosur",
      icon: Fuel,
    },
    {
      label: "Kambio",
      value: vehicle.transmission || "Nuk është vendosur",
      icon: Settings2,
    },
    {
      label: "Kilometrat",
      value: formatMileage(vehicle.mileage),
      icon: Gauge,
    },
    {
      label: "Ngjyra",
      value: vehicle.color || "Nuk është vendosur",
      icon: Palette,
    },
  ];

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/customer/vehicles"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Kthehu te makinat
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <CarFront size={14} />
                Detajet e automjetit
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {vehicleTitle}
              </h1>

              <p className="mt-3 text-sm font-black tracking-[0.18em] text-blue-300">
                {vehicle.plate}
              </p>
            </div>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  <CarFront size={14} />
                  Detajet e automjetit
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  {vehicleTitle}
                </h1>

                <p className="mt-3 text-sm font-black tracking-[0.18em] text-blue-300">
                  {vehicle.plate}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <Link
                  href={`/customer/vehicles/${vehicle.id}/claim`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Link2 size={18} />
                  Lidhe me një servis
                </Link>

                <DeleteCustomerVehicleButton
                  vehicleId={vehicle.id}
                  vehicleName={`${vehicleTitle} (${vehicle.plate})`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {details.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={20} />
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                {item.label}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-950">
                {item.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-slate-950">
            Përditëso automjetin
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ndrysho të dhënat teknike ose informacionin e automjetit.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <CustomerVehicleForm
            action={updateAction}
            vehicle={vehicle}
            submitLabel="Ruaj ndryshimet"
          />
        </div>
      </section>
    </div>
  );
}
