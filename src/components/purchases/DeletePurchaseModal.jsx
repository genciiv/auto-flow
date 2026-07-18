"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

import { deletePurchaseOrder } from "@/actions/purchase-actions";
import { formatCurrency } from "@/lib/formatters";

export default function DeletePurchaseModal({ purchase, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const itemCount = purchase.items?.length || 0;
  const isReceived = purchase.status === "RECEIVED";

  async function handleDelete() {
    if (isReceived) {
      setError("Porosia është marrë në magazinë dhe nuk mund të fshihet.");
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      const result = await deletePurchaseOrder(purchase.id);

      if (!result?.success) {
        setError(result?.message || "Porosia nuk mund të fshihet.");
        return;
      }

      onClose();
    } catch (deleteError) {
      console.error(deleteError);

      setError("Ndodhi një gabim gjatë fshirjes së porosisë.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Fshi porosinë
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ky veprim nuk mund të zhbëhet.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Mbyll modalin"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">
            Je i sigurt që dëshiron të fshish porosinë?
          </p>

          <p className="mt-2 font-bold text-slate-950">{purchase.supplier}</p>

          <p className="mt-1 text-sm text-slate-500">
            {itemCount} artikuj · {formatCurrency(purchase.total)}
          </p>
        </div>

        {isReceived ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium leading-6 text-amber-800">
              Kjo porosi është marrë në magazinë. Fshirja bllokohet për të
              mbrojtur stokun dhe historikun.
            </p>
          </div>
        ) : itemCount > 0 ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium leading-6 text-red-700">
              Fshirja do të heqë edhe {itemCount} artikujt e lidhur me këtë
              porosi.
            </p>
          </div>
        ) : null}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anulo
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isReceived}
            className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Duke fshirë...
              </>
            ) : (
              <>
                <Trash2 size={17} />
                Fshi porosinë
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
