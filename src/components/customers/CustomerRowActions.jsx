"use client";

import { useState } from "react";
import { Edit, MoreHorizontal } from "lucide-react";
import EditCustomerModal from "@/components/customers/EditCustomerModal";

export default function CustomerRowActions({ customer }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
      >
        <MoreHorizontal size={18} className="text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <button
            onClick={() => {
              setEditOpen(true);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Edit size={16} />
            Edito klientin
          </button>
        </div>
      )}

      {editOpen && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
