"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  MailCheck,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  approveApplicationAction,
  rejectApplicationAction,
} from "@/app/admin/applications/actions";

export default function ApplicationActions({ applicationId, status }) {
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState("");
  const [approvalResult, setApprovalResult] = useState(null);

  function handleApprove() {
    const confirmed = window.confirm(
      "Dëshiron ta aprovosh këtë aplikim? Do të krijohet biznesi dhe llogaria e pronarit.",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setApprovalResult(null);

    startTransition(async () => {
      try {
        const result = await approveApplicationAction(applicationId);

        setApprovalResult(result);
      } catch (actionError) {
        console.error(actionError);

        setError(actionError?.message || "Aplikimi nuk mund të aprovohej.");
      }
    });
  }

  function handleReject() {
    const reason = window.prompt("Vendos arsyen e refuzimit:");

    if (reason === null) {
      return;
    }

    const normalizedReason = reason.trim();

    if (normalizedReason.length < 3) {
      setError("Arsyeja duhet të ketë të paktën 3 karaktere.");

      return;
    }

    setError("");

    startTransition(async () => {
      try {
        await rejectApplicationAction(applicationId, normalizedReason);
      } catch (actionError) {
        console.error(actionError);

        setError(actionError?.message || "Aplikimi nuk mund të refuzohej.");
      }
    });
  }

  if (approvalResult) {
    const emailWasSent = approvalResult.activationEmailSent === true;

    const activationWasRequired = approvalResult.activationRequired === true;

    return (
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 font-semibold text-emerald-800">
          <Check size={18} />
          Biznesi u krijua me sukses
        </div>

        <div className="mt-4 space-y-3 text-sm text-emerald-800">
          <p>
            <span className="font-semibold">Pronari:</span>{" "}
            {approvalResult.ownerEmail}
          </p>

          {emailWasSent ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-white/70 px-3 py-3">
              <MailCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <p>
                {activationWasRequired
                  ? "Email-i i aktivizimit iu dërgua pronarit. Pronari duhet të hapë linkun dhe të vendosë password-in."
                  : "Email-i i aprovimit iu dërgua pronarit. Biznesi u lidh me llogarinë ekzistuese."}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-amber-800">
              <TriangleAlert size={18} className="mt-0.5 shrink-0" />

              <p className="font-medium">
                {approvalResult.emailError ||
                  "Biznesi u krijua, por email-i nuk u dërgua."}
              </p>
            </div>
          )}
        </div>

        <Link
          href={`/admin/businesses/${approvalResult.businessId}`}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
        >
          Shiko biznesin
          <ExternalLink size={15} />
        </Link>
      </div>
    );
  }

  if (status !== "PENDING") {
    return null;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Check size={17} />
          )}

          {isPending ? "Duke përpunuar..." : "Aprovo"}
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <X size={17} />
          )}
          Refuzo
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
