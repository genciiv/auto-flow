"use client";

import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/ToastProvider";

import { useState, useTransition } from "react";
import { CircleOff, LoaderCircle, Power } from "lucide-react";

import { changeBusinessStatusAction } from "@/app/admin/businesses/actions";

export default function BusinessStatusButton({
  businessId,
  isActive,
  compact = false,
}) {
  const [currentStatus, setCurrentStatus] = useState(isActive);
  const { confirm } = useConfirm();
  const toast = useToast();

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleStatusChange() {
    const nextStatus = !currentStatus;

    const confirmed = await confirm({
      title: nextStatus ? "Aktivizo biznesin" : "Çaktivizo biznesin",
      description: nextStatus ? "Dëshiron ta aktivizosh këtë biznes?" : "Dëshiron ta çaktivizosh këtë biznes?",
      confirmLabel: nextStatus ? "Aktivizo" : "Çaktivizo",
      tone: nextStatus ? "warning" : "danger",
    });

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        const result = await changeBusinessStatusAction(businessId, nextStatus);

        if (result?.success === false) { throw new Error(result.message); }
        setCurrentStatus(result?.data?.isActive ?? result?.isActive ?? nextStatus);
        toast.success(result?.message || "Statusi u ndryshua me sukses.");
      } catch (actionError) {
        console.error(actionError);

        toast.error(actionError instanceof Error ? actionError.message : "Statusi nuk mund të ndryshohej. Provo përsëri.");

        setError(
          actionError instanceof Error
            ? actionError.message
            : "Statusi nuk mund të ndryshohej. Provo përsëri.",
        );
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
