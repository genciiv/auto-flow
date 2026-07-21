"use client";

import { useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";

import { updateAppointment } from "@/actions/appointment-actions";

function formatDateForInput(date) {
  const appointmentDate = new Date(date);

  const timezoneOffset = appointmentDate.getTimezoneOffset() * 60000;

  return new Date(appointmentDate.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

export default function EditAppointmentModal({
  appointment,
  customers = [],
  vehicles = [],
  onClose,
}) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    appointment.customerId || "",
  );

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

  async function handleUpdate(formData) {
    try {
      setIsSaving(true);
      setError("");

      const result = await updateAppointment(formData);

      if (!result?.success) {
        setError(result?.message || "Termini nuk mund të përditësohej.");
        return;
      }

      onClose();
    } catch (error) {
      console.error(error);

      setError("Ndodhi një gabim gjatë përditësimit.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Ndrysho terminin
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Përditëso të dhënat e terminit të zgjedhur.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Mbyll formularin"
          >
            <X size={20} />
          </button>
        </div>

        <form action={handleUpdate} className="mt-6 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="appointmentId" value={appointment.id} />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Titulli *
            </label>

            <input
              name="title"
              required
              defaultValue={appointment.title}
              disabled={isSaving}
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
              onChange={(event) => setSelectedCustomerId(event.target.value)}
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
              defaultValue={appointment.vehicleId || ""}
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
              defaultValue={formatDateForInput(appointment.date)}
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
              defaultValue={appointment.status}
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
              defaultValue={appointment.description || ""}
              disabled={isSaving}
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
              onClick={onClose}
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

              {isSaving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
