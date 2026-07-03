"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { addPurchaseItem } from "@/actions/purchase-item-actions";

export default function AddPurchaseItemModal({ purchaseOrderId }) {
  const [open, setOpen] = useState(false);

  async function handleAddItem(formData) {
    await addPurchaseItem(formData);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
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
                  placeholder="Filtra vaji MANN"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Ruaj artikullin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
