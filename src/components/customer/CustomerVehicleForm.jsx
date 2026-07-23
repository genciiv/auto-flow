"use client";

import { useActionState } from "react";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Fuel,
  Gauge,
  LoaderCircle,
  Palette,
  Save,
  Settings2,
} from "lucide-react";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

export default function CustomerVehicleForm({
  action,
  vehicle = null,
  submitLabel = "Ruaj automjetin",
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          ) : null}

          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="plate"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Targa <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <CarFront
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="plate"
              name="plate"
              type="text"
              defaultValue={vehicle?.plate || ""}
              placeholder="AA123BB"
              disabled={isPending}
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold uppercase text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.plate} />
        </div>

        <div>
          <label
            htmlFor="brand"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Marka <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <CarFront
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="brand"
              name="brand"
              type="text"
              defaultValue={vehicle?.brand || ""}
              placeholder="P.sh. Volkswagen"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.brand} />
        </div>

        <div>
          <label
            htmlFor="model"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Modeli
          </label>

          <input
            id="model"
            name="model"
            type="text"
            defaultValue={vehicle?.model || ""}
            placeholder="P.sh. Jetta"
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <FieldError message={state.errors?.model} />
        </div>

        <div>
          <label
            htmlFor="year"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Viti
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="year"
              name="year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              defaultValue={vehicle?.year ?? ""}
              placeholder="P.sh. 2018"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.year} />
        </div>

        <div>
          <label
            htmlFor="fuel"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Karburanti
          </label>

          <div className="relative">
            <Fuel
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="fuel"
              name="fuel"
              defaultValue={vehicle?.fuel || ""}
              disabled={isPending}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">Zgjidh karburantin</option>
              <option value="Benzinë">Benzinë</option>
              <option value="Naftë">Naftë</option>
              <option value="Benzinë / Gaz">Benzinë / Gaz</option>
              <option value="Hibrid">Hibrid</option>
              <option value="Elektrik">Elektrik</option>
              <option value="Tjetër">Tjetër</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="transmission"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Kambio
          </label>

          <div className="relative">
            <Settings2
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="transmission"
              name="transmission"
              defaultValue={vehicle?.transmission || ""}
              disabled={isPending}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">Zgjidh kambion</option>
              <option value="Manuale">Manuale</option>
              <option value="Automatike">Automatike</option>
              <option value="Gjysmë automatike">Gjysmë automatike</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="engine"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Motori
          </label>

          <input
            id="engine"
            name="engine"
            type="text"
            defaultValue={vehicle?.engine || ""}
            placeholder="P.sh. 2.0 TDI"
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <FieldError message={state.errors?.engine} />
        </div>

        <div>
          <label
            htmlFor="mileage"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Kilometrat
          </label>

          <div className="relative">
            <Gauge
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="mileage"
              name="mileage"
              type="number"
              min="0"
              defaultValue={vehicle?.mileage ?? ""}
              placeholder="P.sh. 145000"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              km
            </span>
          </div>

          <FieldError message={state.errors?.mileage} />
        </div>

        <div>
          <label
            htmlFor="color"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Ngjyra
          </label>

          <div className="relative">
            <Palette
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="color"
              name="color"
              type="text"
              defaultValue={vehicle?.color || ""}
              placeholder="P.sh. E zezë"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.color} />
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
            defaultValue={vehicle?.vin || ""}
            placeholder="Numri i shasisë"
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-950 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <FieldError message={state.errors?.vin} />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Shënime
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={vehicle?.notes || ""}
            placeholder="Informacione shtesë për automjetin..."
            disabled={isPending}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <FieldError message={state.errors?.notes} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Fushat me yll janë të detyrueshme.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Duke ruajtur...
            </>
          ) : (
            <>
              <Save size={17} />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
