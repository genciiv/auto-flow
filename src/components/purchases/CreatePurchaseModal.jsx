"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { createPurchaseOrder } from "@/actions/purchase-actions";

export default function CreatePurchaseModal() {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function handleOpen() {
    setError("");
    setOpen(true);
  }

  function handleClose() {
    if (isSaving) return;

    setError("");
    setOpen(false);
  }

  async function handleCreatePurchase(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await createPurchaseOrder(formData);

      if (!result?.success) {
        setError(result?.message || "Porosia nuk mund të krijohej.");
        return;
      }

      setOpen(false);
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë krijimit të porosisë.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
      >
        Krijo porosi
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Krijo porosi të re
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Regjistro porosinë e furnitorit në AutoFlow.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={handleCreatePurchase}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Furnitori *
                </label>

                <input
                  name="supplier"
                  required
                  disabled={isSaving}
                  placeholder="Auto Parts Albania"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Statusi
                </label>

                <select
                  name="status"
                  defaultValue="PENDING"
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
                  step="0.01"
                  min="0"
                  defaultValue="0"
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
                  disabled={isSaving}
                  placeholder="Porosi për filtra, vajra ose pjesë frenimi..."
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
                  onClick={handleClose}
                  disabled={isSaving}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving && <Loader2 size={17} className="animate-spin" />}

                  {isSaving ? "Duke ruajtur..." : "Ruaj porosinë"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
