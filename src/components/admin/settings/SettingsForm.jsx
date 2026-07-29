"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  Banknote,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Mail,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { updateSettingsAction } from "@/app/admin/settings/actions";

function ToggleField({ name, title, description, defaultChecked, icon: Icon }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>

          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>

      <span className="relative mt-1 inline-flex shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />

        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100" />

        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required = false,
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <input
        type={type}
        name={name}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

export default function SettingsForm({ settings }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setMessage(null);

    startTransition(async () => {
      const result = await updateSettingsAction(formData);

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {message ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}

          <p className="font-medium">{message.text}</p>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Building2 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Informacioni i platformës
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Të dhënat kryesore të AutoFlow dhe kontaktet e suportit.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            label="Emri i platformës"
            name="platformName"
            defaultValue={settings.platformName}
            required
          />

          <TextField
            label="Email-i i suportit"
            name="supportEmail"
            type="email"
            defaultValue={settings.supportEmail}
            placeholder="support@autoflow.al"
          />

          <TextField
            label="Telefoni i suportit"
            name="supportPhone"
            defaultValue={settings.supportPhone}
            placeholder="+355 69 000 0000"
          />

          <TextField
            label="Adresa e kompanisë"
            name="companyAddress"
            defaultValue={settings.companyAddress}
            placeholder="Tiranë, Shqipëri"
          />

          <label>
            <span className="text-sm font-semibold text-slate-700">
              Monedha
            </span>

            <select
              name="defaultCurrency"
              defaultValue={settings.defaultCurrency}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">ALL – Lekë</option>
              <option value="EUR">EUR – Euro</option>
              <option value="USD">USD – Dollar</option>
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">
              Zona kohore
            </span>

            <select
              name="defaultTimezone"
              defaultValue={settings.defaultTimezone}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="Europe/Tirane">Europe/Tirane</option>

              <option value="Europe/Rome">Europe/Rome</option>
              <option value="Europe/London">Europe/London</option>

              <option value="UTC">UTC</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Clock3 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Konfigurimi i trial-it
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Kontrollo provën falas për bizneset e reja.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <ToggleField
            name="trialEnabled"
            title="Aktivizo trial-in falas"
            description="Bizneset e aprovuara marrin automatikisht një periudhë prove."
            defaultChecked={settings.trialEnabled}
            icon={Clock3}
          />

          <label>
            <span className="text-sm font-semibold text-slate-700">
              Kohëzgjatja e trial-it
            </span>

            <div className="relative mt-2">
              <input
                type="number"
                name="trialDurationDays"
                min="1"
                max="365"
                required
                defaultValue={settings.trialDurationDays}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-16 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ditë
              </span>
            </div>
          </label>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CreditCard size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Metodat e pagesës
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Zgjidh metodat që lejohen për regjistrimin e pagesave.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <ToggleField
            name="cashPaymentsEnabled"
            title="Pagesa Cash"
            description="Lejo pagesat fizike me para në dorë."
            defaultChecked={settings.cashPaymentsEnabled}
            icon={Banknote}
          />

          <ToggleField
            name="bankPaymentsEnabled"
            title="Transfertë bankare"
            description="Lejo pagesat përmes bankës."
            defaultChecked={settings.bankPaymentsEnabled}
            icon={Building2}
          />

          <ToggleField
            name="cardPaymentsEnabled"
            title="Pagesa me kartë"
            description="Aktivizo pagesat online me kartë."
            defaultChecked={settings.cardPaymentsEnabled}
            icon={CreditCard}
          />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            label="Emri i bankës"
            name="bankName"
            defaultValue={settings.bankName}
          />

          <TextField
            label="Emri i llogarisë"
            name="bankAccountName"
            defaultValue={settings.bankAccountName}
          />

          <TextField
            label="Numri i llogarisë"
            name="bankAccountNumber"
            defaultValue={settings.bankAccountNumber}
          />

          <TextField
            label="IBAN"
            name="bankIban"
            defaultValue={settings.bankIban}
          />

          <TextField
            label="SWIFT/BIC"
            name="bankSwiftCode"
            defaultValue={settings.bankSwiftCode}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Aksesi dhe mirëmbajtja
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Kontrollo regjistrimet dhe disponueshmërinë e platformës.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ToggleField
            name="allowRegistrations"
            title="Lejo regjistrimet"
            description="Lejo bizneset e reja të dërgojnë aplikime."
            defaultChecked={settings.allowRegistrations}
            icon={Mail}
          />

          <ToggleField
            name="maintenanceMode"
            title="Maintenance mode"
            description="Vendos platformën në modalitet mirëmbajtjeje."
            defaultChecked={settings.maintenanceMode}
            icon={Settings2}
          />
        </div>
      </section>

      <div className="sticky bottom-5 z-20 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Ruaj konfigurimet
        </button>
      </div>
    </form>
  );
}
