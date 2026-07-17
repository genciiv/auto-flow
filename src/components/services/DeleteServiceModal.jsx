"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { deleteService } from "@/actions/service-actions";

export default function DeleteServiceModal({ service, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setError("");

      const result = await deleteService(service.id);

      if (!result?.success) {
        setError(result?.message || "Shërbimi nuk mund të fshihet.");
        return;
      }

      onClose();
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë fshirjes së shërbimit.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Fshi shërbimin
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ky veprim nuk mund të zhbëhet.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">
            Je i sigurt që dëshiron të fshish këtë shërbim?
          </p>

          <p className="mt-2 font-bold text-slate-950">{service.title}</p>

          <p className="mt-1 text-sm text-slate-500">
            {service.vehicle?.brand} {service.vehicle?.model || ""}
            {service.vehicle?.plate ? ` — ${service.vehicle.plate}` : ""}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Anulo
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Duke fshirë...
              </>
            ) : (
              <>
                <Trash2 size={17} />
                Fshi shërbimin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
