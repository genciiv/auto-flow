"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FilePenLine } from "lucide-react";

import EditInvoiceModal from "@/components/invoices/EditInvoiceModal";

export default function InvoiceDetailsActions({
  invoice,
  customers = [],
  vehicles = [],
  services = [],
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/invoices"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kthehu te faturat
        </Link>

        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <FilePenLine className="h-4 w-4" />
          Modifiko faturën
        </button>
      </div>

      {isEditOpen && (
        <EditInvoiceModal
          key={invoice.id}
          invoice={invoice}
          customers={customers}
          vehicles={vehicles}
          services={services}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
