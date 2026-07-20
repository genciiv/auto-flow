"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, LoaderCircle, X } from "lucide-react";

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

    if (reason.trim().length < 3) {
      setError("Arsyeja duhet të ketë të paktën 3 karaktere.");

      return;
    }

    setError("");

    startTransition(async () => {
      try {
        await rejectApplicationAction(applicationId, reason);
      } catch (actionError) {
        console.error(actionError);

        setError(actionError?.message || "Aplikimi nuk mund të refuzohej.");
      }
    });
  }

  async function copyCredentials() {
    if (!approvalResult) {
      return;
    }

    const text = [
      `Email: ${approvalResult.ownerEmail}`,
      approvalResult.temporaryPassword
        ? `Fjalëkalimi: ${approvalResult.temporaryPassword}`
        : "Përdoruesi kishte tashmë një fjalëkalim.",
    ].join("\n");

    await navigator.clipboard.writeText(text);
  }

  if (approvalResult) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 font-semibold text-emerald-800">
          <Check size={18} />
          Biznesi u krijua me sukses
        </div>

        <div className="mt-4 space-y-2 text-sm text-emerald-800">
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {approvalResult.ownerEmail}
          </p>

          <p>
            <span className="font-semibold">Fjalëkalimi:</span>{" "}
            {approvalResult.temporaryPassword ||
              "Përdoruesi kishte llogari ekzistuese"}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyCredentials}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
          >
            <Copy size={15} />
            Kopjo kredencialet
          </button>

          <Link
            href={`/admin/businesses/${approvalResult.businessId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"
          >
            Shiko biznesin
            <ExternalLink size={15} />
          </Link>
        </div>
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
          Aprovo
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
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
