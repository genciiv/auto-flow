"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";

import { deleteCustomerVehicle } from "@/app/customer/vehicles/actions";

export default function DeleteCustomerVehicleButton({
  vehicleId,
  vehicleName,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setMessage("");

    startTransition(async () => {
      const result = await deleteCustomerVehicle(vehicleId);

      if (!result.success) {
        setMessage(result.message || "Automjeti nuk mund të fshihej.");
        return;
      }

      setIsOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50"
      >
        <Trash2 size={16} />
        Fshi
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Fshi automjetin
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Je i sigurt që dëshiron të fshish{" "}
                  <span className="font-bold text-slate-800">
                    {vehicleName}
                  </span>
                  ? Ky veprim nuk mund të kthehet pas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            {message ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {message}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Anulo
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Duke fshirë...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Fshi automjetin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
