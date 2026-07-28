"use client";

import { useActionState, useState } from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { changePasswordAction } from "@/app/customer/profile/change-password-actions";

const initialState = {
  error: null,
  success: false,
};

function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
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
          minLength={name === "currentPassword" ? undefined : 8}
          maxLength={100}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={visible ? "Fshih password-in" : "Shfaq password-in"}
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export default function CustomerChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  const [currentVisible, setCurrentVisible] = useState(false);
  const [newVisible, setNewVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

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

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-600" />

          <p className="text-xs leading-6 text-slate-600">
            Pas ndryshimit të password-it do të dalësh nga të gjitha pajisjet
            dhe duhet të hysh përsëri me password-in e ri.
          </p>
        </div>
      </div>

      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Password-i aktual"
        placeholder="Shkruaj password-in aktual"
        autoComplete="current-password"
        visible={currentVisible}
        onToggle={() => setCurrentVisible((current) => !current)}
        disabled={isPending}
      />

      <PasswordField
        id="newPassword"
        name="newPassword"
        label="Password-i i ri"
        placeholder="Të paktën 8 karaktere"
        autoComplete="new-password"
        visible={newVisible}
        onToggle={() => setNewVisible((current) => !current)}
        disabled={isPending}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Konfirmo password-in e ri"
        placeholder="Shkruaj përsëri password-in"
        autoComplete="new-password"
        visible={confirmVisible}
        onToggle={() => setConfirmVisible((current) => !current)}
        disabled={isPending}
      />

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Duke ndryshuar...
          </>
        ) : (
          <>
            <LockKeyhole className="size-4" />
            Ndrysho password-in
          </>
        )}
      </button>
    </form>
  );
}
