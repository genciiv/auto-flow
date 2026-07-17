"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock3,
  Edit3,
  Loader2,
  MoreHorizontal,
  Play,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import {
  deleteAppointment,
  startServiceFromAppointment,
  updateAppointment,
  updateAppointmentStatus,
} from "@/actions/appointment-actions";

function formatDateForInput(date) {
  const appointmentDate = new Date(date);
  const timezoneOffset = appointmentDate.getTimezoneOffset() * 60000;

  return new Date(appointmentDate.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

export default function AppointmentRowActions({
  appointment,
  customers,
  vehicles,
}) {
  const router = useRouter();
  const menuRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    appointment.customerId || "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const [error, setError] = useState("");

  const filteredVehicles = useMemo(() => {
    if (!selectedCustomerId) {
      return vehicles;
    }

    return vehicles.filter(
      (vehicle) => vehicle.customerId === selectedCustomerId,
    );
  }, [selectedCustomerId, vehicles]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function openEditModal() {
    setSelectedCustomerId(appointment.customerId || "");
    setError("");
    setMenuOpen(false);
    setEditOpen(true);
  }

  function openDeleteModal() {
    setError("");
    setMenuOpen(false);
    setDeleteOpen(true);
  }

  async function handleEdit(formData) {
    try {
      setIsSubmitting(true);
      setActiveAction("edit");
      setError("");

      const result = await updateAppointment(formData);

      if (!result?.success) {
        setError(result?.message || "Termini nuk mund të përditësohej.");
        return;
      }

      setEditOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë përditësimit.");
    } finally {
      setIsSubmitting(false);
      setActiveAction("");
    }
  }

  async function handleDelete() {
    try {
      setIsSubmitting(true);
      setActiveAction("delete");
      setError("");

      const result = await deleteAppointment(appointment.id);

      if (!result?.success) {
        setError(result?.message || "Termini nuk mund të fshihej.");
        return;
      }

      setDeleteOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë fshirjes.");
    } finally {
      setIsSubmitting(false);
      setActiveAction("");
    }
  }

  async function handleStatusChange(status) {
    try {
      setIsSubmitting(true);
      setActiveAction(status);
      setError("");
      setMenuOpen(false);

      const result = await updateAppointmentStatus(appointment.id, status);

      if (!result?.success) {
        window.alert(result?.message || "Statusi nuk mund të ndryshohej.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("Ndodhi një gabim gjatë ndryshimit të statusit.");
    } finally {
      setIsSubmitting(false);
      setActiveAction("");
    }
  }

  async function handleStartService() {
    try {
      setIsSubmitting(true);
      setActiveAction("start-service");
      setError("");
      setMenuOpen(false);

      const result = await startServiceFromAppointment(appointment.id);

      if (!result?.success) {
        window.alert(result?.message || "Servisi nuk mund të fillohej.");
        return;
      }

      router.push("/dashboard/services");
      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("Ndodhi një gabim gjatë nisjes së servisit.");
    } finally {
      setIsSubmitting(false);
      setActiveAction("");
    }
  }

  const canStartService =
    appointment.status === "PENDING" && Boolean(appointment.vehicleId);

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          disabled={isSubmitting}
          className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 disabled:opacity-50"
          aria-label="Veprimet e terminit"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin text-slate-500" />
          ) : (
            <MoreHorizontal size={18} className="text-slate-500" />
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <button
              type="button"
              onClick={openEditModal}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Edit3 size={17} />
              Ndrysho terminin
            </button>

            <div className="my-2 border-t border-slate-100" />

            <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Ndrysho statusin
            </p>

            <button
              type="button"
              onClick={() => handleStatusChange("PENDING")}
              disabled={appointment.status === "PENDING"}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Clock3 size={17} className="text-amber-600" />
              Në pritje
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange("IN_PROGRESS")}
              disabled={appointment.status === "IN_PROGRESS"}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Wrench size={17} className="text-blue-600" />
              Në proces
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange("COMPLETED")}
              disabled={appointment.status === "COMPLETED"}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 size={17} className="text-emerald-600" />
              Përfunduar
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange("CANCELLED")}
              disabled={appointment.status === "CANCELLED"}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CircleX size={17} className="text-red-600" />
              Anuluar
            </button>

            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              onClick={handleStartService}
              disabled={!canStartService}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="flex items-center gap-3">
                <Play size={17} />
                Fillo servisin
              </span>

              <ChevronRight size={16} />
            </button>

            {!appointment.vehicleId && (
              <p className="px-3 py-2 text-xs font-medium text-amber-600">
                Duhet të zgjidhet një automjet.
              </p>
            )}

            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              onClick={openDeleteModal}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={17} />
              Fshi terminin
            </button>
          </div>
        )}
      </div>

      {editOpen && (
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
                onClick={() => setEditOpen(false)}
                disabled={isSubmitting}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Mbyll formularin"
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={handleEdit}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <input
                type="hidden"
                name="appointmentId"
                value={appointment.id}
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Titulli *
                </label>

                <input
                  name="title"
                  required
                  defaultValue={appointment.title}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  defaultValue={appointment.vehicleId || ""}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  onClick={() => setEditOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activeAction === "edit" && (
                    <Loader2 size={17} className="animate-spin" />
                  )}

                  {activeAction === "edit"
                    ? "Duke ruajtur..."
                    : "Ruaj ndryshimet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Fshi terminin
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Je i sigurt që dëshiron të fshish terminin{" "}
              <strong className="text-slate-700">{appointment.title}</strong>?
              Ky veprim nuk mund të kthehet pas.
            </p>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={isSubmitting}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Anulo
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activeAction === "delete" && (
                  <Loader2 size={17} className="animate-spin" />
                )}

                {activeAction === "delete" ? "Duke fshirë..." : "Fshi terminin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
