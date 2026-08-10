"use client";

import ActionFeedback from "@/components/feedback/ActionFeedback";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { registerAction } from "./actions";

const initialState = {
  error: null,
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Duke krijuar llogarinë...
        </>
      ) : (
        <>
          Krijo llogarinë
          <ArrowRight className="size-4" />
        </>
      )}
    </button>
  );
}

function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  visible,
  onToggle,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={8}
          maxLength={100}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Fshih password-in" : "Shfaq password-in"}
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  return (
    <div className="mt-8">
      <GoogleAuthButton label="Regjistrohu me Google" />

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          ose me email
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-5">
      <ActionFeedback state={state} />
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
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />

            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Emri dhe mbiemri
        </label>

        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="P.sh. Genci Vaqo"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={150}
            autoComplete="email"
            placeholder="emri@email.com"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Numri i telefonit
          <span className="ml-1 text-xs font-normal text-slate-400">
            (opsional)
          </span>
        </label>

        <div className="relative">
          <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            autoComplete="tel"
            placeholder="+355 69 000 0000"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Të paktën 8 karaktere"
        autoComplete="new-password"
        visible={passwordVisible}
        onToggle={() => setPasswordVisible((previousValue) => !previousValue)}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Konfirmo password-in"
        placeholder="Shkruaj përsëri password-in"
        autoComplete="new-password"
        visible={confirmPasswordVisible}
        onToggle={() =>
          setConfirmPasswordVisible((previousValue) => !previousValue)
        }
      />

      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-xs leading-5 text-slate-500">
          Duke krijuar llogarinë, pranon kushtet e përdorimit dhe politikën e
          privatësisë së AutoFlow.
        </p>
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-slate-500">
        E ke krijuar llogarinë, por nuk të erdhi email-i?{" "}
        <Link
          href="/resend-verification"
          className="font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Ridërgoje
        </Link>
      </p>

      <p className="text-center text-sm text-slate-500">
        Ke tashmë një llogari?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Hyr këtu
        </Link>
      </p>
      </form>
    </div>
  );
}
