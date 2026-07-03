"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createVehicle } from "@/actions/vehicle-actions";

export default function CreateVehicleModal({ customers = [] }) {
  const [open, setOpen] = useState(false);

  async function handleCreateVehicle(formData) {
    await createVehicle(formData);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
      >
        Shto automjet
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Shto automjet të ri
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Regjistro automjetin dhe lidhe me klientin.
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
              action={handleCreateVehicle}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Klienti
                </label>
                <select
                  name="customerId"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="">Pa klient / do lidhet më vonë</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Targa *
                </label>
                <input
                  name="plate"
                  required
                  placeholder="AA123BB"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Marka *
                </label>
                <input
                  name="brand"
                  required
                  placeholder="BMW"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Modeli
                </label>
                <input
                  name="model"
                  placeholder="X5"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Viti
                </label>
                <input
                  name="year"
                  type="number"
                  placeholder="2018"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  VIN
                </label>
                <input
                  name="vin"
                  placeholder="WBA1234567890X5"
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
                  Ruaj automjetin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
