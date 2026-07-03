"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createInvoice } from "@/actions/invoice-actions";

export default function CreateInvoiceModal({
  customers = [],
  vehicles = [],
  services = [],
}) {
  const [open, setOpen] = useState(false);

  async function handleCreateInvoice(formData) {
    await createInvoice(formData);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
      >
        Krijo faturë
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Krijo faturë të re
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Lidhe faturën me klientin, automjetin ose shërbimin.
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
              action={handleCreateInvoice}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Klienti
                </label>
                <select
                  name="customerId"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="">Pa klient</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Automjeti
                </label>
                <select
                  name="vehicleId"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="">Pa automjet</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} — {vehicle.brand} {vehicle.model || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Shërbimi
                </label>
                <select
                  name="serviceId"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="">Pa shërbim</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title} — {service.vehicle?.plate || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Numri i faturës *
                </label>
                <input
                  name="number"
                  required
                  placeholder="INV-1025"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Totali *
                </label>
                <input
                  name="total"
                  type="number"
                  step="0.01"
                  required
                  placeholder="240"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Statusi
                </label>
                <select
                  name="status"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  defaultValue="DRAFT"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PAID">Paguar</option>
                  <option value="UNPAID">Pa paguar</option>
                  <option value="OVERDUE">Vonuar</option>
                </select>
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
                  Ruaj faturën
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
