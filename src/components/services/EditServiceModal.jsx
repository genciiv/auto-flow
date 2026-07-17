"use client";

import { useState } from "react";
import { Loader2, Wrench, X } from "lucide-react";
import { updateService } from "@/actions/service-actions";

export default function EditServiceModal({ service, vehicles = [], onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await updateService(formData);

      if (!result?.success) {
        setError(result?.message || "Shërbimi nuk mund të përditësohet.");
        return;
      }

      onClose();
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë përditësimit të shërbimit.");
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
              <Wrench size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Edito shërbimin
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Përditëso të dhënat dhe statusin e shërbimit.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form action={handleUpdate} className="mt-7 space-y-5">
          <input type="hidden" name="id" value={service.id} />

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Automjeti
            </label>

            <select
              name="vehicleId"
              required
              defaultValue={service.vehicleId || ""}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
            >
              <option value="">Zgjidh automjetin</option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} — {vehicle.brand} {vehicle.model || ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Titulli
            </label>

            <input
              name="title"
              required
              defaultValue={service.title || ""}
              placeholder="P.sh. Ndërrim vaji dhe filtrash"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Përshkrimi
            </label>

            <textarea
              name="description"
              rows="4"
              defaultValue={service.description || ""}
              placeholder="Përshkrimi i punës së kryer..."
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Statusi
              </label>

              <select
                name="status"
                required
                defaultValue={service.status || "PENDING"}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              >
                <option value="PENDING">Në pritje</option>
                <option value="IN_PROGRESS">Në proces</option>
                <option value="COMPLETED">Përfunduar</option>
                <option value="CANCELLED">Anuluar</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Totali
              </label>

              <input
                name="total"
                type="number"
                min="0"
                step="0.01"
                defaultValue={Number(service.total || 0)}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
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
