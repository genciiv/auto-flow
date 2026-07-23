"use client";

import { useActionState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import { updateCustomerProfile } from "@/app/customer/profile/actions";

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

export default function CustomerProfileForm({ user, profile }) {
  const [state, formAction, isPending] = useActionState(
    updateCustomerProfile,
    initialState,
  );

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
            htmlFor="firstName"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Emri <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <UserRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="firstName"
              name="firstName"
              type="text"
              defaultValue={profile.firstName || ""}
              placeholder="Shkruaj emrin"
              autoComplete="given-name"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.firstName} />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Mbiemri <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <UserRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="lastName"
              name="lastName"
              type="text"
              defaultValue={profile.lastName || ""}
              placeholder="Shkruaj mbiemrin"
              autoComplete="family-name"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.lastName} />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Telefoni
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone || user.phone || ""}
              placeholder="+355 69 000 0000"
              autoComplete="tel"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.phone} />
        </div>

        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Qyteti
          </label>

          <div className="relative">
            <MapPin
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="city"
              name="city"
              type="text"
              defaultValue={profile.city || ""}
              placeholder="P.sh. Fier"
              autoComplete="address-level2"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.city} />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Adresa
          </label>

          <div className="relative">
            <MapPin
              size={18}
              className="pointer-events-none absolute left-4 top-4 text-slate-400"
            />

            <textarea
              id="address"
              name="address"
              defaultValue={profile.address || ""}
              placeholder="Shkruaj adresën e plotë"
              autoComplete="street-address"
              rows={4}
              disabled={isPending}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.address} />
        </div>

        <div>
          <label
            htmlFor="birthDate"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Datëlindja
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={
                profile.birthDate
                  ? new Date(profile.birthDate).toISOString().slice(0, 10)
                  : ""
              }
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <FieldError message={state.errors?.birthDate} />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={user.email || ""}
            disabled
            className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 outline-none"
          />

          <p className="mt-1.5 text-xs text-slate-500">
            Email-i i llogarisë nuk ndryshohet nga kjo faqe.
          </p>
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
              Ruaj ndryshimet
            </>
          )}
        </button>
      </div>
    </form>
  );
}
