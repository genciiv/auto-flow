"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  XCircle,
} from "lucide-react";

import { updateBusinessSettings } from "@/actions/settings-actions";

export default function SettingsBusiness({ business, canUpdate = false }) {
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

      const result = await updateBusinessSettings(formData);

      if (!result?.success) {
        setError(
          result?.message ||
            "Të dhënat e biznesit nuk mund të përditësoheshin.",
        );

        return;
      }

      setMessage(
        result.message || "Të dhënat e biznesit u përditësuan me sukses.",
      );
    } catch (submitError) {
      console.error(submitError);

      setError("Ndodhi një gabim gjatë përditësimit të biznesit.");
    } finally {
      setIsSaving(false);
    }
  }

  const isDisabled = !canUpdate || isSaving;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Building2 className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-950">Biznesi</h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Të dhënat fiskale, kontaktet dhe preferencat e servisit.
          </p>
        </div>

        {!canUpdate && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <LockKeyhole className="h-3.5 w-3.5" />
            Vetëm lexim
          </span>
        )}
      </div>

      <form action={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="business-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Emri i biznesit
            </label>

            <input
              id="business-name"
              name="name"
              required
              minLength={2}
              maxLength={150}
              defaultValue={business?.name || ""}
              disabled={isDisabled}
              placeholder="Auto Service Fier"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="business-nipt"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              NIPT
            </label>

            <input
              id="business-nipt"
              name="nipt"
              maxLength={30}
              defaultValue={business?.nipt || ""}
              disabled={isDisabled}
              placeholder="L00000000A"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="business-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email i biznesit
            </label>

            <input
              id="business-email"
              name="email"
              type="email"
              maxLength={190}
              defaultValue={business?.email || ""}
              disabled={isDisabled}
              placeholder="info@autoservice.al"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="business-phone"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Telefoni i biznesit
            </label>

            <input
              id="business-phone"
              name="phone"
              type="tel"
              maxLength={30}
              defaultValue={business?.phone || ""}
              disabled={isDisabled}
              placeholder="+355 69 000 0000"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="business-city"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Qyteti
            </label>

            <input
              id="business-city"
              name="city"
              maxLength={100}
              defaultValue={business?.city || ""}
              disabled={isDisabled}
              placeholder="Fier"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="business-address"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Adresa
            </label>

            <input
              id="business-address"
              name="address"
              maxLength={250}
              defaultValue={business?.address || ""}
              disabled={isDisabled}
              placeholder="Rruga, numri, zona"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="business-website"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Website
            </label>

            <input
              id="business-website"
              name="website"
              type="url"
              defaultValue={business?.website || ""}
              disabled={isDisabled}
              placeholder="https://autoservice.al"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="business-logo"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Linku i logos
            </label>

            <input
              id="business-logo"
              name="logo"
              type="url"
              defaultValue={business?.logo || ""}
              disabled={isDisabled}
              placeholder="https://..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="business-working-hours"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Orari i punës
            </label>

            <textarea
              id="business-working-hours"
              name="workingHours"
              rows={3}
              maxLength={500}
              defaultValue={business?.workingHours || ""}
              disabled={isDisabled}
              placeholder="Hënë - Shtunë, 08:00 - 18:00"
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="business-currency"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Monedha
            </label>

            <select
              id="business-currency"
              name="currency"
              defaultValue={business?.currency || "ALL"}
              disabled={isDisabled}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="ALL">Lekë shqiptare — ALL</option>
              <option value="EUR">Euro — EUR</option>
              <option value="USD">Dollar amerikan — USD</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="business-vat"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              TVSH (%)
            </label>

            <input
              id="business-vat"
              name="vat"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={business?.vat ?? 20}
              disabled={isDisabled}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="business-timezone"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Zona kohore
            </label>

            <select
              id="business-timezone"
              name="timezone"
              defaultValue={business?.timezone || "Europe/Tirane"}
              disabled={isDisabled}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="Europe/Tirane">Europe/Tirane — Shqipëri</option>

              <option value="Europe/Rome">Europe/Rome — Itali</option>

              <option value="Europe/Berlin">Europe/Berlin — Gjermani</option>

              <option value="Europe/London">
                Europe/London — Mbretëri e Bashkuar
              </option>
            </select>
          </div>
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Duke përditësuar...
              </>
            ) : (
              "Përditëso biznesin"
            )}
          </button>
        )}
      </form>
    </section>
  );
}
