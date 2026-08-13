"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, ReceiptText, Trash2, X } from "lucide-react";

import {
  deleteExpenseAction,
  updateExpenseAction,
} from "@/app/dashboard/finance/actions";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/ToastProvider";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50";

export default function ExpenseRowActions({ expense, categories = [] }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    formData.set("expenseId", expense.id);

    startTransition(async () => {
      const result = await updateExpenseAction(formData);

      if (!result?.success) {
        setMessage(result?.message || "Shpenzimi nuk u përditësua.");
        return;
      }

      toast.success(result.message || "Shpenzimi u përditësua.");
      setIsOpen(false);
      router.refresh();
    });
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Fshi shpenzimin",
      description: `Shpenzimi “${expense.description}” do të fshihet përfundimisht.`,
      confirmLabel: "Fshi shpenzimin",
      tone: "danger",
    });

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteExpenseAction(expense.id);

      if (!result?.success) {
        toast.error(result?.message || "Shpenzimi nuk mund të fshihej.");
        return;
      }

      toast.success(result.message || "Shpenzimi u fshi.");
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setIsOpen(true);
          }}
          disabled={isPending}
          aria-label="Edito shpenzimin"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Fshi shpenzimin"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Mbyll modalin"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ReceiptText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Edito shpenzimin</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Përditëso të dhënat e transaksionit.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="overflow-y-auto px-6 py-5">
                {message ? (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {message}
                  </div>
                ) : null}

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Përshkrimi</span>
                    <input name="description" required defaultValue={expense.description} className={inputClass} />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Shuma</span>
                    <input name="amount" type="number" min="0.01" step="0.01" required defaultValue={expense.amount} className={inputClass} />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Data</span>
                    <input name="expenseDate" type="date" required defaultValue={expense.expenseDate} className={inputClass} />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Mënyra e pagesës</span>
                    <select name="paymentMethod" defaultValue={expense.paymentMethod} className={inputClass}>
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Transfertë bankare</option>
                      <option value="CARD">Kartë</option>
                      <option value="OTHER">Tjetër</option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Kategoria</span>
                    <select name="categoryId" defaultValue={expense.categoryId || ""} className={inputClass}>
                      <option value="">Pa kategori</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Kategori e re</span>
                    <input name="newCategory" placeholder="Opsionale" className={inputClass} />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Furnitori</span>
                    <input name="supplier" defaultValue={expense.supplier || ""} className={inputClass} />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Nr. dokumenti</span>
                    <input name="documentNumber" defaultValue={expense.documentNumber || ""} className={inputClass} />
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Shënime</span>
                    <textarea name="notes" rows={3} defaultValue={expense.notes || ""} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button type="button" onClick={() => setIsOpen(false)} disabled={isPending} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700">
                  Anulo
                </button>
                <button type="submit" disabled={isPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                  Ruaj ndryshimet
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
