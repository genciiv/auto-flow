"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createService } from "@/actions/service-actions";

export default function CreateServiceModal({ vehicles = [] }) {
  const [open, setOpen] = useState(false);

  async function handleCreateService(formData) {
    await createService(formData);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
      >
        Krijo shërbim
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Krijo shërbim të ri
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Regjistro një punë të re për automjetin.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={handleCreateService}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Automjeti *
                </label>
                <select
                  name="vehicleId"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="">Zgjidh automjetin</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} — {vehicle.brand} {vehicle.model || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Titulli *
                </label>
                <input
                  name="title"
                  required
                  placeholder="Ndërrim vaji + filtra"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Përshkrimi
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Shënime për punën, defektin ose pjesët që duhen..."
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Statusi
                </label>
                <select
                  name="status"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  defaultValue="PENDING"
                >
                  <option value="PENDING">Në pritje</option>
                  <option value="IN_PROGRESS">Në proces</option>
                  <option value="COMPLETED">Përfunduar</option>
                  <option value="CANCELLED">Anuluar</option>
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
                  placeholder="240"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Ruaj shërbimin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
