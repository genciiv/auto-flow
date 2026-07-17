"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { receivePurchaseOrder } from "@/actions/purchase-item-actions";

export default function ReceivePurchaseButton({
  purchaseOrderId,
  disabled = false,
}) {
  const [isReceiving, setIsReceiving] = useState(false);
  const [error, setError] = useState("");

  async function handleReceive() {
    const confirmed = window.confirm(
      "Je i sigurt që dëshiron ta marrësh këtë porosi në magazinë? Stoku i pjesëve do të rritet.",
    );

    if (!confirmed) return;

    try {
      setIsReceiving(true);
      setError("");

      const result = await receivePurchaseOrder(purchaseOrderId);

      if (result && result.success === false) {
        setError(result.message || "Porosia nuk mund të merrej në magazinë.");
      }
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë marrjes së porosisë.");
    } finally {
      setIsReceiving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleReceive}
        disabled={disabled || isReceiving}
        className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isReceiving && <Loader2 size={14} className="animate-spin" />}

        {isReceiving ? "Duke marrë..." : "Merr në magazinë"}
      </button>

      {error && (
        <div className="fixed bottom-6 right-6 z-[110] max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
