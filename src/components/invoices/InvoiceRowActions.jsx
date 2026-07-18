"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  FilePenLine,
  FileText,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";

import { deleteInvoice, updateInvoiceStatus } from "@/actions/invoice-actions";

const statusOptions = [
  {
    value: "DRAFT",
    label: "Shëno si draft",
    icon: FileText,
  },
  {
    value: "UNPAID",
    label: "Shëno si të papaguar",
    icon: Clock3,
  },
  {
    value: "PAID",
    label: "Shëno si të paguar",
    icon: CheckCircle2,
  },
  {
    value: "OVERDUE",
    label: "Shëno si të vonuar",
    icon: XCircle,
  },
];

export default function InvoiceRowActions({ invoice, onEdit }) {
  const router = useRouter();
  const menuRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleStatusChange(status) {
    if (status === invoice.status) {
      setIsOpen(false);
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await updateInvoiceStatus(invoice.id, status);

      if (!result?.success) {
        setError(result?.message || "Statusi i faturës nuk u ndryshua.");
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `A je i sigurt që dëshiron të fshish faturën ${invoice.number || ""}?`,
    );

    if (!confirmed) return;

    setError("");

    startTransition(async () => {
      const result = await deleteInvoice(invoice.id);

      if (!result?.success) {
        setError(result?.message || "Fatura nuk u fshi.");
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  function handleEdit() {
    setIsOpen(false);

    if (typeof onEdit === "function") {
      onEdit(invoice);
    }
  }

  return (
    <div ref={menuRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => {
          setError("");
          setIsOpen((current) => !current);
        }}
        disabled={isPending}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Veprime
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
              {error}
            </div>
          )}

          <div className="p-2">
            <button
              type="button"
              onClick={handleEdit}
              disabled={isPending || typeof onEdit !== "function"}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FilePenLine className="h-4 w-4 text-slate-500" />
              Modifiko faturën
            </button>

            <div className="my-2 border-t border-slate-100" />

            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ndrysho statusin
            </p>

            {statusOptions.map((option) => {
              const Icon = option.icon;

              const isActive = invoice.status === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusChange(option.value)}
                  disabled={isPending || isActive}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-blue-600" : "text-slate-500"
                      }`}
                    />

                    {option.label}
                  </span>

                  {isActive && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              );
            })}

            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Fshi faturën
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
