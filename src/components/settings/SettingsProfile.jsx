"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  LockKeyhole,
  UserRound,
  XCircle,
} from "lucide-react";

import { updateProfileSettings } from "@/actions/settings-actions";

export default function SettingsProfile({ profile, canUpdate = false }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(formData) {
    if (!canUpdate || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const result = await updateProfileSettings(formData);

      if (!result?.success) {
        setError(result?.message || "Profili nuk mund të përditësohej.");

        return;
      }

      setMessage(result.message || "Profili u përditësua me sukses.");
    } catch (submitError) {
      console.error(submitError);

      setError("Ndodhi një gabim gjatë ruajtjes së profilit.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-950">Profili</h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Informacionet personale të përdoruesit të identifikuar.
          </p>
        </div>

        {!canUpdate && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <LockKeyhole className="h-3.5 w-3.5" />
            Vetëm lexim
          </span>
        )}
      </div>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Emri i plotë
          </label>

          <input
            id="profile-name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={profile?.name || ""}
            disabled={!canUpdate || isSaving}
            placeholder="Emri dhe mbiemri"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>

          <input
            id="profile-email"
            name="email"
            type="email"
            required
            maxLength={190}
            defaultValue={profile?.email || ""}
            disabled={!canUpdate || isSaving}
            placeholder="emri@email.com"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Ndryshimi i email-it mund të kërkojë hyrje të re në llogari.
          </p>
        </div>

        <div>
          <label
            htmlFor="profile-phone"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Numri personal i telefonit
          </label>

          <input
            id="profile-phone"
            name="phone"
            type="tel"
            maxLength={30}
            defaultValue={profile?.phone || ""}
            disabled={!canUpdate || isSaving}
            placeholder="+355 69 000 0000"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

            <p className="text-sm font-medium text-emerald-700">{message}</p>
          </div>
        )}

        {canUpdate && (
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Duke ruajtur...
              </>
            ) : (
              "Ruaj ndryshimet"
            )}
          </button>
        )}
      </form>
    </section>
  );
}
