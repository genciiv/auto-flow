"use client";

import { useActionState, useState } from "react";
import {
  Check,
  Loader2,
  MessageSquareWarning,
  X,
} from "lucide-react";

import ActionFeedback from "@/components/feedback/ActionFeedback";

const initialState = {
  success: false,
  message: "",
};

export default function VehicleClaimActions({
  claimId,
  approveAction,
  rejectAction,
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);

  const [approveState, approveFormAction, approvePending] = useActionState(
    approveAction,
    initialState,
  );

  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectAction,
    initialState,
  );

  return (
    <div className="space-y-3">
      <ActionFeedback state={approveState} />
      <ActionFeedback state={rejectState} />

      {!showRejectForm ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <form action={approveFormAction}>
            <input type="hidden" name="claimId" value={claimId} />

            <button
              type="submit"
              disabled={approvePending || rejectPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {approvePending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Check size={17} />
              )}
              Aprovo
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowRejectForm(true)}
            disabled={approvePending || rejectPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <X size={17} />
            Refuzo
          </button>
        </div>
      ) : (
        <form
          action={rejectFormAction}
          className="rounded-2xl border border-red-100 bg-red-50/60 p-4"
        >
          <input type="hidden" name="claimId" value={claimId} />

          <div className="flex items-center gap-2 text-sm font-bold text-red-800">
            <MessageSquareWarning size={17} />
            Arsyeja e refuzimit
          </div>

          <textarea
            name="rejectionReason"
            rows={3}
            required
            maxLength={500}
            placeholder="Shkruaj pse nuk mund të aprovohet kjo kërkesë..."
            className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100"
          />

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={rejectPending || approvePending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rejectPending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <X size={17} />
              )}
              Konfirmo refuzimin
            </button>

            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              disabled={rejectPending}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Anulo
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
