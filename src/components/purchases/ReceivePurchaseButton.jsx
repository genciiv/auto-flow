"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, PackageCheck, XCircle } from "lucide-react";

import { receivePurchaseOrder } from "@/actions/purchase-item-actions";

export default function ReceivePurchaseButton({
  purchaseOrderId,
  status = "PENDING",
  itemCount = 0,
}) {
  const [isReceiving, setIsReceiving] = useState(false);
  const [error, setError] = useState("");

  const isReceived = status === "RECEIVED";
  const isCancelled = status === "CANCELLED";
  const hasNoItems = Number(itemCount || 0) === 0;

  const isDisabled = isReceiving || isReceived || isCancelled || hasNoItems;

  async function handleReceive() {
    if (isDisabled) {
      return;
    }

    const confirmed = window.confirm(
      "Je i sigurt që dëshiron ta marrësh këtë porosi në magazinë? Stoku i pjesëve do të rritet.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsReceiving(true);
      setError("");

      const result = await receivePurchaseOrder(purchaseOrderId);

      if (!result?.success) {
        setError(result?.message || "Porosia nuk mund të merrej në magazinë.");
      }
    } catch (receiveError) {
      console.error(receiveError);

      setError("Ndodhi një gabim gjatë marrjes së porosisë.");
    } finally {
      setIsReceiving(false);
    }
  }

  function getButtonContent() {
    if (isReceiving) {
      return (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Duke marrë...
        </>
      );
    }

    if (isReceived) {
      return (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />E marrë
        </>
      );
    }

    if (isCancelled) {
      return (
        <>
          <XCircle className="h-3.5 w-3.5" />E anuluar
        </>
      );
    }

    if (hasNoItems) {
      return (
        <>
          <PackageCheck className="h-3.5 w-3.5" />
          Pa artikuj
        </>
      );
    }

    return (
      <>
        <PackageCheck className="h-3.5 w-3.5" />
        Merr në magazinë
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleReceive}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
          isReceived
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : isCancelled
              ? "border border-red-200 bg-red-50 text-red-700"
              : hasNoItems
                ? "border border-slate-200 bg-slate-100 text-slate-500"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
        } disabled:cursor-not-allowed`}
      >
        {getButtonContent()}
      </button>

      {error && (
        <div className="fixed bottom-6 right-6 z-[110] max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold text-red-500 transition hover:text-red-700"
              aria-label="Mbyll gabimin"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
