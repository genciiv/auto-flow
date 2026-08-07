"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  Banknote,
  CalendarDays,
  Gauge,
  LoaderCircle,
  NotebookPen,
  Plus,
  ReceiptText,
} from "lucide-react";

import {
  addCustomerVehicleMileage,
  createCustomerVehicleExpense,
} from "@/app/customer/vehicles/history-actions";
import ActionFeedback from "@/components/feedback/ActionFeedback";
import { CUSTOMER_VEHICLE_EXPENSE_OPTIONS } from "@/config/customer-vehicle-history";

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

function MileageForm({ vehicleId, currentMileage, defaultDate }) {
  const formRef = useRef(null);
  const [state, formAction, isPending] = useActionState(
    addCustomerVehicleMileage,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <ActionFeedback state={state} successTitle="Kilometrazhi u ruajt" />
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <FormMessage state={state} />

      <div>
        <label
          htmlFor="history-mileage"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Kilometrazhi i ri
        </label>
        <div className="relative">
          <Gauge
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="history-mileage"
            name="mileage"
            type="number"
            min={currentMileage === null || currentMileage === undefined ? 0 : currentMileage + 1}
            max="5000000"
            step="1"
            placeholder={
              currentMileage === null || currentMileage === undefined
                ? "P.sh. 145000"
                : `Më shumë se ${currentMileage}`
            }
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            km
          </span>
        </div>
        <FieldError message={state.errors?.mileage} />
      </div>

      <div>
        <label
          htmlFor="history-recorded-at"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Data
        </label>
        <div className="relative">
          <CalendarDays
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="history-recorded-at"
            name="recordedAt"
            type="date"
            defaultValue={defaultDate}
            max={defaultDate}
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>
        <FieldError message={state.errors?.recordedAt} />
      </div>

      <div>
        <label
          htmlFor="history-mileage-notes"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Shënim <span className="font-medium text-slate-400">(opsional)</span>
        </label>
        <div className="relative">
          <NotebookPen
            size={18}
            className="pointer-events-none absolute left-4 top-4 text-slate-400"
          />
          <textarea
            id="history-mileage-notes"
            name="notes"
            rows={3}
            placeholder="P.sh. Lexuar në panelin e automjetit"
            disabled={isPending}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>
        <FieldError message={state.errors?.notes} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <LoaderCircle size={17} className="animate-spin" />
            Duke ruajtur...
          </>
        ) : (
          <>
            <Plus size={17} />
            Regjistro kilometrat
          </>
        )}
      </button>
    </form>
  );
}

function ExpenseForm({ vehicleId, defaultDate }) {
  const formRef = useRef(null);
  const [state, formAction, isPending] = useActionState(
    createCustomerVehicleExpense,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <ActionFeedback state={state} successTitle="Shpenzimi u shtua" />
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <FormMessage state={state} />

      <div>
        <label
          htmlFor="expense-type"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Kategoria
        </label>
        <div className="relative">
          <ReceiptText
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            id="expense-type"
            name="type"
            defaultValue="FUEL"
            disabled={isPending}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            {CUSTOMER_VEHICLE_EXPENSE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <FieldError message={state.errors?.type} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="expense-amount"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Shuma
          </label>
          <div className="relative">
            <Banknote
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="expense-amount"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="P.sh. 5000"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              ALL
            </span>
          </div>
          <FieldError message={state.errors?.amount} />
        </div>

        <div>
          <label
            htmlFor="expense-date"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Data
          </label>
          <input
            id="expense-date"
            name="occurredAt"
            type="date"
            defaultValue={defaultDate}
            max={defaultDate}
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <FieldError message={state.errors?.occurredAt} />
        </div>
      </div>

      <div>
        <label
          htmlFor="expense-mileage"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Kilometrazhi <span className="font-medium text-slate-400">(opsional)</span>
        </label>
        <div className="relative">
          <Gauge
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="expense-mileage"
            name="mileage"
            type="number"
            min="0"
            max="5000000"
            step="1"
            placeholder="Kilometrat kur ndodhi shpenzimi"
            disabled={isPending}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            km
          </span>
        </div>
        <FieldError message={state.errors?.mileage} />
      </div>

      <div>
        <label
          htmlFor="expense-notes"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Përshkrimi <span className="font-medium text-slate-400">(opsional)</span>
        </label>
        <textarea
          id="expense-notes"
          name="notes"
          rows={3}
          placeholder="P.sh. Siguracion vjetor ose goma dimërore"
          disabled={isPending}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <FieldError message={state.errors?.notes} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <LoaderCircle size={17} className="animate-spin" />
            Duke ruajtur...
          </>
        ) : (
          <>
            <Plus size={17} />
            Shto shpenzimin
          </>
        )}
      </button>
    </form>
  );
}

export default function CustomerVehicleHistoryForms({
  vehicleId,
  currentMileage,
  defaultDate,
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Gauge size={20} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">
            Përditëso kilometrat
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Çdo përditësim ruhet si pjesë e historikut të automjetit.
          </p>
        </div>
        <MileageForm
          vehicleId={vehicleId}
          currentMileage={currentMileage}
          defaultDate={defaultDate}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ReceiptText size={20} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">
            Shto shpenzim personal
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Regjistro karburant, siguracion, goma, taksa dhe shpenzime të tjera.
          </p>
        </div>
        <ExpenseForm vehicleId={vehicleId} defaultDate={defaultDate} />
      </section>
    </div>
  );
}
