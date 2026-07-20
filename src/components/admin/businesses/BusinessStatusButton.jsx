"use client";

import { useState, useTransition } from "react";
import { CircleOff, LoaderCircle, Power } from "lucide-react";

import { changeBusinessStatusAction } from "@/app/admin/businesses/actions";

export default function BusinessStatusButton({
  businessId,
  isActive,
  compact = false,
}) {
  const [currentStatus, setCurrentStatus] = useState(isActive);

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleStatusChange() {
    const nextStatus = !currentStatus;

    const confirmed = window.confirm(
      nextStatus
        ? "Dëshiron ta aktivizosh këtë biznes?"
        : "Dëshiron ta çaktivizosh këtë biznes?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        await changeBusinessStatusAction(businessId, nextStatus);

        setCurrentStatus(nextStatus);
      } catch (actionError) {
        console.error(actionError);

        setError("Statusi nuk mund të ndryshohej. Provo përsëri.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleStatusChange}
        disabled={isPending}
        className={`inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          compact
            ? "rounded-xl border border-slate-200 px-3 py-2 text-xs"
            : "rounded-2xl px-4 py-3 text-sm"
        } ${
          currentStatus
            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {isPending ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : currentStatus ? (
          <CircleOff size={16} />
        ) : (
          <Power size={16} />
        )}

        {isPending
          ? "Duke ruajtur..."
          : currentStatus
            ? "Çaktivizo"
            : "Aktivizo"}
      </button>

      {error ? (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
