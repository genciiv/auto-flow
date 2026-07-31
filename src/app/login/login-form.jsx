"use client";

import ActionFeedback from "@/components/feedback/ActionFeedback";

import { useActionState, useState } from "react";

import Link from "next/link";

import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { loginAction } from "./actions";

const initialState = {
  error: null,
  code: null,
  email: null,
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  const feedback = <ActionFeedback state={state} />;

  return (
    <>
      {feedback}
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
          />

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="owner@autoflow.al"
            required
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Harrove password-in?
          </Link>
        </div>

        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
          />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Shkruaj password-in"
            required
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <button
            type="button"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            disabled={isPending}
            aria-label={
              showPassword ? "Fshih password-in" : "Shfaq password-in"
            }
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>
      </div>

      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />

            <p>{state.error}</p>
          </div>
        </div>
      ) : null}

      {state?.code === "EMAIL_NOT_VERIFIED" ? (
        <Link
          href={`/resend-verification?email=${encodeURIComponent(
            state.email ?? "",
          )}`}
          className="block rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          Ridërgo email-in e verifikimit
        </Link>
      ) : null}

      <div className="text-right">
        <Link
          href="/resend-verification"
          className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Nuk e ke verifikuar email-in?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            Duke u identifikuar...
          </>
        ) : (
          "Hyr në AutoFlow"
        )}
      </button>
    </form>
    </>
  );
}
