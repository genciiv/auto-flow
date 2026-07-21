"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { createPart } from "@/actions/part-actions";

export default function CreatePartModal({ canManageStock = false }) {
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

  async function handleCreatePart(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await createPart(formData);

      if (!result?.success) {
        setError(result?.message || "Pjesa nuk mund të krijohej.");
        return;
      }

      setOpen(false);
    } catch (error) {
      console.error("Gabim gjatë krijimit të pjesës:", error);

      setError("Ndodhi një gabim gjatë krijimit të pjesës.");
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
        Shto pjesë
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Shto pjesë në magazinë
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Regjistro pjesën, stokun dhe çmimet.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Mbyll formularin"
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={handleCreatePart}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              {!canManageStock && (
                <input type="hidden" name="stock" value="0" />
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kodi
                </label>

                <input
                  name="code"
                  placeholder="MANN-HU7020"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Emri *
                </label>

                <input
                  name="name"
                  required
                  placeholder="Filtri vajit MANN"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kategoria
                </label>

                <input
                  name="category"
                  placeholder="Filtra"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Furnitori
                </label>

                <input
                  name="supplier"
                  placeholder="Auto Parts Albania"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Stoku fillestar
                </label>

                {canManageStock ? (
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue="0"
                    disabled={isSaving}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                  />
                ) : (
                  <input
                    type="number"
                    min="0"
                    value="0"
                    readOnly
                    className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Minimum stock
                </label>

                <input
                  name="minStock"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue="0"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Çmimi i blerjes
                </label>

                <input
                  name="buyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="0"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Çmimi i shitjes
                </label>

                <input
                  name="sellPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="0"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
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
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving && <Loader2 size={17} className="animate-spin" />}

                  {isSaving ? "Duke ruajtur..." : "Ruaj pjesën"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
