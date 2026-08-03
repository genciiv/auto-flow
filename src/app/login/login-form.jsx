"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import ActionFeedback from "@/components/feedback/ActionFeedback";

import { loginAction } from "./actions";

const initialState = {
  error: null,
  code: null,
  email: null,
};

const portals = [
  {
    value: "personal",
    label: "Login Personal",
    description: "Për klientë dhe individë",
    icon: UserRound,
  },
  {
    value: "business",
    label: "Login Biznes",
    description: "Për pronarë dhe staf",
    icon: BriefcaseBusiness,
  },
];

export default function LoginForm({ callbackUrl = "" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [portalType, setPortalType] = useState("personal");
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <>
      <ActionFeedback state={state} />

      <div
        className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5"
        role="tablist"
        aria-label="Zgjidh portalin e hyrjes"
      >
        {portals.map((portal) => {
          const Icon = portal.icon;
          const active = portalType === portal.value;

          return (
            <button
              key={portal.value}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={isPending}
              onClick={() => setPortalType(portal.value)}
              className={`rounded-xl px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${
                active
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <Icon className="size-4" />
                {portal.label}
              </span>
              <span className="mt-1 block text-[11px] leading-4">
                {portal.description}
              </span>
            </button>
          );
        })}
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="portalType" value={portalType} />
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

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
              placeholder={
                portalType === "business"
                  ? "biznesi@autoflow.al"
                  : "emri@email.com"
              }
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
          ) : portalType === "business" ? (
            "Hyr si biznes"
          ) : (
            "Hyr si individ"
          )}
        </button>
      </form>
    </>
  );
}
