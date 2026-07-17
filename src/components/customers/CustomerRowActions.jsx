"use client";

import { useEffect, useRef, useState } from "react";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import EditCustomerModal from "@/components/customers/EditCustomerModal";
import DeleteCustomerModal from "@/components/customers/DeleteCustomerModal";

export default function CustomerRowActions({ customer }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const menuRef = useRef(null);

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
    setMenuOpen(false);
    setEditOpen(true);
  }

  function openDeleteModal() {
    setMenuOpen(false);
    setDeleteOpen(true);
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-800"
          aria-label={`Veprimet për ${customer.name}`}
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <button
              type="button"
              onClick={openEditModal}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Edit size={16} />
              Edito klientin
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={openDeleteModal}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Fshi klientin
            </button>
          </div>
        )}
      </div>

      {editOpen && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setEditOpen(false)}
        />
      )}

      {deleteOpen && (
        <DeleteCustomerModal
          customer={customer}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
