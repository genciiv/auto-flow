"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createPart } from "@/actions/part-actions";

export default function CreatePartModal() {
  const [open, setOpen] = useState(false);

  async function handleCreatePart(formData) {
    await createPart(formData);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
      >
        Shto pjesë
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Shto pjesë në magazinë
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Regjistro pjesë, stokun dhe çmimet.
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
              action={handleCreatePart}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kodi
                </label>
                <input
                  name="code"
                  placeholder="MANN-HU7020"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kategoria
                </label>
                <input
                  name="category"
                  placeholder="Filtra"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Furnitori
                </label>
                <input
                  name="supplier"
                  placeholder="Auto Parts Albania"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Stoku fillestar
                </label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="10"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Minimum stock
                </label>
                <input
                  name="minStock"
                  type="number"
                  min="0"
                  placeholder="5"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Çmimi blerjes
                </label>
                <input
                  name="buyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="700"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Çmimi shitjes
                </label>
                <input
                  name="sellPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1200"
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
                  Ruaj pjesën
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
