"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { updateCustomer } from "@/actions/customer-actions";

export default function EditCustomerModal({ customer, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdateCustomer(formData) {
    try {
      setIsSubmitting(true);
      setError("");

      await updateCustomer(formData);

      onClose();
    } catch (error) {
      console.error("Gabim gjatë përditësimit të klientit:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ndodhi një gabim gjatë përditësimit të klientit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-customer-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="edit-customer-title"
                className="text-xl font-bold tracking-tight text-slate-950"
              >
                Edito klientin
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Përditëso të dhënat e klientit.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Mbyll modalin"
            >
              <X size={20} />
            </button>
          </div>

          <form
            action={handleUpdateCustomer}
            className="mt-6 flex w-full flex-col gap-4"
          >
            <input type="hidden" name="id" value={customer.id} />

            <div className="w-full">
              <label
                htmlFor="edit-customer-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Emri i klientit
              </label>

              <input
                id="edit-customer-name"
                name="name"
                required
                disabled={isSubmitting}
                defaultValue={customer.name || ""}
                placeholder="Emri i klientit"
                className="block w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
              />
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label
                  htmlFor="edit-customer-phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Telefoni
                </label>

                <input
                  id="edit-customer-phone"
                  name="phone"
                  disabled={isSubmitting}
                  defaultValue={customer.phone || ""}
                  placeholder="+355 69 000 0000"
                  className="block w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="edit-customer-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <input
                  id="edit-customer-email"
                  name="email"
                  type="email"
                  disabled={isSubmitting}
                  defaultValue={customer.email || ""}
                  placeholder="email@example.com"
                  className="block w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>
            </div>

            <div className="w-full">
              <label
                htmlFor="edit-customer-city"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Qyteti
              </label>

              <input
                id="edit-customer-city"
                name="city"
                disabled={isSubmitting}
                defaultValue={customer.city || ""}
                placeholder="Qyteti"
                className="block w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
              />
            </div>

            {error && (
              <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <div className="flex w-full flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anulo
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Duke ruajtur...
                  </>
                ) : (
                  "Ruaj ndryshimet"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
