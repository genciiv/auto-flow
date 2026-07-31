"use client";

import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/ToastProvider";

import { useState } from "react";
import {
  Archive,
  CircleCheckBig,
  FilePenLine,
  Globe2,
  Trash2,
} from "lucide-react";

import {
  changeMarketplaceListingStatus,
  deleteMarketplaceListing,
} from "@/actions/marketplace-actions";

function ActionButton({
  icon: Icon,
  label,
  className,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

export default function MarketplaceListingActions({ listingId, status }) {
  const [pendingAction, setPendingAction] = useState("");
  const { confirm } = useConfirm();
  const toast = useToast();

  async function submitStatus(nextStatus) {
    const messages = {
      SOLD: "Dëshiron ta shënosh këtë publikim si të shitur?",
      ARCHIVED: "Dëshiron ta arkivosh këtë publikim?",
      PUBLISHED: "Dëshiron ta publikosh këtë publikim?",
      DRAFT: "Dëshiron ta kthesh këtë publikim në draft?",
    };

    const confirmed = await confirm({
      title: "Konfirmo ndryshimin",
      description: 
      messages[nextStatus] || "Dëshiron të ndryshosh statusin?",
      confirmLabel: "Vazhdo",
      tone: "warning",
    });

    if (!confirmed) {
      return;
    }

    setPendingAction(nextStatus);

    const formData = new FormData();

    formData.set("listingId", listingId);
    formData.set("status", nextStatus);

    try {
      const result = await changeMarketplaceListingStatus(formData);
      if (result?.success === false) { toast.error(result.message || "Statusi nuk u ndryshua."); return; }
      toast.success(result?.message || "Statusi u ndryshua me sukses.");
    } finally {
      setPendingAction("");
    }
  }

  async function submitDelete() {
    const confirmed = await confirm({
      title: "Fshi publikimin",
      description: "Je i sigurt që dëshiron ta fshish përgjithmonë këtë publikim? Publikimi dhe fotografitë e tij nuk mund të rikthehen.",
      confirmLabel: "Fshi përgjithmonë",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    setPendingAction("DELETE");

    const formData = new FormData();

    formData.set("listingId", listingId);

    try {
      const result = await deleteMarketplaceListing(formData);
      if (result?.success === false) { toast.error(result.message || "Publikimi nuk u fshi."); return; }
      toast.success(result?.message || "Publikimi u fshi me sukses.");
    } finally {
      setPendingAction("");
    }
  }

  const isPending = Boolean(pendingAction);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-bold text-slate-950">Veprimet</h2>

        <p className="mt-1 text-sm text-slate-500">
          Ndrysho statusin ose menaxho publikimin.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 p-6">
        {status !== "PUBLISHED" ? (
          <ActionButton
            icon={Globe2}
            label="Publiko"
            disabled={isPending}
            onClick={() => submitStatus("PUBLISHED")}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          />
        ) : null}

        {status !== "SOLD" ? (
          <ActionButton
            icon={CircleCheckBig}
            label="Shëno si shitur"
            disabled={isPending}
            onClick={() => submitStatus("SOLD")}
            className="bg-blue-600 text-white hover:bg-blue-700"
          />
        ) : null}

        {status !== "ARCHIVED" ? (
          <ActionButton
            icon={Archive}
            label="Arkivo"
            disabled={isPending}
            onClick={() => submitStatus("ARCHIVED")}
            className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          />
        ) : null}

        {status !== "DRAFT" ? (
          <ActionButton
            icon={FilePenLine}
            label="Ktheje në draft"
            disabled={isPending}
            onClick={() => submitStatus("DRAFT")}
            className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          />
        ) : null}

        <ActionButton
          icon={Trash2}
          label="Fshi"
          disabled={isPending}
          onClick={submitDelete}
          className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
        />
      </div>

      {pendingAction ? (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
          Veprimi po përpunohet...
        </div>
      ) : null}
    </section>
  );
}
