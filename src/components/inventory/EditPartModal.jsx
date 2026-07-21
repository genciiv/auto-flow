"use client";

import { useState } from "react";
import { Loader2, Package, X } from "lucide-react";

import { updatePart } from "@/actions/part-actions";

export default function EditPartModal({
  part,
  canManageStock = false,
  onClose,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await updatePart(formData);

      if (!result?.success) {
        setError(result?.message || "Pjesa nuk mund të përditësohej.");
        return;
      }

      onClose();
    } catch (error) {
      console.error(error);

      setError("Ndodhi një gabim gjatë përditësimit.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Package size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">Edito pjesën</h2>

              <p className="mt-1 text-sm text-slate-500">
                Përditëso informacionin, stokun dhe çmimet.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form action={handleUpdate} className="mt-6 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={part.id} />

          {!canManageStock && (
            <input type="hidden" name="stock" value={Number(part.stock || 0)} />
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Kodi
            </label>

            <input
              name="code"
              defaultValue={part.code || ""}
              placeholder="MANN-HU7020"
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Emri *
            </label>

            <input
              name="name"
              required
              defaultValue={part.name || ""}
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Kategoria
            </label>

            <input
              name="category"
              defaultValue={part.category || ""}
              placeholder="Filtra"
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Furnitori
            </label>

            <input
              name="supplier"
              defaultValue={part.supplier || ""}
              placeholder="Auto Parts Albania"
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Stoku
            </label>

            {canManageStock ? (
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={Number(part.stock || 0)}
                disabled={isSaving}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
              />
            ) : (
              <input
                type="number"
                min="0"
                value={Number(part.stock || 0)}
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
              defaultValue={Number(part.minStock || 0)}
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Çmimi i blerjes
            </label>

            <input
              name="buyPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={Number(part.buyPrice || 0)}
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Çmimi i shitjes
            </label>

            <input
              name="sellPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={Number(part.sellPrice || 0)}
              disabled={isSaving}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-70"
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

              {isSaving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
