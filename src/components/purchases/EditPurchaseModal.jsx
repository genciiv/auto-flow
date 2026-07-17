"use client";

import { useState } from "react";
import { Loader2, ShoppingCart, X } from "lucide-react";
import { updatePurchaseOrder } from "@/actions/purchase-actions";

export default function EditPurchaseModal({ purchase, onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await updatePurchaseOrder(formData);

      if (!result?.success) {
        setError(result?.message || "Porosia nuk mund të përditësohej.");
        return;
      }

      onClose();
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë përditësimit të porosisë.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ShoppingCart size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Edito porosinë
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Përditëso furnitorin, totalin, shënimet dhe statusin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form action={handleUpdate} className="mt-6 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={purchase.id} />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Furnitori *
            </label>

            <input
              name="supplier"
              required
              defaultValue={purchase.supplier || ""}
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Statusi
            </label>

            <select
              name="status"
              defaultValue={purchase.status || "PENDING"}
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
            >
              <option value="PENDING">Në pritje</option>
              <option value="ORDERED">E porositur</option>
              <option value="CANCELLED">E anuluar</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Totali
            </label>

            <input
              name="total"
              type="number"
              min="0"
              step="0.01"
              defaultValue={Number(purchase.total || 0)}
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Shënime
            </label>

            <textarea
              name="notes"
              rows={4}
              defaultValue={purchase.notes || ""}
              disabled={isSaving}
              placeholder="Shënime për porosinë..."
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 md:col-span-2">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Anulo
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <Loader2 size={17} className="animate-spin" />}

              {isSaving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
