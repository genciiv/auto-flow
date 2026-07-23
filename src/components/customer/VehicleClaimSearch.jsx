"use client";

import { useActionState, useState, useTransition } from "react";
import {
  Building2,
  CarFront,
  CheckCircle2,
  Clock3,
  Link2,
  LoaderCircle,
  MapPin,
  Search,
  Send,
  XCircle,
} from "lucide-react";

import {
  cancelVehicleClaim,
  createVehicleClaim,
} from "@/app/customer/vehicles/claim-actions";

const initialState = {
  success: false,
  message: "",
  vehicles: [],
};

function StatusBadge({ status }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={14} />E miratuar
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        <Clock3 size={14} />
        Në pritje
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
        <XCircle size={14} />E refuzuar
      </span>
    );
  }

  return null;
}

function ClaimButton({ customerVehicleId, vehicle }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleClaim() {
    setMessage("");

    startTransition(async () => {
      const result = await createVehicleClaim(
        customerVehicleId,
        vehicle.id,
        "",
      );

      setMessage(result.message);
    });
  }

  function handleCancel() {
    if (!vehicle.claim?.id) {
      return;
    }

    setMessage("");

    startTransition(async () => {
      const result = await cancelVehicleClaim(vehicle.claim.id);
      setMessage(result.message);
    });
  }

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      {vehicle.claim ? (
        <div className="flex flex-col gap-3">
          <StatusBadge status={vehicle.claim.status} />

          {vehicle.claim.status === "PENDING" ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {isPending ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              Anulo kërkesën
            </button>
          ) : null}

          {vehicle.claim.status === "REJECTED" ? (
            <button
              type="button"
              onClick={handleClaim}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
            >
              {isPending ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Dërgo përsëri
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClaim}
          disabled={isPending}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Duke dërguar...
            </>
          ) : (
            <>
              <Link2 size={16} />
              Kërko lidhjen me servisin
            </>
          )}
        </button>
      )}

      {message ? (
        <p className="mt-3 text-xs font-semibold leading-5 text-slate-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default function VehicleClaimSearch({ customerVehicle, searchAction }) {
  const [state, formAction, isPending] = useActionState(
    searchAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Search size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">
              Kërko automjetin te serviset
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Kërkimi bëhet me targën ose VIN-in e automjetit.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="plate"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Targa
            </label>

            <input
              id="plate"
              name="plate"
              type="text"
              defaultValue={customerVehicle.plate}
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold uppercase text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="vin"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Numri VIN
            </label>

            <input
              id="vin"
              name="vin"
              type="text"
              defaultValue={customerVehicle.vin || ""}
              disabled={isPending}
              placeholder="Opsionale"
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase text-slate-950 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Duke kërkuar...
            </>
          ) : (
            <>
              <Search size={17} />
              Kërko
            </>
          )}
        </button>

        {state.message ? (
          <p className="mt-4 text-sm font-semibold text-slate-600">
            {state.message}
          </p>
        ) : null}
      </form>

      {state.vehicles?.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {state.vehicles.map((vehicle) => {
            const title = [vehicle.brand, vehicle.model]
              .filter(Boolean)
              .join(" ");

            return (
              <article
                key={vehicle.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <CarFront size={22} />
                  </div>

                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black tracking-wider text-slate-950">
                    {vehicle.plate}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {title || vehicle.brand}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {vehicle.year || "Viti i papërcaktuar"}
                </p>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Building2 size={17} className="text-blue-600" />
                    {vehicle.business.name}
                  </div>

                  {vehicle.business.city || vehicle.business.address ? (
                    <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
                      <MapPin size={15} className="mt-0.5 shrink-0" />

                      <span>
                        {[vehicle.business.address, vehicle.business.city]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  ) : null}
                </div>

                <ClaimButton
                  customerVehicleId={customerVehicle.id}
                  vehicle={vehicle}
                />
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
