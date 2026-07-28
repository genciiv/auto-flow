"use client";

import { useActionState, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Send,
} from "lucide-react";

import { requestEmailChangeAction } from "@/app/customer/profile/change-email-actions";

const initialState = {
  error: null,
  success: false,
  message: null,
};

export default function CustomerChangeEmailForm({ currentEmail }) {
  const [state, formAction, isPending] = useActionState(
    requestEmailChangeAction,
    initialState,
  );

  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      {state?.success && state?.message ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Email-i aktual
        </label>

        <input
          type="email"
          value={currentEmail}
          disabled
          className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500"
        />
      </div>

      <div>
        <label
          htmlFor="newEmail"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Email-i i ri
        </label>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            id="newEmail"
            name="newEmail"
            type="email"
            required
            maxLength={150}
            autoComplete="email"
            disabled={isPending}
            placeholder="emaili-ri@example.com"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="currentPasswordEmail"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Password-i aktual
        </label>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            id="currentPasswordEmail"
            name="currentPassword"
            type={passwordVisible ? "text" : "password"}
            required
            maxLength={100}
            autoComplete="current-password"
            disabled={isPending}
            placeholder="Konfirmo identitetin tënd"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            disabled={isPending}
            aria-label={
              passwordVisible ? "Fshih password-in" : "Shfaq password-in"
            }
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
          >
            {passwordVisible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Duke dërguar...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Dërgo linkun e konfirmimit
          </>
        )}
      </button>
    </form>
  );
}
