"use client";

import ActionFeedback from "@/components/feedback/ActionFeedback";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import { activateAccountAction } from "./actions";

const initialState = {
  error: null,
  success: false,
  message: null,
};

function PasswordField({
  id,
  name,
  label,
  placeholder,
  visible,
  onToggle,
  disabled,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
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
          autoComplete="new-password"
          disabled={disabled}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={visible ? "Fshih password-in" : "Shfaq password-in"}
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ActivateAccountForm({ token }) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);

  const [state, formAction, isPending] = useActionState(
    activateAccountAction,
    initialState,
  );

  if (state?.success) {
    return (
      <div className="mt-8">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />

          <p className="text-sm leading-6">{state.message}</p>
        </div>

        <Link
          href="/login"
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Hyr në AutoFlow
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <ActionFeedback state={state} />
      <input type="hidden" name="token" value={token} />

      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Të paktën 8 karaktere"
        visible={passwordVisible}
        onToggle={() => setPasswordVisible((current) => !current)}
        disabled={isPending}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Konfirmo password-in"
        placeholder="Shkruaj përsëri password-in"
        visible={confirmVisible}
        onToggle={() => setConfirmVisible((current) => !current)}
        disabled={isPending}
      />

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
      >
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Duke aktivizuar...
          </>
        ) : (
          "Aktivizo llogarinë"
        )}
      </button>
    </form>
  );
}
