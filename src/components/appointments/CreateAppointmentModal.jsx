"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Loader2, X } from "lucide-react";
import { createAppointment } from "@/actions/appointment-actions";

export default function CreateAppointmentModal({ customers, vehicles }) {
  const [open, setOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredVehicles = useMemo(() => {
    if (!selectedCustomerId) {
      return vehicles;
    }

    return vehicles.filter(
      (vehicle) => vehicle.customerId === selectedCustomerId,
    );
  }, [selectedCustomerId, vehicles]);

  function handleOpen() {
    setError("");
    setSelectedCustomerId("");
    setOpen(true);
  }

  function handleClose() {
    if (isSaving) return;

    setError("");
    setOpen(false);
  }

  async function handleCreateAppointment(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await createAppointment(formData);

      if (!result?.success) {
        setError(result?.message || "Termini nuk mund të krijohej.");
        return;
      }

      setOpen(false);
      setSelectedCustomerId("");
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë krijimit të terminit.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
      >
        Krijo termin
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <CalendarPlus size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Krijo termin të ri
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Planifiko një rezervim për klientin dhe automjetin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Mbyll formularin"
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={handleCreateAppointment}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Titulli *
                </label>

                <input
                  name="title"
                  required
                  disabled={isSaving}
                  placeholder="Servis periodik"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Klienti
                </label>

                <select
                  name="customerId"
                  value={selectedCustomerId}
                  disabled={isSaving}
                  onChange={(event) =>
                    setSelectedCustomerId(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
                >
                  <option value="">Pa klient</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.phone ? ` · ${customer.phone}` : ""}
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
                  defaultValue=""
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
                >
                  <option value="">Pa automjet</option>

                  {filteredVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model || ""} · {vehicle.plate}
                    </option>
                  ))}
                </select>

                {selectedCustomerId && filteredVehicles.length === 0 && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    Ky klient nuk ka automjete të regjistruara.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Data dhe ora *
                </label>

                <input
                  name="date"
                  type="datetime-local"
                  required
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Statusi
                </label>

                <select
                  name="status"
                  defaultValue="PENDING"
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
                >
                  <option value="PENDING">Në pritje</option>
                  <option value="IN_PROGRESS">Në proces</option>
                  <option value="COMPLETED">Përfunduar</option>
                  <option value="CANCELLED">Anuluar</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Përshkrimi
                </label>

                <textarea
                  name="description"
                  rows={4}
                  disabled={isSaving}
                  placeholder="Ndërrim vaji, filtra, kontroll frenash..."
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 md:col-span-2">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving && <Loader2 size={17} className="animate-spin" />}

                  {isSaving ? "Duke ruajtur..." : "Ruaj terminin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
