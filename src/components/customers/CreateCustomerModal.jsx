"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createCustomer } from "@/actions/customer-actions";

export default function CreateCustomerModal() {
  const [open, setOpen] = useState(false);

  async function handleCreateCustomer(formData) {
    await createCustomer(formData);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
      >
        Shto klient
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Shto klient të ri
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Regjistro klientin në sistemin AutoFlow.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form action={handleCreateCustomer} className="mt-6 space-y-4">
              <input
                name="name"
                required
                placeholder="Emri i klientit"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <input
                name="phone"
                placeholder="Telefoni"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <input
                name="city"
                placeholder="Qyteti"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <div className="flex justify-end gap-3 pt-2">
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
                  Ruaj klientin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
