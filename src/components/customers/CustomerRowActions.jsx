"use client";

import { useEffect, useRef, useState } from "react";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import DeleteCustomerModal from "@/components/customers/DeleteCustomerModal";
import EditCustomerModal from "@/components/customers/EditCustomerModal";

export default function CustomerRowActions({
  customer,
  canUpdate = false,
  canDelete = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  function openEditModal() {
    if (!canUpdate) {
      return;
    }

    setMenuOpen(false);
    setEditOpen(true);
  }

  function openDeleteModal() {
    if (!canDelete) {
      return;
    }

    setMenuOpen(false);
    setDeleteOpen(true);
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-800"
          aria-label={`Veprimet për ${customer.name}`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            {canUpdate && (
              <button
                type="button"
                role="menuitem"
                onClick={openEditModal}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Edit size={16} />
                Edito klientin
              </button>
            )}

            {canUpdate && canDelete && (
              <div className="my-1 border-t border-slate-100" />
            )}

            {canDelete && (
              <button
                type="button"
                role="menuitem"
                onClick={openDeleteModal}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
                Fshi klientin
              </button>
            )}
          </div>
        )}
      </div>

      {canUpdate && editOpen && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setEditOpen(false)}
        />
      )}

      {canDelete && deleteOpen && (
        <DeleteCustomerModal
          customer={customer}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
