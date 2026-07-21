"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteAppointment } from "@/actions/appointment-actions";

export default function DeleteAppointmentModal({ appointment, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setError("");

      const result = await deleteAppointment(appointment.id);

      if (!result?.success) {
        setError(result?.message || "Termini nuk mund të fshihej.");
        return;
      }

      onClose();
    } catch (error) {
      console.error(error);

      setError("Ndodhi një gabim gjatë fshirjes.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 size={22} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-950">Fshi terminin</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Je i sigurt që dëshiron të fshish terminin{" "}
          <strong className="text-slate-700">{appointment.title}</strong>? Ky
          veprim nuk mund të kthehet pas.
        </p>

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
            {isDeleting && <Loader2 size={17} className="animate-spin" />}

            {isDeleting ? "Duke fshirë..." : "Fshi terminin"}
          </button>
        </div>
      </div>
    </div>
  );
}
