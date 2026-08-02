"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";

import { requestSubscriptionPlanAction } from "./actions";

const initialState = {
  success: false,
  error: null,
  message: null,
  data: null,
};

export default function PlanRequestButton({ planId, planName }) {
  const [state, formAction, isPending] = useActionState(
    requestSubscriptionPlanAction,
    initialState,
  );

  return (
    <div className="mt-6">
      {state.success ? (
        <div
          role="status"
          className="mb-3 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      {state.error ? (
        <div
          role="alert"
          className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      <form action={formAction}>
        <input type="hidden" name="planId" value={planId} />

        <button
          type="submit"
          disabled={isPending || state.success}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Duke dërguar...
            </>
          ) : state.success ? (
            "Kërkesa u dërgua"
          ) : (
            `Kërko planin ${planName}`
          )}
        </button>
      </form>
    </div>
  );
}
