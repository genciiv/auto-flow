"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";

import EditAppointmentModal from "@/components/appointments/EditAppointmentModal";
import DeleteAppointmentModal from "@/components/appointments/DeleteAppointmentModal";

import {
  startServiceFromAppointment,
  updateAppointmentStatus,
} from "@/actions/appointment-actions";

export default function AppointmentRowActions({
  appointment,
  customers = [],
  vehicles = [],
  canUpdate = false,
  canDelete = false,
  canStartService = false,
}) {
  const router = useRouter();
  const menuRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeAction, setActiveAction] = useState("");

  const hasAvailableActions = canUpdate || canDelete || canStartService;

  const serviceCanStart =
    canStartService &&
    appointment.status === "PENDING" &&
    Boolean(appointment.vehicleId);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setEditOpen(false);
        setDeleteOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleStatusChange(status) {
    if (!canUpdate) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActiveAction(status);
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
    if (!serviceCanStart) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActiveAction("start-service");
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

  if (!hasAvailableActions) {
    return null;
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          disabled={isSubmitting}
          className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 disabled:opacity-50"
          aria-label="Veprimet e terminit"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin text-slate-500" />
          ) : (
            <MoreHorizontal size={18} className="text-slate-500" />
          )}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            {canUpdate && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
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
                  role="menuitem"
                  onClick={() => handleStatusChange("PENDING")}
                  disabled={appointment.status === "PENDING"}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Clock3 size={17} className="text-amber-600" />
                  Në pritje
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleStatusChange("IN_PROGRESS")}
                  disabled={appointment.status === "IN_PROGRESS"}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Wrench size={17} className="text-blue-600" />
                  Në proces
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleStatusChange("COMPLETED")}
                  disabled={appointment.status === "COMPLETED"}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  Përfunduar
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleStatusChange("CANCELLED")}
                  disabled={appointment.status === "CANCELLED"}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CircleX size={17} className="text-red-600" />
                  Anuluar
                </button>
              </>
            )}

            {canStartService && (
              <>
                {canUpdate && (
                  <div className="my-2 border-t border-slate-100" />
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleStartService}
                  disabled={!serviceCanStart}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center gap-3">
                    {activeAction === "start-service" ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Play size={17} />
                    )}
                    Fillo servisin
                  </span>

                  <ChevronRight size={16} />
                </button>

                {!appointment.vehicleId && (
                  <p className="px-3 py-2 text-xs font-medium text-amber-600">
                    Duhet të zgjidhet një automjet.
                  </p>
                )}
              </>
            )}

            {canDelete && (
              <>
                {(canUpdate || canStartService) && (
                  <div className="my-2 border-t border-slate-100" />
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={17} />
                  Fshi terminin
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {canUpdate && editOpen && (
        <EditAppointmentModal
          appointment={appointment}
          customers={customers}
          vehicles={vehicles}
          onClose={() => setEditOpen(false)}
        />
      )}

      {canDelete && deleteOpen && (
        <DeleteAppointmentModal
          appointment={appointment}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
