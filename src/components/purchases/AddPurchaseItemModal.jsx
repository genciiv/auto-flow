"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { addPurchaseItem } from "@/actions/purchase-item-actions";

export default function AddPurchaseItemModal({ purchaseOrderId }) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function handleOpen() {
    setError("");
    setOpen(true);
  }

  function handleClose() {
    if (isSaving) {
      return;
    }

    setError("");
    setOpen(false);
  }

  async function handleAddItem(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await addPurchaseItem(formData);

      if (!result?.success) {
        setError(result?.message || "Artikulli nuk mund të shtohej.");

        return;
      }

      setOpen(false);
    } catch (error) {
      console.error("Gabim gjatë shtimit të artikullit:", error);

      setError("Ndodhi një gabim gjatë shtimit të artikullit.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
      >
        Shto artikull
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950">
                Shto artikull në porosi
              </h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Mbyll modalin"
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={handleAddItem}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <input
                type="hidden"
                name="purchaseOrderId"
                value={purchaseOrderId}
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Emri i artikullit
                </label>

                <input
                  name="name"
                  required
                  disabled={isSaving}
                  placeholder="Filtra vaji MANN"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sasia
                </label>

                <input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Çmimi njësi
                </label>

                <input
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 md:col-span-2">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving && <Loader2 size={17} className="animate-spin" />}

                  {isSaving ? "Duke ruajtur..." : "Ruaj artikullin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
