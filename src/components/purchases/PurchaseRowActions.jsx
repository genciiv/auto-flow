"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ban,
  Clock3,
  Edit,
  Loader2,
  MoreHorizontal,
  PackageCheck,
  Trash2,
} from "lucide-react";

import EditPurchaseModal from "@/components/purchases/EditPurchaseModal";
import DeletePurchaseModal from "@/components/purchases/DeletePurchaseModal";
import { updatePurchaseStatus } from "@/actions/purchase-actions";

export default function PurchaseRowActions({ purchase }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const menuRef = useRef(null);
  const isReceived = purchase.status === "RECEIVED";

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

  async function handleStatusChange(status) {
    try {
      setMenuOpen(false);
      setIsUpdating(true);
      setError("");

      const result = await updatePurchaseStatus(purchase.id, status);

      if (!result?.success) {
        setError(result?.message || "Statusi nuk mund të ndryshohej.");
      }
    } catch (error) {
      console.error(error);
      setError("Ndodhi një gabim gjatë ndryshimit të statusit.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          disabled={isUpdating}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          aria-label={`Veprimet për porosinë e ${purchase.supplier}`}
        >
          {isUpdating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <MoreHorizontal size={18} />
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            {!isReceived ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Edit size={16} />
                  Edito porosinë
                </button>

                <div className="my-1 border-t border-slate-100" />

                {purchase.status !== "PENDING" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("PENDING")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50"
                  >
                    <Clock3 size={16} />
                    Kalo në pritje
                  </button>
                )}

                {purchase.status !== "ORDERED" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("ORDERED")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    <PackageCheck size={16} />
                    Shëno si të porositur
                  </button>
                )}

                {purchase.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("CANCELLED")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Ban size={16} />
                    Anulo porosinë
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Fshi porosinë
                </button>
              </>
            ) : (
              <div className="px-3 py-3">
                <p className="text-sm font-semibold text-slate-700">
                  Porosia është marrë në magazinë
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Nuk mund të editohet, fshihet ose t’i ndryshohet statusi.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-6 right-6 z-[110] max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {editOpen && (
        <EditPurchaseModal
          purchase={purchase}
          onClose={() => setEditOpen(false)}
        />
      )}

      {deleteOpen && (
        <DeletePurchaseModal
          purchase={purchase}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
