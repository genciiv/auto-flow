"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import { submitBusinessApplicationAction } from "@/app/apply/actions";

const initialState = {
  success: false,
  message: "",
  fieldErrors: {},
};

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  error,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
        }`}
      />

      {error ? (
        <span className="mt-2 block text-xs font-medium text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default function BusinessApplicationForm() {
  const formRef = useRef(null);

  const [state, formAction, isPending] = useActionState(
    submitBusinessApplicationAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Building2 size={22} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Apliko për AutoFlow
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Plotëso informacionet e biznesit.
          </p>
        </div>
      </div>

      {state.message ? (
        <div
          className={`mt-6 rounded-2xl border p-4 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-start gap-3">
            {state.success ? (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            ) : null}

            <p className="font-medium">{state.message}</p>
          </div>
        </div>
      ) : null}

      <form ref={formRef} action={formAction} className="mt-7 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Emri i biznesit"
            name="businessName"
            placeholder="Auto Service Fier"
            required
            error={state.fieldErrors?.businessName}
          />

          <FormField
            label="Emri i pronarit"
            name="ownerName"
            placeholder="Arben Hoxha"
            required
            error={state.fieldErrors?.ownerName}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="owner@business.al"
            required
            error={state.fieldErrors?.email}
          />

          <FormField
            label="Telefon"
            name="phone"
            type="tel"
            placeholder="+355 69 000 0000"
            required
            error={state.fieldErrors?.phone}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Qyteti"
            name="city"
            placeholder="Fier"
            required
            error={state.fieldErrors?.city}
          />

          <FormField
            label="Adresa"
            name="address"
            placeholder="Lagjja, rruga..."
          />
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Informacion shtesë
          </span>

          <textarea
            name="notes"
            rows={5}
            placeholder="Na trego shkurt për biznesin, numrin e punonjësve ose nevojat e tua..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Duke dërguar...
            </>
          ) : (
            <>
              Dërgo aplikimin
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-xs leading-5 text-slate-500">
          Duke aplikuar, pranon që AutoFlow të kontaktojë për aktivizimin e
          llogarisë.
        </p>
      </form>
    </div>
  );
}
