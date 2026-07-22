"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  ArrowRight,
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
    <form action={formAction} className="mt-8 space-y-5">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.error}
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
        onToggle={() => setPasswordVisible((previous) => !previous)}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Konfirmo password-in"
        placeholder="Shkruaj përsëri password-in"
        autoComplete="new-password"
        visible={confirmPasswordVisible}
        onToggle={() => setConfirmPasswordVisible((previous) => !previous)}
      />

      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-xs leading-5 text-slate-500">
          Duke krijuar llogarinë, pranon kushtet e përdorimit dhe politikën e
          privatësisë së AutoFlow.
        </p>
      </div>

      <SubmitButton />

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
  );
}
