"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  Gauge,
  LoaderCircle,
  NotebookPen,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import {
  createCustomerVehicleMaintenance,
  createCustomerVehicleReminder,
} from "@/app/customer/vehicles/maintenance-actions";
import ActionFeedback from "@/components/feedback/ActionFeedback";
import {
  CUSTOMER_VEHICLE_MAINTENANCE_OPTIONS,
  CUSTOMER_VEHICLE_REMINDER_OPTIONS,
} from "@/config/customer-vehicle-maintenance";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

function FormMessage({ state }) {
  if (!state?.message) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
        state.success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </div>
  );
}

function MaintenanceForm({ vehicleId, currentMileage, defaultDate }) {
  const formRef = useRef(null);
  const [state, formAction, isPending] = useActionState(
    createCustomerVehicleMaintenance,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <ActionFeedback state={state} successTitle="Mirëmbajtja u ruajt" />
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <FormMessage state={state} />

      <div>
        <label htmlFor="maintenance-type" className="mb-2 block text-sm font-bold text-slate-800">
          Lloji i mirëmbajtjes
        </label>
        <div className="relative">
          <Wrench size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            id="maintenance-type"
            name="type"
            defaultValue="ENGINE_OIL"
            disabled={isPending}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            {CUSTOMER_VEHICLE_MAINTENANCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <FieldError message={state.errors?.type} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="maintenance-date" className="mb-2 block text-sm font-bold text-slate-800">
            Data kur u krye
          </label>
          <div className="relative">
            <CalendarDays size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="maintenance-date"
              name="performedAt"
              type="date"
              defaultValue={defaultDate}
              max={defaultDate}
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
          <FieldError message={state.errors?.performedAt} />
        </div>

        <div>
          <label htmlFor="maintenance-mileage" className="mb-2 block text-sm font-bold text-slate-800">
            Kilometrat <span className="font-medium text-slate-400">(opsional)</span>
          </label>
          <div className="relative">
            <Gauge size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="maintenance-mileage"
              name="mileage"
              type="number"
              min="0"
              max={currentMileage ?? 5000000}
              step="1"
              defaultValue={currentMileage ?? ""}
              placeholder="P.sh. 145000"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">km</span>
          </div>
          <FieldError message={state.errors?.mileage} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="maintenance-interval-km" className="mb-2 block text-sm font-bold text-slate-800">
            Përsërite pas <span className="font-medium text-slate-400">(km)</span>
          </label>
          <input
            id="maintenance-interval-km"
            name="intervalKm"
            type="number"
            min="100"
            max="200000"
            step="100"
            placeholder="P.sh. 10000"
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <FieldError message={state.errors?.intervalKm} />
        </div>

        <div>
          <label htmlFor="maintenance-interval-months" className="mb-2 block text-sm font-bold text-slate-800">
            Përsërite pas <span className="font-medium text-slate-400">(muaj)</span>
          </label>
          <input
            id="maintenance-interval-months"
            name="intervalMonths"
            type="number"
            min="1"
            max="120"
            step="1"
            placeholder="P.sh. 12"
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <FieldError message={state.errors?.intervalMonths} />
        </div>
      </div>

      <div>
        <label htmlFor="maintenance-notes" className="mb-2 block text-sm font-bold text-slate-800">
          Shënim <span className="font-medium text-slate-400">(opsional)</span>
        </label>
        <div className="relative">
          <NotebookPen size={18} className="pointer-events-none absolute left-4 top-4 text-slate-400" />
          <textarea
            id="maintenance-notes"
            name="notes"
            rows={3}
            placeholder="P.sh. Vaj 5W-30 dhe filtër i ri"
            disabled={isPending}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>
        <FieldError message={state.errors?.notes} />
      </div>

      <button type="submit" disabled={isPending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? <><LoaderCircle size={17} className="animate-spin" />Duke ruajtur...</> : <><Plus size={17} />Shto mirëmbajtjen</>}
      </button>
    </form>
  );
}

function ReminderForm({ vehicleId, currentMileage }) {
  const formRef = useRef(null);
  const [state, formAction, isPending] = useActionState(
    createCustomerVehicleReminder,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <ActionFeedback state={state} successTitle="Kujtesa u ruajt" />
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <FormMessage state={state} />

      <div>
        <label htmlFor="reminder-type" className="mb-2 block text-sm font-bold text-slate-800">
          Lloji i kujtesës
        </label>
        <div className="relative">
          <ShieldCheck size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            id="reminder-type"
            name="type"
            defaultValue="INSURANCE"
            disabled={isPending}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            {CUSTOMER_VEHICLE_REMINDER_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <FieldError message={state.errors?.type} />
      </div>

      <div>
        <label htmlFor="reminder-title" className="mb-2 block text-sm font-bold text-slate-800">
          Titulli <span className="font-medium text-slate-400">(vetëm për kujtesë tjetër)</span>
        </label>
        <input
          id="reminder-title"
          name="title"
          type="text"
          maxLength={120}
          placeholder="P.sh. Ndërrimi i gomave dimërore"
          disabled={isPending}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <FieldError message={state.errors?.title} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reminder-date" className="mb-2 block text-sm font-bold text-slate-800">
            Data e afatit <span className="font-medium text-slate-400">(opsional)</span>
          </label>
          <div className="relative">
            <CalendarClock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="reminder-date"
              name="dueDate"
              type="date"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
          <FieldError message={state.errors?.dueDate} />
        </div>

        <div>
          <label htmlFor="reminder-mileage" className="mb-2 block text-sm font-bold text-slate-800">
            Afati kilometrik <span className="font-medium text-slate-400">(opsional)</span>
          </label>
          <div className="relative">
            <Gauge size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="reminder-mileage"
              name="dueMileage"
              type="number"
              min={currentMileage ?? 0}
              max="5000000"
              step="1"
              placeholder={currentMileage ? `Mbi ${currentMileage}` : "P.sh. 160000"}
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">km</span>
          </div>
          <FieldError message={state.errors?.dueMileage} />
        </div>
      </div>

      <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
        Vendos të paktën një datë ose kilometrazh. Njoftimet me email/SMS do të lidhen me këto afate në një fazë të mëvonshme.
      </p>

      <div>
        <label htmlFor="reminder-notes" className="mb-2 block text-sm font-bold text-slate-800">
          Shënim <span className="font-medium text-slate-400">(opsional)</span>
        </label>
        <textarea
          id="reminder-notes"
          name="notes"
          rows={3}
          placeholder="P.sh. Polica aktuale skadon në këtë datë"
          disabled={isPending}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <FieldError message={state.errors?.notes} />
      </div>

      <button type="submit" disabled={isPending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? <><LoaderCircle size={17} className="animate-spin" />Duke ruajtur...</> : <><BellRing size={17} />Ruaj kujtesën</>}
      </button>
    </form>
  );
}

export default function CustomerVehicleMaintenanceForms({
  vehicleId,
  currentMileage,
  defaultDate,
}) {
  return (
    <section id="mirembajtja" className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-blue-600">
          <CalendarClock size={17} />
          <p className="text-xs font-black uppercase tracking-[0.16em]">Maintenance & reminders</p>
        </div>
        <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Mirëmbajtja dhe afatet</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Regjistro çfarë është kryer dhe vendos afatet që dëshiron të ndjekësh për automjetin.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white"><Wrench size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Regjistro mirëmbajtje</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">Ruaj vajin, filtrat, frenat, gomat dhe ndërhyrje të tjera.</p>
            </div>
          </div>
          <MaintenanceForm vehicleId={vehicleId} currentMileage={currentMileage} defaultDate={defaultDate} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><BellRing size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Shto kujtesë</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">Ndiq siguracionin, kontrollin teknik, taksat ose një afat personal.</p>
            </div>
          </div>
          <ReminderForm vehicleId={vehicleId} currentMileage={currentMileage} />
        </div>
      </div>
    </section>
  );
}
