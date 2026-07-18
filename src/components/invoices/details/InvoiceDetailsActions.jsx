"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FilePenLine,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";

import EditInvoiceModal from "@/components/invoices/EditInvoiceModal";
import { updateInvoiceStatus } from "@/actions/invoice-actions";

const statusOptions = [
  {
    value: "DRAFT",
    label: "Draft",
    icon: FileText,
  },
  {
    value: "UNPAID",
    label: "E papaguar",
    icon: Clock3,
  },
  {
    value: "PAID",
    label: "E paguar",
    icon: CheckCircle2,
  },
  {
    value: "OVERDUE",
    label: "E vonuar",
    icon: XCircle,
  },
];

export default function InvoiceDetailsActions({
  invoice,
  customers = [],
  vehicles = [],
  services = [],
}) {
  const router = useRouter();
  const menuRef = useRef(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleStatusChange(status) {
    if (status === invoice.status) {
      setIsStatusOpen(false);
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await updateInvoiceStatus(invoice.id, status);

      if (!result?.success) {
        setError(
          result?.message || "Statusi i faturës nuk mund të ndryshohej.",
        );

        return;
      }

      setIsStatusOpen(false);
      router.refresh();
    });
  }

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

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setError("");
              setIsStatusOpen((current) => !current);
            }}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Ndrysho statusin
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>

          {isStatusOpen && (
            <div className="absolute right-0 top-13 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              {error && (
                <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                  {error}
                </div>
              )}

              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Statusi i faturës
              </p>

              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isActive = invoice.status === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isPending || isActive}
                    onClick={() => handleStatusChange(option.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-700"
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
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <FilePenLine className="h-4 w-4" />
          Modifiko faturën
        </button>
      </div>

      {error && !isStatusOpen && (
        <div className="fixed bottom-6 right-6 z-[110] max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-xl">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

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
