"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, History, Loader2, RotateCcw, XCircle } from "lucide-react";

import { cancelVehicleClaim } from "@/app/customer/vehicles/claim-actions";

export default function CustomerVehicleClaimActions({
  claimId,
  customerVehicleId,
  status,
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (!window.confirm("A je i sigurt që dëshiron ta anulosh këtë kërkesë?")) {
      return;
    }

    setMessage("");

    startTransition(async () => {
      const result = await cancelVehicleClaim(claimId);
      setMessage(result?.message || "Veprimi nuk mund të përfundohej.");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {status === "PENDING" ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <XCircle size={16} />
            )}
            Anulo kërkesën
          </button>
        ) : null}

        {status === "REJECTED" ? (
          <Link
            href={`/customer/vehicles/${customerVehicleId}/claim`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            <RotateCcw size={16} />
            Dërgo përsëri
          </Link>
        ) : null}

        {status === "APPROVED" ? (
          <>
            <Link
              href="/customer/services"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-600"
            >
              <History size={16} />
              Shiko historikun
            </Link>

            <Link
              href={`/customer/vehicles/${customerVehicleId}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Shiko makinën
              <ArrowRight size={16} />
            </Link>
          </>
        ) : null}
      </div>

      {message ? (
        <p className="text-sm font-semibold text-slate-600">{message}</p>
      ) : null}
    </div>
  );
}
