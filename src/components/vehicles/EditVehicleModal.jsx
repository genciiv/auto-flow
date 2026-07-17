"use client";

import { useState } from "react";
import { Car, Loader2, X } from "lucide-react";
import { updateVehicle } from "@/actions/vehicle-actions";

export default function EditVehicleModal({ vehicle, customers = [], onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdateVehicle(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await updateVehicle(formData);

      if (!result?.success) {
        setError(result?.message || "Automjeti nuk mund të përditësohet.");
        return;
      }

      onClose();
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë përditësimit të automjetit.");
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
              <Car size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Edito automjetin
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Përditëso të dhënat e automjetit.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form action={handleUpdateVehicle} className="mt-7 space-y-5">
          <input type="hidden" name="id" value={vehicle.id} />

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Pronari
            </label>

            <select
              name="customerId"
              required
              defaultValue={vehicle.customerId || ""}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
            >
              <option value="">Zgjidh klientin</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.phone ? ` - ${customer.phone}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Targa
              </label>

              <input
                name="plate"
                required
                defaultValue={vehicle.plate || ""}
                placeholder="AA123BB"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Marka
              </label>

              <input
                name="brand"
                required
                defaultValue={vehicle.brand || ""}
                placeholder="Volkswagen"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Modeli
              </label>

              <input
                name="model"
                required
                defaultValue={vehicle.model || ""}
                placeholder="Jetta"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Viti
              </label>

              <input
                name="year"
                type="number"
                min="1900"
                max="2100"
                defaultValue={vehicle.year || ""}
                placeholder="2012"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              VIN
            </label>

            <input
              name="vin"
              defaultValue={vehicle.vin || ""}
              placeholder="Numri i shasisë"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500"
            />
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
