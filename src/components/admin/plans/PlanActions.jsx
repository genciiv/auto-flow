"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Power,
  Star,
} from "lucide-react";

import {
  togglePlanStatusAction,
  toggleRecommendedPlanAction,
} from "@/app/admin/plans/actions";

export default function PlanActions({ planId, slug, isActive, isRecommended }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const isFreeTrial = slug === "free-trial";

  function runAction(action) {
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await action();

        setMessage({
          type: "success",
          text: result?.message || "Veprimi përfundoi me sukses.",
        });

        router.refresh();

        setTimeout(() => {
          setMessage(null);
        }, 2500);
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Veprimi nuk mund të përfundohej.",
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/plans/${planId}/edit`}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Pencil size={14} />
          Modifiko
        </Link>

        <button
          type="button"
          disabled={isPending || isFreeTrial}
          onClick={() => runAction(() => toggleRecommendedPlanAction(planId))}
          title={
            isFreeTrial
              ? "Free Trial nuk mund të rekomandohet"
              : isRecommended
                ? "Hiqe nga planet e rekomanduara"
                : "Shënoje si të rekomanduar"
          }
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${
            isRecommended
              ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
              : "border-slate-200 text-slate-500 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
          }`}
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Star size={15} fill={isRecommended ? "currentColor" : "none"} />
          )}
        </button>

        <button
          type="button"
          disabled={isPending || isFreeTrial}
          onClick={() => runAction(() => togglePlanStatusAction(planId))}
          title={
            isFreeTrial
              ? "Free Trial duhet të mbetet aktiv"
              : isActive
                ? "Çaktivizo planin"
                : "Aktivizo planin"
          }
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${
            isActive
              ? "border-red-200 text-red-600 hover:bg-red-50"
              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Power size={15} />
          )}
        </button>
      </div>

      {message ? (
        <div
          className={`flex max-w-xs items-start gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
          )}

          <span>{message.text}</span>
        </div>
      ) : null}
    </div>
  );
}
