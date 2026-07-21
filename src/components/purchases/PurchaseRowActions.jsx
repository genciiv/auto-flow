"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Ban,
  CheckCircle2,
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

const MENU_WIDTH = 288;
const MENU_GAP = 8;
const VIEWPORT_PADDING = 12;

export default function PurchaseRowActions({
  purchase,
  canUpdate = false,
  canDelete = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    maxHeight: 320,
  });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const isReceived = purchase.status === "RECEIVED";
  const hasAvailableActions = canUpdate || canDelete;

  useEffect(() => {
    setMounted(true);
  }, []);

  function calculateMenuPosition() {
    if (!buttonRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();

    const estimatedMenuHeight = isReceived ? 150 : 290;

    const spaceBelow =
      window.innerHeight - buttonRect.bottom - VIEWPORT_PADDING;

    const spaceAbove = buttonRect.top - VIEWPORT_PADDING;

    const shouldOpenAbove =
      spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

    let top;

    if (shouldOpenAbove) {
      top = Math.max(
        VIEWPORT_PADDING,
        buttonRect.top - Math.min(estimatedMenuHeight, spaceAbove) - MENU_GAP,
      );
    } else {
      top = buttonRect.bottom + MENU_GAP;
    }

    let left = buttonRect.right - MENU_WIDTH;

    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    }

    if (left + MENU_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING;
    }

    const availableHeight = shouldOpenAbove
      ? Math.max(120, buttonRect.top - VIEWPORT_PADDING - MENU_GAP)
      : Math.max(
          120,
          window.innerHeight - buttonRect.bottom - VIEWPORT_PADDING - MENU_GAP,
        );

    setMenuPosition({
      top,
      left,
      maxHeight: Math.min(320, availableHeight),
    });
  }

  function handleToggleMenu() {
    if (isUpdating) {
      return;
    }

    if (!menuOpen) {
      calculateMenuPosition();
    }

    setMenuOpen((current) => !current);
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    calculateMenuPosition();

    function handleClickOutside(event) {
      const clickedButton = buttonRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedButton && !clickedMenu) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function handleViewportChange() {
      calculateMenuPosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [menuOpen, isReceived]);

  async function handleStatusChange(status) {
    if (!canUpdate || isReceived || isUpdating) {
      return;
    }

    try {
      setMenuOpen(false);
      setIsUpdating(true);
      setError("");

      const result = await updatePurchaseStatus(purchase.id, status);

      if (!result?.success) {
        setError(result?.message || "Statusi nuk mund të ndryshohej.");
      }
    } catch (statusError) {
      console.error(statusError);

      setError("Ndodhi një gabim gjatë ndryshimit të statusit.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (!hasAvailableActions) {
    return null;
  }

  const menuContent = menuOpen ? (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[9999] w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        maxHeight: `${menuPosition.maxHeight}px`,
      }}
    >
      {!isReceived ? (
        <>
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
                Edito porosinë
              </button>

              <div className="my-1 border-t border-slate-100" />

              {purchase.status !== "PENDING" && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleStatusChange("PENDING")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  <Clock3 size={16} />
                  Kalo në pritje
                </button>
              )}

              {purchase.status !== "ORDERED" && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleStatusChange("ORDERED")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  <PackageCheck size={16} />
                  Shëno si të porositur
                </button>
              )}

              {purchase.status !== "CANCELLED" && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleStatusChange("CANCELLED")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Ban size={16} />
                  Anulo porosinë
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
              Fshi porosinë
            </button>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-950">
                Porosia është marrë në magazinë
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                Kjo porosi është përfunduar dhe nuk mund të editohet, fshihet
                ose t’i ndryshohet statusi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleMenu}
        disabled={isUpdating}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Veprimet për porosinë ${purchase.supplier || ""}`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        {isUpdating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <MoreHorizontal size={18} />
        )}
      </button>

      {mounted && menuContent && createPortal(menuContent, document.body)}

      {error &&
        mounted &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[10000] max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
                className="font-bold text-red-500 transition hover:text-red-700"
                aria-label="Mbyll gabimin"
              >
                ×
              </button>
            </div>
          </div>,
          document.body,
        )}

      {canUpdate && editOpen && (
        <EditPurchaseModal
          purchase={purchase}
          onClose={() => setEditOpen(false)}
        />
      )}

      {canDelete && deleteOpen && (
        <DeletePurchaseModal
          purchase={purchase}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
