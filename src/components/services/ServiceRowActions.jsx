"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Edit,
  Loader2,
  MoreHorizontal,
  PlayCircle,
  Trash2,
} from "lucide-react";

import EditServiceModal from "@/components/services/EditServiceModal";
import DeleteServiceModal from "@/components/services/DeleteServiceModal";
import { updateServiceStatus } from "@/actions/service-actions";

export default function ServiceRowActions({
  service,
  vehicles = [],
  canUpdate = false,
  canDelete = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  const menuRef = useRef(null);

  const hasAvailableActions = canUpdate || canDelete;

  useEffect(() => {
    function handleClickOutside(event) {
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

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function changeStatus(status) {
    if (!canUpdate) {
      return;
    }

    try {
      setMenuOpen(false);
      setIsUpdatingStatus(true);
      setError("");

      const result = await updateServiceStatus(service.id, status);

      if (!result?.success) {
        setError(result?.message || "Statusi nuk mund të përditësohet.");
      }
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë ndryshimit të statusit.");
    } finally {
      setIsUpdatingStatus(false);
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
          disabled={isUpdatingStatus}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Veprimet për shërbimin ${service.title}`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          {isUpdatingStatus ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <MoreHorizontal size={18} />
          )}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
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
                  <Edit size={16} />
                  Edito shërbimin
                </button>

                <div className="my-1 border-t border-slate-100" />

                {service.status !== "PENDING" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => changeStatus("PENDING")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                  >
                    <Clock3 size={16} />
                    Kalo në pritje
                  </button>
                )}

                {service.status !== "IN_PROGRESS" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => changeStatus("IN_PROGRESS")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    <PlayCircle size={16} />
                    Fillo shërbimin
                  </button>
                )}

                {service.status !== "COMPLETED" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => changeStatus("COMPLETED")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <CheckCircle2 size={16} />
                    Shëno si përfunduar
                  </button>
                )}

                {service.status !== "CANCELLED" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => changeStatus("CANCELLED")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <Ban size={16} />
                    Anulo shërbimin
                  </button>
                )}
              </>
            )}

            {canUpdate && canDelete && (
              <div className="my-1 border-t border-slate-100" />
            )}

            {canDelete && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
                Fshi shërbimin
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-6 right-6 z-[110] max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-xl">
          <div className="flex items-start gap-3">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {canUpdate && editOpen && (
        <EditServiceModal
          service={service}
          vehicles={vehicles}
          onClose={() => setEditOpen(false)}
        />
      )}

      {canDelete && deleteOpen && (
        <DeleteServiceModal
          service={service}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
