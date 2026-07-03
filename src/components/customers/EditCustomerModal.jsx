"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updateCustomer } from "@/actions/customer-actions";

export default function EditCustomerModal({ customer, onClose }) {
  async function handleUpdateCustomer(formData) {
    await updateCustomer(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Edito klientin</h2>
            <p className="mt-1 text-sm text-slate-500">
              Përditëso të dhënat e klientit.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form action={handleUpdateCustomer} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={customer.id} />

          <input
            name="name"
            required
            defaultValue={customer.name || ""}
            placeholder="Emri i klientit"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <input
            name="phone"
            defaultValue={customer.phone || ""}
            placeholder="Telefoni"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <input
            name="email"
            type="email"
            defaultValue={customer.email || ""}
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <input
            name="city"
            defaultValue={customer.city || ""}
            placeholder="Qyteti"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Anulo
            </button>

            <button
              type="submit"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Ruaj ndryshimet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
